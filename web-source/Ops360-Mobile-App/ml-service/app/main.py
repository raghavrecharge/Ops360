from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from app.embeddings.encoder import EmbeddingEncoder
from app.vector_store.faiss_index import FAISSIndex
from app.rag.retriever import RAGRetriever

load_dotenv()

app = FastAPI(title="Fleet Operations ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
encoder = EmbeddingEncoder()
faiss_index = FAISSIndex()
rag_retriever = RAGRetriever(encoder, faiss_index)

class DocumentInput(BaseModel):
    content: str
    doc_type: str
    campaign_id: Optional[int] = None
    metadata: Optional[dict] = None

class QueryInput(BaseModel):
    query: str
    top_k: int = 5

class InsightRequest(BaseModel):
    campaign_id: Optional[int] = None
    query_type: str

@app.post("/embed/add")
async def add_document(doc: DocumentInput):
    """Add document to vector store"""
    try:
        embedding = encoder.encode(doc.content)
        
        metadata = {
            "content": doc.content,
            "doc_type": doc.doc_type,
            "campaign_id": doc.campaign_id,
            "metadata": doc.metadata or {}
        }
        
        faiss_index.add_embedding(embedding, metadata)
        
        return {
            "message": "Document added successfully",
            "index_size": faiss_index.get_size()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_similar(query: QueryInput):
    """Search for similar documents"""
    try:
        results = await rag_retriever.search(query.query, query.top_k)
        return {"results": results, "query": query.query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/insights/generate")
async def generate_insights(request: InsightRequest):
    """Generate AI insights"""
    try:
        insights = await rag_retriever.generate_insights(
            request.query_type,
            request.campaign_id
        )
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get ML service statistics"""
    return {
        "total_documents": faiss_index.get_size(),
        "model": encoder.model_name,
        "dimension": encoder.dimension
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-rag-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
