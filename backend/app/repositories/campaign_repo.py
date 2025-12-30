from app.repositories.base_repo import BaseRepository

class CampaignRepository(BaseRepository):
    def __init__(self):
        super().__init__("campaigns")
    
    async def get_by_project(self, project_id: str):
        """Get campaigns by project ID"""
        return await self.get_all({"project_id": project_id})
    
    async def get_by_status(self, status: str):
        """Get campaigns by status"""
        return await self.get_all({"status": status})
    
    async def get_running_campaigns(self):
        """Get running campaigns"""
        return await self.get_all({"status": "running"})
