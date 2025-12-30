from fastapi import HTTPException, status
from app.repositories.client_repo import ClientRepository
from app.repositories.project_repo import ProjectRepository
from app.repositories.campaign_repo import CampaignRepository
from app.repositories.vehicle_repo import VehicleRepository
from app.repositories.expense_repo import ExpenseRepository
from app.schemas.analytics import DashboardStats

class DashboardService:
    def __init__(self):
        self.project_repo = ProjectRepository()
        self.campaign_repo = CampaignRepository()
        self.vehicle_repo = VehicleRepository()
        self.expense_repo = ExpenseRepository()
    
    async def get_dashboard_stats(self) -> DashboardStats:
        """Get dashboard statistics"""
        
        active_projects = await self.project_repo.count({"status": "active"})
        running_campaigns = await self.campaign_repo.count({"status": "running"})
        vehicles_on_ground = await self.vehicle_repo.count({"is_active": True})
        todays_expense = await self.expense_repo.get_todays_total()
        pending_expenses = await self.expense_repo.count({"status": "pending"})
        
        # Pending payments - simplified for now
        pending_payments = 0
        
        return DashboardStats(
            active_projects=active_projects,
            running_campaigns=running_campaigns,
            vehicles_on_ground=vehicles_on_ground,
            todays_expense=todays_expense,
            pending_expenses=pending_expenses,
            pending_payments=pending_payments
        )
