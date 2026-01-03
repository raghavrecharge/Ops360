from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.report import ReportCreate, ReportResponse
from app.repositories.report_repo import ReportRepository
from app.core.security import get_current_user
from app.core.permissions import Permission

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    current_user: dict = Depends(Permission.require_operations())
):
    """Create a new report"""
    repo = ReportRepository()
    report = await repo.create(report_data.model_dump())
    return ReportResponse(**report)

@router.get("", response_model=List[ReportResponse])
async def get_reports(db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get all reports"""
    repo = ReportRepository()
    reports = await repo.get_all()
    return [ReportResponse(**r) for r in reports]

@router.get("/campaign/{campaign_id}", response_model=List[ReportResponse])
async def get_campaign_reports(campaign_id: str, db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get reports for a specific campaign"""
    repo = ReportRepository()
    reports = await repo.get_by_campaign(campaign_id)
    return [ReportResponse(**r) for r in reports]
