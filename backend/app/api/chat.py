"""
Chat API Endpoints
RAG-powered chat with citations
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.modules.kb.rag_service import RAGService


router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None
    profile_id: Optional[int] = None


class CitationModel(BaseModel):
    index: int
    chunk_id: int
    source_id: int
    source_name: str
    page_number: Optional[int]
    section: Optional[str]
    relevance_score: float


class ChatResponse(BaseModel):
    answer: str
    citations: List[CitationModel]
    session_id: Optional[int]
    retrieved_chunks: int
    has_context: bool


class SessionResponse(BaseModel):
    id: int
    profile_id: Optional[int]
    created_at: Optional[str]
    preview: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    citations: Optional[List[dict]]
    created_at: Optional[str]


@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ask a question with RAG"""
    rag_service = RAGService(db)
    
    # Create session if not provided
    session_id = request.session_id
    if not session_id:
        session = rag_service.create_session(current_user.id, request.profile_id)
        session_id = session.id
    else:
        # Verify session belongs to user
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    
    # Get answer
    result = await rag_service.answer_question(
        question=request.message,
        session_id=session_id,
        profile_id=request.profile_id
    )
    
    return ChatResponse(
        answer=result["answer"],
        citations=[CitationModel(**c) for c in result["citations"]],
        session_id=session_id,
        retrieved_chunks=result["retrieved_chunks"],
        has_context=result["has_context"]
    )


@router.post("/sessions")
async def create_session(
    profile_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new chat session"""
    rag_service = RAGService(db)
    session = rag_service.create_session(current_user.id, profile_id)
    return {"session_id": session.id}


@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List user's chat sessions"""
    rag_service = RAGService(db)
    sessions = rag_service.get_user_sessions(current_user.id)
    return [SessionResponse(**s) for s in sessions]


@router.get("/sessions/{session_id}/history", response_model=List[MessageResponse])
async def get_session_history(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chat history for a session"""
    # Verify ownership
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    rag_service = RAGService(db)
    messages = rag_service.get_session_history(session_id)
    return [MessageResponse(**m) for m in messages]


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a chat session"""
    rag_service = RAGService(db)
    success = rag_service.delete_session(session_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}
