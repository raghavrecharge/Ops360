from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    created_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(50))  # USER, ASSISTANT
    content = Column(Text, nullable=False)
    retrieved_chunks = Column(JSON)  # IDs of KB chunks retrieved
    citations = Column(JSON)  # List of {source, page, chunk_id}
    astro_context = Column(JSON)  # Chart/dasha/transit context used
    created_at = Column(DateTime)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")
