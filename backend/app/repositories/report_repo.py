from app.repositories.base_repo import BaseRepository

class ReportRepository(BaseRepository):
    def __init__(self):
        super().__init__("reports")
    
    async def get_by_campaign(self, campaign_id: str):
        """Get reports by campaign ID"""
        return await self.get_all({"campaign_id": campaign_id})
