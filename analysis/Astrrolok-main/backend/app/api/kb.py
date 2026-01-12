"""
Knowledge Base API Endpoints
File upload, ingestion status, and management
"""
import asyncio
from datetime import datetime
from typing import List, Optional
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.kb import KBSource, KBChunk
from app.modules.kb.ingestion_service import (
    IngestionService, 
    get_progress,
    MAX_FILE_SIZE,
    MAX_FILES_PER_ACCOUNT,
    ALLOWED_EXTENSIONS
)
from app.modules.kb.embedding_service import get_embedding_service


router = APIRouter(prefix="/api/kb", tags=["knowledge-base"])


class SourceResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    upload_date: Optional[str]
    status: str
    chunk_count: int
    error: Optional[str] = None


class UploadResponse(BaseModel):
    source_id: int
    filename: str
    status: str
    message: str


class ProgressResponse(BaseModel):
    source_id: int
    status: str
    total_chunks: int
    processed_chunks: int
    progress_percent: float
    current_step: str
    error: Optional[str] = None


class StatsResponse(BaseModel):
    total_sources: int
    completed_sources: int
    total_chunks: int
    total_vectors: int
    max_files: int
    max_file_size_mb: int


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a file for KB ingestion"""
    service = IngestionService(db)
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Validate
    valid, message = service.validate_file(file.filename, file_size, current_user.id)
    if not valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Get file type
    ext = Path(file.filename).suffix.lower()
    file_type = ext[1:].upper()  # Remove dot
    
    # Create source record
    source = service.create_source(file.filename, file_type, file_size, current_user.id)
    
    # Save file
    file_path = service.save_file(source.id, content, file.filename)
    
    # Start async ingestion
    async def run_ingestion():
        try:
            await service.ingest_file(source.id, file_path)
        except Exception as e:
            print(f"Ingestion error for source {source.id}: {e}")
    
    background_tasks.add_task(asyncio.create_task, run_ingestion())
    
    return UploadResponse(
        source_id=source.id,
        filename=file.filename,
        status="PENDING",
        message="File uploaded. Ingestion started in background."
    )


@router.get("/sources", response_model=List[SourceResponse])
async def list_sources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all KB sources"""
    service = IngestionService(db)
    sources = service.list_sources()
    return [SourceResponse(**s) for s in sources]


@router.get("/sources/{source_id}", response_model=SourceResponse)
async def get_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific source"""
    service = IngestionService(db)
    source = service.get_source_status(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceResponse(**source)


@router.get("/sources/{source_id}/progress", response_model=ProgressResponse)
async def get_ingestion_progress(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get real-time ingestion progress"""
    progress = get_progress(source_id)
    
    if progress:
        return ProgressResponse(**progress.to_dict())
    
    # Check DB status if no active progress
    source = db.query(KBSource).filter(KBSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return ProgressResponse(
        source_id=source_id,
        status=source.ingestion_status.lower() if source.ingestion_status else "unknown",
        total_chunks=source.chunk_count or 0,
        processed_chunks=source.chunk_count or 0,
        progress_percent=100.0 if source.ingestion_status == "COMPLETED" else 0.0,
        current_step="Done" if source.ingestion_status == "COMPLETED" else source.ingestion_status,
        error=source.error_message
    )


@router.delete("/sources/{source_id}")
async def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a KB source and its chunks"""
    service = IngestionService(db)
    success = service.delete_source(source_id)
    if not success:
        raise HTTPException(status_code=404, detail="Source not found")
    return {"message": "Source deleted successfully"}


@router.get("/chunks/{source_id}")
async def get_chunks(
    source_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chunks for a source (paginated)"""
    chunks = db.query(KBChunk).filter(
        KBChunk.source_id == source_id
    ).offset(skip).limit(limit).all()
    
    total = db.query(KBChunk).filter(KBChunk.source_id == source_id).count()
    
    return {
        "chunks": [
            {
                "id": c.id,
                "chunk_index": c.chunk_index,
                "content": c.content[:200] + "..." if len(c.content) > 200 else c.content,
                "page_number": c.page_number,
                "section": c.section
            }
            for c in chunks
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/stats", response_model=StatsResponse)
async def get_kb_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get KB statistics"""
    total_sources = db.query(KBSource).count()
    completed_sources = db.query(KBSource).filter(KBSource.ingestion_status == "COMPLETED").count()
    total_chunks = db.query(KBChunk).count()
    
    embedding_service = get_embedding_service()
    stats = embedding_service.get_stats()
    
    return StatsResponse(
        total_sources=total_sources,
        completed_sources=completed_sources,
        total_chunks=total_chunks,
        total_vectors=stats["total_vectors"],
        max_files=MAX_FILES_PER_ACCOUNT,
        max_file_size_mb=MAX_FILE_SIZE // (1024 * 1024)
    )


@router.post("/search")
async def search_kb(
    query: str,
    top_k: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search the knowledge base"""
    embedding_service = get_embedding_service()
    results = await embedding_service.search(query, top_k=top_k)
    
    response = []
    for chunk_id, score in results:
        chunk = db.query(KBChunk).filter(KBChunk.id == chunk_id).first()
        if chunk:
            source = db.query(KBSource).filter(KBSource.id == chunk.source_id).first()
            response.append({
                "chunk_id": chunk.id,
                "content": chunk.content,
                "score": round(score, 3),
                "source": source.filename if source else "Unknown",
                "page_number": chunk.page_number,
                "section": chunk.section
            })
    
    return {"results": response, "query": query}
