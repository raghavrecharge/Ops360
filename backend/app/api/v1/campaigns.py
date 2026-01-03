from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse
from app.services.campaign_service import CampaignService
from app.core.security import get_current_user
from app.core.permissions import Permission

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: dict = Depends(Permission.require_roles(["admin", "client_servicing", "operations_manager"]))
):
    """Create a new campaign"""
    service = CampaignService()
    return await service.create_campaign(campaign_data)

@router.get("", response_model=List[CampaignResponse])
async def get_campaigns(db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get all campaigns"""
    service = CampaignService()
    return await service.get_all_campaigns()

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get campaign by ID"""
    service = CampaignService()
    return await service.get_campaign(campaign_id)

@router.patch("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: str,
    update_data: CampaignUpdate,
    current_user: dict = Depends(Permission.require_operations())
):
    """Update campaign"""
    service = CampaignService()
    return await service.update_campaign(campaign_id, update_data)
