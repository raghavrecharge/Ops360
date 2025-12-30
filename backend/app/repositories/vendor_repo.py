from app.repositories.base_repo import BaseRepository

class VendorRepository(BaseRepository):
    def __init__(self):
        super().__init__("vendors")
    
    async def get_active_vendors(self):
        """Get all active vendors"""
        return await self.get_all({"is_active": True})
