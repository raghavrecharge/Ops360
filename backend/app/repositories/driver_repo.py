from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repo import BaseRepository
from app.models.driver import Driver

class DriverRepository(BaseRepository):
    def __init__(self):
        super().__init__(Driver)
    
    async def get_active_drivers(self, db: AsyncSession):
        """Get all active drivers"""
        return await self.get_all(db, {"is_active": True})
    
    async def get_by_vendor(self, db: AsyncSession, vendor_id: int):
        """Get drivers by vendor ID"""
        query = select(Driver).where(
            Driver.vendor_id == vendor_id,
            Driver.is_active == True
        )
        result = await db.execute(query)
        return result.scalars().all()
