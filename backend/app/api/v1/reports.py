from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.report import ReportCreate, ReportResponse
from app.repositories.report_repo import ReportRepository
from app.core.security import get_current_user
from app.database.connection import get_db
from app.core.permissions import Permission

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(Permission.require_operations())
):
    """Create a new report"""
    repo = ReportRepository()
    report = await repo.create(db, report_data.model_dump())
    return ReportResponse.model_validate(report)

@router.get("", response_model=List[ReportResponse])
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all reports"""
    repo = ReportRepository()
    reports = await repo.get_all(db)
    return [ReportResponse.model_validate(r) for r in reports]

@router.get("/campaign/{campaign_id}", response_model=List[ReportResponse])
async def get_campaign_reports(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get reports for a specific campaign"""
    repo = ReportRepository()
    reports = await repo.get_by_campaign(db, campaign_id)
    return [ReportResponse.model_validate(r) for r in reports]
