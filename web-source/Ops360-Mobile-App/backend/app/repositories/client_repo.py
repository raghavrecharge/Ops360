from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repo import BaseRepository
from app.models.client import Client

class ClientRepository(BaseRepository):
    def __init__(self):
        super().__init__(Client)
    
    async def get_active_clients(self, db: AsyncSession):
        """Get all active clients"""
        return await self.get_all(db, {"is_active": True})
    
    async def search_by_name(self, db: AsyncSession, name: str):
        """Search clients by name"""
        query = select(Client).where(
            Client.name.ilike(f"%{name}%"),
            Client.is_active == True
        )
        result = await db.execute(query)
        return result.scalars().all()
