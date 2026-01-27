from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repo import BaseRepository
from app.models.vehicle import Vehicle

class VehicleRepository(BaseRepository):
    def __init__(self):
        super().__init__(Vehicle)
    
    async def get_active_vehicles(self, db: AsyncSession):
        """Get all active vehicles"""
        return await self.get_all(db, {"is_active": True})
    
    async def get_by_vendor(self, db: AsyncSession, vendor_id: int):
        """Get vehicles by vendor ID"""
        query = select(Vehicle).where(
            Vehicle.vendor_id == vendor_id,
            Vehicle.is_active == True
        )
        result = await db.execute(query)
        return result.scalars().all()
