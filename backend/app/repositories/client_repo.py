from app.repositories.base_repo import BaseRepository

class ClientRepository(BaseRepository):
    def __init__(self):
        super().__init__("clients")
    
    async def get_active_clients(self):
        """Get all active clients"""
        return await self.get_all({"is_active": True})
    
    async def search_by_name(self, name: str):
        """Search clients by name"""
        pattern = {"$regex": name, "$options": "i"}
        return await self.get_all({"name": pattern, "is_active": True})
