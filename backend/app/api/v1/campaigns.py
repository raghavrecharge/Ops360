from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse
from app.services.campaign_service import CampaignService
from app.core.security import get_current_user
from app.core.permissions import Permission
from app.database.connection import get_db

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(Permission.require_roles(["admin", "client_servicing", "operations_manager"]))
):
    """Create a new campaign"""
    service = CampaignService()
    return await service.create_campaign(db, campaign_data)

@router.get("", response_model=List[CampaignResponse])
async def get_campaigns(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all campaigns"""
    service = CampaignService()
    return await service.get_all_campaigns(db)

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get campaign by ID"""
    service = CampaignService()
    return await service.get_campaign(db, campaign_id)

@router.patch("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: int,
    update_data: CampaignUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(Permission.require_operations())
):
    """Update campaign"""
    service = CampaignService()
    return await service.update_campaign(db, campaign_id, update_data)
