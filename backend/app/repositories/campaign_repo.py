from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repo import BaseRepository
from app.models.campaign import Campaign

class CampaignRepository(BaseRepository):
    def __init__(self):
        super().__init__(Campaign)
    
    async def get_by_project(self, db: AsyncSession, project_id: int):
        """Get campaigns by project ID"""
        query = select(Campaign).where(Campaign.project_id == project_id)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_status(self, db: AsyncSession, status: str):
        """Get campaigns by status"""
        return await self.get_all(db, {"status": status})
    
    async def get_running_campaigns(self, db: AsyncSession):
        """Get running campaigns"""
        return await self.get_all(db, {"status": "running"})
