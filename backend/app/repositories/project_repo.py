from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repo import BaseRepository
from app.models.project import Project

class ProjectRepository(BaseRepository):
    def __init__(self):
        super().__init__(Project)
    
    async def get_by_client(self, db: AsyncSession, client_id: int):
        """Get projects by client ID"""
        query = select(Project).where(Project.client_id == client_id)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_active_projects(self, db: AsyncSession):
        """Get active projects"""
        return await self.get_all(db, {"status": "active"})
