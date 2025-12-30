from datetime import date
from app.repositories.base_repo import BaseRepository

class ExpenseRepository(BaseRepository):
    def __init__(self):
        super().__init__("expenses")
    
    async def get_by_campaign(self, campaign_id: str):
        """Get expenses by campaign ID"""
        return await self.get_all({"campaign_id": campaign_id})
    
    async def get_by_status(self, status: str):
        """Get expenses by status"""
        return await self.get_all({"status": status})
    
    async def get_pending_expenses(self):
        """Get pending expenses"""
        return await self.get_all({"status": "pending"})
    
    async def get_todays_total(self) -> float:
        """Get today's total expenses"""
        today = date.today().isoformat()
        pipeline = [
            {"$match": {"submitted_date": today}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        result = await self.collection.aggregate(pipeline).to_list(1)
        return result[0]["total"] if result else 0.0
