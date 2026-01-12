from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from app.repositories.base_repo import BaseRepository
from app.models.vehicle import Vehicle

class VehicleRepository(BaseRepository):
    def __init__(self, db: Session = None):
        super().__init__(Vehicle)
        self.db = db
    
    async def get_active_vehicles(self, db: AsyncSession):
        """Get all active vehicles (async)"""
        return await self.get_all(db, {"is_active": True})
    
    async def get_by_vendor_async(self, db: AsyncSession, vendor_id: int):
        """Get vehicles by vendor ID (async)"""
        query = select(Vehicle).where(
            Vehicle.vendor_id == vendor_id,
            Vehicle.is_active == True
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    def get_all_sync(self):
        """Get all active vehicles (sync)"""
        return self.db.query(Vehicle).filter(Vehicle.is_active == True).all()
    
    def get_by_vendor(self, vendor_id: int):
        """Get vehicles by vendor ID (sync)"""
        return self.db.query(Vehicle).filter(
            Vehicle.vendor_id == vendor_id,
            Vehicle.is_active == True
        ).all()
