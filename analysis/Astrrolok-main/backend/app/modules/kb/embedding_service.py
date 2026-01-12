"""
KB Embedding Service
Handles text embedding generation and FAISS index management
"""
import os
import pickle
import numpy as np
from typing import List, Tuple, Optional
from pathlib import Path
import faiss

from app.modules.llm.provider import get_llm_provider


class EmbeddingService:
    """Service for generating and managing text embeddings with FAISS"""
    
    def __init__(self, index_path: str = "/app/data/faiss_index"):
        self.llm = get_llm_provider()
        self.index_path = Path(index_path)
        self.index_path.mkdir(parents=True, exist_ok=True)
        
        self.dimension = 1536  # text-embedding-3-small dimension
        self.index: Optional[faiss.IndexFlatIP] = None  # Inner Product for cosine similarity
        self.chunk_ids: List[int] = []  # Maps index position to chunk_id
        
        self._load_or_create_index()
    
    def _load_or_create_index(self):
        """Load existing FAISS index or create new one"""
        index_file = self.index_path / "index.faiss"
        ids_file = self.index_path / "chunk_ids.pkl"
        
        if index_file.exists() and ids_file.exists():
            self.index = faiss.read_index(str(index_file))
            with open(ids_file, "rb") as f:
                self.chunk_ids = pickle.load(f)
        else:
            # Create new index with inner product (for cosine similarity with normalized vectors)
            self.index = faiss.IndexFlatIP(self.dimension)
            self.chunk_ids = []
    
    def _save_index(self):
        """Save FAISS index to disk"""
        index_file = self.index_path / "index.faiss"
        ids_file = self.index_path / "chunk_ids.pkl"
        
        faiss.write_index(self.index, str(index_file))
        with open(ids_file, "wb") as f:
            pickle.dump(self.chunk_ids, f)
    
    async def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text"""
        embedding = await self.llm.embed_single(text)
        arr = np.array(embedding, dtype=np.float32)
        # Normalize for cosine similarity
        faiss.normalize_L2(arr.reshape(1, -1))
        return arr
    
    async def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for multiple texts"""
        embeddings = await self.llm.embed(texts)
        arr = np.array(embeddings, dtype=np.float32)
        # Normalize for cosine similarity
        faiss.normalize_L2(arr)
        return arr
    
    async def add_chunks(self, chunk_ids: List[int], texts: List[str]):
        """Add chunks to the FAISS index"""
        if not texts:
            return
        
        embeddings = await self.generate_embeddings(texts)
        self.index.add(embeddings)
        self.chunk_ids.extend(chunk_ids)
        self._save_index()
    
    async def search(self, query: str, top_k: int = 5) -> List[Tuple[int, float]]:
        """
        Search for similar chunks
        Returns list of (chunk_id, similarity_score) tuples
        """
        if self.index.ntotal == 0:
            return []
        
        query_embedding = await self.generate_embedding(query)
        query_embedding = query_embedding.reshape(1, -1)
        
        # Search
        scores, indices = self.index.search(query_embedding, min(top_k, self.index.ntotal))
        
        results = []
        for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
            if idx >= 0 and idx < len(self.chunk_ids):
                results.append((self.chunk_ids[idx], float(score)))
        
        return results
    
    def remove_chunks(self, chunk_ids_to_remove: List[int]):
        """
        Remove chunks from index (requires rebuilding)
        This is expensive - use sparingly
        """
        # Filter out chunks to remove
        keep_mask = [cid not in chunk_ids_to_remove for cid in self.chunk_ids]
        
        if not any(keep_mask):
            # All removed, reset index
            self.index = faiss.IndexFlatIP(self.dimension)
            self.chunk_ids = []
            self._save_index()
            return
        
        # Get vectors to keep
        vectors = faiss.rev_swig_ptr(self.index.get_xb(), self.index.ntotal * self.dimension)
        vectors = vectors.reshape(self.index.ntotal, self.dimension)
        
        keep_vectors = vectors[keep_mask]
        keep_ids = [cid for cid, keep in zip(self.chunk_ids, keep_mask) if keep]
        
        # Rebuild index
        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(np.ascontiguousarray(keep_vectors))
        self.chunk_ids = keep_ids
        self._save_index()
    
    def get_stats(self) -> dict:
        """Get index statistics"""
        return {
            "total_vectors": self.index.ntotal,
            "dimension": self.dimension,
            "index_path": str(self.index_path)
        }


# Singleton instance
_embedding_service: Optional[EmbeddingService] = None

def get_embedding_service() -> EmbeddingService:
    """Get singleton embedding service instance"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
