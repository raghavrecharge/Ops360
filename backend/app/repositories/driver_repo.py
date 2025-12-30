from app.repositories.base_repo import BaseRepository

class DriverRepository(BaseRepository):
    def __init__(self):
        super().__init__("drivers")
    
    async def get_active_drivers(self):
        """Get all active drivers"""
        return await self.get_all({"is_active": True})
    
    async def get_by_vendor(self, vendor_id: str):
        """Get drivers by vendor ID"""
        return await self.get_all({"vendor_id": vendor_id, "is_active": True})
