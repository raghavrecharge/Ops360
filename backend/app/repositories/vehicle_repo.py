from app.repositories.base_repo import BaseRepository

class VehicleRepository(BaseRepository):
    def __init__(self):
        super().__init__("vehicles")
    
    async def get_active_vehicles(self):
        """Get all active vehicles"""
        return await self.get_all({"is_active": True})
    
    async def get_by_vendor(self, vendor_id: str):
        """Get vehicles by vendor ID"""
        return await self.get_all({"vendor_id": vendor_id, "is_active": True})
