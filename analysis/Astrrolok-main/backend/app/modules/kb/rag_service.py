"""
RAG Service
Retrieval-Augmented Generation for answering questions with citations
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.kb import KBSource, KBChunk
from app.models.chat import ChatSession, ChatMessage
from app.modules.kb.embedding_service import get_embedding_service
from app.modules.llm.provider import get_llm_provider


class RAGService:
    """Service for RAG-based question answering"""
    
    def __init__(self, db: Session):
        self.db = db
        self.embedding_service = get_embedding_service()
        self.llm = get_llm_provider()
    
    async def retrieve_context(
        self, 
        query: str, 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant chunks for a query"""
        results = await self.embedding_service.search(query, top_k=top_k)
        
        contexts = []
        for chunk_id, score in results:
            chunk = self.db.query(KBChunk).filter(KBChunk.id == chunk_id).first()
            if chunk:
                source = self.db.query(KBSource).filter(KBSource.id == chunk.source_id).first()
                contexts.append({
                    "chunk_id": chunk.id,
                    "content": chunk.content,
                    "score": score,
                    "source_id": chunk.source_id,
                    "source_name": source.filename if source else "Unknown",
                    "page_number": chunk.page_number,
                    "section": chunk.section
                })
        
        return contexts
    
    def format_context_for_prompt(self, contexts: List[Dict]) -> str:
        """Format retrieved contexts for the LLM prompt"""
        if not contexts:
            return "No relevant information found in the knowledge base."
        
        formatted = []
        for i, ctx in enumerate(contexts, 1):
            source_info = f"[Source: {ctx['source_name']}"
            if ctx.get('page_number'):
                source_info += f", Page {ctx['page_number']}"
            if ctx.get('section'):
                source_info += f", Section: {ctx['section']}"
            source_info += "]"
            
            formatted.append(f"[{i}] {source_info}\n{ctx['content']}")
        
        return "\n\n".join(formatted)
    
    def extract_citations(self, contexts: List[Dict]) -> List[Dict]:
        """Extract citation information from contexts"""
        citations = []
        for i, ctx in enumerate(contexts, 1):
            citations.append({
                "index": i,
                "chunk_id": ctx["chunk_id"],
                "source_id": ctx["source_id"],
                "source_name": ctx["source_name"],
                "page_number": ctx.get("page_number"),
                "section": ctx.get("section"),
                "relevance_score": round(ctx["score"], 3)
            })
        return citations
    
    async def answer_question(
        self,
        question: str,
        session_id: Optional[int] = None,
        profile_id: Optional[int] = None,
        astro_context: Optional[Dict] = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """Answer a question using RAG"""
        
        # Retrieve relevant context
        contexts = await self.retrieve_context(question, top_k=top_k)
        formatted_context = self.format_context_for_prompt(contexts)
        citations = self.extract_citations(contexts)
        
        # Build system message
        system_message = """You are an expert Vedic astrology assistant with deep knowledge of:
- Parashara's Brihat Parashara Hora Shastra
- Yogas, doshas, and planetary combinations
- Dasha systems and timing of events
- Remedial measures (gemstones, mantras, rituals)
- Chart interpretation and prediction methodologies

Use the provided knowledge base context to answer questions accurately.
Always cite your sources using [1], [2], etc. when referencing specific information.
If the context doesn't contain relevant information, say so clearly.
Be precise and helpful in your explanations."""

        # Build user message with context
        user_message = f"""Context from Knowledge Base:
{formatted_context}

Question: {question}

Please provide a comprehensive answer based on the context above. Use citations [1], [2], etc. to reference sources."""

        # Add astro context if available
        if astro_context:
            user_message += f"\n\nAdditional astrological context for the querying user:\n{astro_context}"

        # Generate response
        messages = [{"role": "user", "content": user_message}]
        response = await self.llm.chat(messages, system_message=system_message)
        
        # Store in chat history if session exists
        if session_id:
            self._save_message(session_id, "user", question, [], [])
            self._save_message(
                session_id, 
                "assistant", 
                response, 
                [ctx["chunk_id"] for ctx in contexts],
                citations,
                astro_context
            )
        
        return {
            "answer": response,
            "citations": citations,
            "retrieved_chunks": len(contexts),
            "has_context": len(contexts) > 0
        }
    
    def _save_message(
        self,
        session_id: int,
        role: str,
        content: str,
        retrieved_chunks: List[int],
        citations: List[Dict],
        astro_context: Dict = None
    ):
        """Save a message to chat history"""
        message = ChatMessage(
            session_id=session_id,
            role=role.upper(),
            content=content,
            retrieved_chunks=retrieved_chunks if retrieved_chunks else None,
            citations=citations if citations else None,
            astro_context=astro_context,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(message)
        self.db.commit()
    
    def create_session(self, user_id: int, profile_id: Optional[int] = None) -> ChatSession:
        """Create a new chat session"""
        session = ChatSession(
            user_id=user_id,
            profile_id=profile_id,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def get_session_history(self, session_id: int) -> List[Dict]:
        """Get chat history for a session"""
        messages = self.db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        return [
            {
                "id": m.id,
                "role": m.role.lower(),
                "content": m.content,
                "citations": m.citations,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in messages
        ]
    
    def get_user_sessions(self, user_id: int) -> List[Dict]:
        """Get all chat sessions for a user"""
        sessions = self.db.query(ChatSession).filter(
            ChatSession.user_id == user_id
        ).order_by(ChatSession.created_at.desc()).all()
        
        result = []
        for s in sessions:
            # Get first message as preview
            first_msg = self.db.query(ChatMessage).filter(
                ChatMessage.session_id == s.id,
                ChatMessage.role == "USER"
            ).first()
            
            result.append({
                "id": s.id,
                "profile_id": s.profile_id,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "preview": first_msg.content[:100] + "..." if first_msg and len(first_msg.content) > 100 else (first_msg.content if first_msg else "New conversation")
            })
        
        return result
    
    def delete_session(self, session_id: int, user_id: int) -> bool:
        """Delete a chat session"""
        session = self.db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id
        ).first()
        
        if not session:
            return False
        
        # Messages cascade delete
        self.db.delete(session)
        self.db.commit()
        return True
