from datetime import date
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repo import BaseRepository
from app.models.expense import Expense

class ExpenseRepository(BaseRepository):
    def __init__(self):
        super().__init__(Expense)
    
    async def get_by_campaign(self, db: AsyncSession, campaign_id: int):
        """Get expenses by campaign ID"""
        query = select(Expense).where(Expense.campaign_id == campaign_id)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_by_status(self, db: AsyncSession, status: str):
        """Get expenses by status"""
        return await self.get_all(db, {"status": status})
    
    async def get_pending_expenses(self, db: AsyncSession):
        """Get pending expenses"""
        return await self.get_all(db, {"status": "pending"})
    
    async def get_todays_total(self, db: AsyncSession) -> float:
        """Get today's total expenses"""
        today = date.today()
        query = select(func.sum(Expense.amount)).where(
            Expense.submitted_date == today
        )
        result = await db.execute(query)
        total = result.scalar()
        return float(total) if total else 0.0
