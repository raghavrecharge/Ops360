from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from app.database.connection import get_database
from app.database.base import doc_to_dict

class BaseRepository:
    """Base repository with common CRUD operations"""
    
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
    
    @property
    def collection(self):
        db = get_database()
        return db[self.collection_name]
    
    async def create(self, data: dict) -> dict:
        """Create a new document"""
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = datetime.now(timezone.utc)
        data["is_active"] = data.get("is_active", True)
        
        result = await self.collection.insert_one(data)
        data["id"] = str(result.inserted_id)
        data.pop("_id", None)
        return data
    
    async def get_by_id(self, id: str) -> Optional[dict]:
        """Get document by ID"""
        doc = await self.collection.find_one({"_id": ObjectId(id)})
        return doc_to_dict(doc) if doc else None
    
    async def get_all(self, filters: dict = None, limit: int = 1000) -> List[dict]:
        """Get all documents with optional filters"""
        filters = filters or {}
        cursor = self.collection.find(filters).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [doc_to_dict(doc) for doc in docs]
    
    async def update(self, id: str, data: dict) -> Optional[dict]:
        """Update document by ID"""
        data["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return None
        
        return await self.get_by_id(id)
    
    async def delete(self, id: str) -> bool:
        """Soft delete document by ID"""
        result = await self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
        )
        return result.matched_count > 0
    
    async def count(self, filters: dict = None) -> int:
        """Count documents"""
        filters = filters or {}
        return await self.collection.count_documents(filters)
