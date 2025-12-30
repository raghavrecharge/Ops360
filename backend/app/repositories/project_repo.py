from app.repositories.base_repo import BaseRepository

class ProjectRepository(BaseRepository):
    def __init__(self):
        super().__init__("projects")
    
    async def get_by_client(self, client_id: str):
        """Get projects by client ID"""
        return await self.get_all({"client_id": client_id})
    
    async def get_active_projects(self):
        """Get active projects"""
        return await self.get_all({"status": "active"})
