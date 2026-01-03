from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repo import BaseRepository
from app.models.report import Report

class ReportRepository(BaseRepository):
    def __init__(self):
        super().__init__(Report)
    
    async def get_by_campaign(self, db: AsyncSession, campaign_id: int):
        """Get reports by campaign ID"""
        query = select(Report).where(Report.campaign_id == campaign_id)
        result = await db.execute(query)
        return result.scalars().all()
