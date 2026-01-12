from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON, LargeBinary
from app.core.database import Base

class KBSource(Base):
    __tablename__ = "kb_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50))  # PDF, JSON, TXT
    file_size = Column(Integer)
    upload_date = Column(DateTime)
    ingestion_status = Column(String(50))  # PENDING, PROCESSING, COMPLETED, FAILED
    chunk_count = Column(Integer, default=0)
    error_message = Column(Text)

class KBChunk(Base):
    __tablename__ = "kb_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("kb_sources.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer)  # For PDFs
    section = Column(String(255))  # Section/heading if available
    created_at = Column(DateTime)

class KBEmbedding(Base):
    __tablename__ = "kb_embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(Integer, ForeignKey("kb_chunks.id"), nullable=False)
    embedding_vector = Column(LargeBinary)  # Stored as bytes (pickled numpy array)
    model_name = Column(String(100))
