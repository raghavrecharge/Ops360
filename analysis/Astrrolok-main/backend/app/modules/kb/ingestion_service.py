"""
KB Ingestion Service
Handles file upload, text extraction, chunking, and embedding
Supports PDF, JSON, and TXT files
"""
import os
import json
import hashlib
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pathlib import Path
import asyncio

from sqlalchemy.orm import Session
from pypdf import PdfReader

from app.models.kb import KBSource, KBChunk, KBEmbedding
from app.modules.kb.embedding_service import get_embedding_service


# File constraints
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
MAX_FILES_PER_ACCOUNT = 200
ALLOWED_EXTENSIONS = {".pdf", ".json", ".txt"}
CHUNK_SIZE = 1000  # Characters per chunk
CHUNK_OVERLAP = 200  # Overlap between chunks

UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class IngestionProgress:
    """Track ingestion progress"""
    
    def __init__(self, source_id: int):
        self.source_id = source_id
        self.status = "pending"
        self.total_chunks = 0
        self.processed_chunks = 0
        self.current_step = "Initializing"
        self.error = None
    
    @property
    def progress_percent(self) -> float:
        if self.total_chunks == 0:
            return 0.0
        return (self.processed_chunks / self.total_chunks) * 100
    
    def to_dict(self) -> dict:
        return {
            "source_id": self.source_id,
            "status": self.status,
            "total_chunks": self.total_chunks,
            "processed_chunks": self.processed_chunks,
            "progress_percent": round(self.progress_percent, 1),
            "current_step": self.current_step,
            "error": self.error
        }


# In-memory progress tracking (for async jobs)
_progress_tracker: Dict[int, IngestionProgress] = {}


def get_progress(source_id: int) -> Optional[IngestionProgress]:
    """Get ingestion progress for a source"""
    return _progress_tracker.get(source_id)


class IngestionService:
    """Service for KB file ingestion"""
    
    def __init__(self, db: Session):
        self.db = db
        self.embedding_service = get_embedding_service()
    
    def validate_file(
        self, 
        filename: str, 
        file_size: int, 
        user_id: int
    ) -> tuple[bool, str]:
        """Validate file before upload"""
        ext = Path(filename).suffix.lower()
        
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        
        if file_size > MAX_FILE_SIZE:
            return False, f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB"
        
        # Check user's file count
        existing_count = self.db.query(KBSource).count()
        if existing_count >= MAX_FILES_PER_ACCOUNT:
            return False, f"Maximum {MAX_FILES_PER_ACCOUNT} files allowed per account"
        
        return True, "OK"
    
    def create_source(
        self, 
        filename: str, 
        file_type: str, 
        file_size: int,
        user_id: int
    ) -> KBSource:
        """Create a new KB source record"""
        source = KBSource(
            filename=filename,
            file_type=file_type.upper(),
            file_size=file_size,
            upload_date=datetime.now(timezone.utc),
            ingestion_status="PENDING",
            chunk_count=0
        )
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        return source
    
    def save_file(self, source_id: int, file_content: bytes, filename: str) -> str:
        """Save uploaded file to disk"""
        ext = Path(filename).suffix.lower()
        safe_filename = f"{source_id}_{hashlib.md5(filename.encode()).hexdigest()[:8]}{ext}"
        file_path = UPLOAD_DIR / safe_filename
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        return str(file_path)
    
    def extract_text_from_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract text from PDF with page numbers"""
        reader = PdfReader(file_path)
        pages = []
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                pages.append({
                    "text": text,
                    "page_number": i + 1
                })
        
        return pages
    
    def extract_text_from_json(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract text from JSON file"""
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        pages = []
        
        def process_item(item: Any, section: str = "root"):
            if isinstance(item, dict):
                for key, value in item.items():
                    process_item(value, f"{section}.{key}")
            elif isinstance(item, list):
                for i, elem in enumerate(item):
                    process_item(elem, f"{section}[{i}]")
            elif isinstance(item, str) and item.strip():
                pages.append({
                    "text": item,
                    "section": section
                })
        
        process_item(data)
        return pages
    
    def extract_text_from_txt(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract text from TXT file"""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Split by double newlines to get paragraphs
        paragraphs = content.split("\n\n")
        pages = []
        
        for i, para in enumerate(paragraphs):
            if para.strip():
                pages.append({
                    "text": para.strip(),
                    "section": f"paragraph_{i+1}"
                })
        
        return pages if pages else [{"text": content, "section": "full"}]
    
    def chunk_text(self, text: str, metadata: dict = None) -> List[Dict[str, Any]]:
        """Split text into overlapping chunks"""
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            end = start + CHUNK_SIZE
            chunk_text = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk_text.rfind(".")
                last_newline = chunk_text.rfind("\n")
                break_point = max(last_period, last_newline)
                if break_point > CHUNK_SIZE // 2:
                    chunk_text = chunk_text[:break_point + 1]
                    end = start + break_point + 1
            
            if chunk_text.strip():
                chunk_data = {
                    "text": chunk_text.strip(),
                    "chunk_index": chunk_index
                }
                if metadata:
                    chunk_data.update(metadata)
                chunks.append(chunk_data)
                chunk_index += 1
            
            start = end - CHUNK_OVERLAP
            if start <= 0:
                start = end
        
        return chunks
    
    async def ingest_file(self, source_id: int, file_path: str):
        """Main ingestion pipeline - runs asynchronously"""
        progress = IngestionProgress(source_id)
        _progress_tracker[source_id] = progress
        
        try:
            # Get source
            source = self.db.query(KBSource).filter(KBSource.id == source_id).first()
            if not source:
                raise ValueError(f"Source {source_id} not found")
            
            source.ingestion_status = "PROCESSING"
            self.db.commit()
            progress.status = "processing"
            progress.current_step = "Extracting text"
            
            # Extract text based on file type
            file_type = source.file_type.upper()
            if file_type == "PDF":
                pages = self.extract_text_from_pdf(file_path)
            elif file_type == "JSON":
                pages = self.extract_text_from_json(file_path)
            elif file_type == "TXT":
                pages = self.extract_text_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            # Create chunks
            progress.current_step = "Chunking text"
            all_chunks = []
            for page in pages:
                text = page.pop("text")
                chunks = self.chunk_text(text, page)
                all_chunks.extend(chunks)
            
            progress.total_chunks = len(all_chunks)
            
            # Store chunks in DB
            progress.current_step = "Storing chunks"
            chunk_records = []
            for chunk_data in all_chunks:
                chunk = KBChunk(
                    source_id=source_id,
                    chunk_index=chunk_data["chunk_index"],
                    content=chunk_data["text"],
                    page_number=chunk_data.get("page_number"),
                    section=chunk_data.get("section"),
                    created_at=datetime.now(timezone.utc)
                )
                self.db.add(chunk)
                chunk_records.append(chunk)
            
            self.db.commit()
            for chunk in chunk_records:
                self.db.refresh(chunk)
            
            # Generate embeddings in batches
            progress.current_step = "Generating embeddings"
            batch_size = 20
            
            for i in range(0, len(chunk_records), batch_size):
                batch = chunk_records[i:i + batch_size]
                chunk_ids = [c.id for c in batch]
                texts = [c.content for c in batch]
                
                await self.embedding_service.add_chunks(chunk_ids, texts)
                
                progress.processed_chunks = min(i + batch_size, len(chunk_records))
                
                # Small delay to prevent overwhelming the API
                await asyncio.sleep(0.1)
            
            # Update source
            source.ingestion_status = "COMPLETED"
            source.chunk_count = len(chunk_records)
            self.db.commit()
            
            progress.status = "completed"
            progress.current_step = "Done"
            
        except Exception as e:
            # Update source with error
            source = self.db.query(KBSource).filter(KBSource.id == source_id).first()
            if source:
                source.ingestion_status = "FAILED"
                source.error_message = str(e)
                self.db.commit()
            
            progress.status = "failed"
            progress.error = str(e)
            progress.current_step = "Failed"
            raise
    
    def delete_source(self, source_id: int):
        """Delete a source and its chunks"""
        source = self.db.query(KBSource).filter(KBSource.id == source_id).first()
        if not source:
            return False
        
        # Get chunk IDs for index removal
        chunks = self.db.query(KBChunk).filter(KBChunk.source_id == source_id).all()
        chunk_ids = [c.id for c in chunks]
        
        # Remove from FAISS index
        if chunk_ids:
            self.embedding_service.remove_chunks(chunk_ids)
        
        # Delete chunks and source
        self.db.query(KBChunk).filter(KBChunk.source_id == source_id).delete()
        self.db.delete(source)
        self.db.commit()
        
        # Clean up progress tracker
        if source_id in _progress_tracker:
            del _progress_tracker[source_id]
        
        return True
    
    def get_source_status(self, source_id: int) -> Optional[dict]:
        """Get source status with progress info"""
        source = self.db.query(KBSource).filter(KBSource.id == source_id).first()
        if not source:
            return None
        
        result = {
            "id": source.id,
            "filename": source.filename,
            "file_type": source.file_type,
            "file_size": source.file_size,
            "upload_date": source.upload_date.isoformat() if source.upload_date else None,
            "status": source.ingestion_status,
            "chunk_count": source.chunk_count,
            "error": source.error_message
        }
        
        # Add progress info if available
        progress = get_progress(source_id)
        if progress:
            result["progress"] = progress.to_dict()
        
        return result
    
    def list_sources(self) -> List[dict]:
        """List all KB sources"""
        sources = self.db.query(KBSource).order_by(KBSource.upload_date.desc()).all()
        return [
            {
                "id": s.id,
                "filename": s.filename,
                "file_type": s.file_type,
                "file_size": s.file_size,
                "upload_date": s.upload_date.isoformat() if s.upload_date else None,
                "status": s.ingestion_status,
                "chunk_count": s.chunk_count
            }
            for s in sources
        ]
