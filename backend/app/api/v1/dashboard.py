from fastapi import APIRouter, Depends
from app.schemas.analytics import DashboardStats
from app.services.dashboard_service import DashboardService
from app.core.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    service = DashboardService()
    return await service.get_dashboard_stats()
