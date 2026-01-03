from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.campaign_repo import CampaignRepository
from app.schemas.campaign import (
    CampaignCreate, CampaignUpdate, CampaignResponse, CampaignAssignment
)

class CampaignService:
    def __init__(self):
        self.campaign_repo = CampaignRepository()
    
    async def create_campaign(self, db: AsyncSession, campaign_data: CampaignCreate) -> CampaignResponse:
        """Create a new campaign"""
        data = campaign_data.model_dump()
        data["status"] = "planning"
        
        campaign = await self.campaign_repo.create(db, data)
        return CampaignResponse.model_validate(campaign)
    
    async def get_campaign(self, db: AsyncSession, campaign_id: int) -> CampaignResponse:
        """Get campaign by ID"""
        campaign = await self.campaign_repo.get_by_id(db, campaign_id)
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        return CampaignResponse.model_validate(campaign)
    
    async def get_all_campaigns(self, db: AsyncSession) -> List[CampaignResponse]:
        """Get all campaigns"""
        campaigns = await self.campaign_repo.get_all(db)
        return [CampaignResponse.model_validate(c) for c in campaigns]
    
    async def update_campaign(self, db: AsyncSession, campaign_id: int, update_data: CampaignUpdate) -> CampaignResponse:
        """Update campaign"""
        data = update_data.model_dump(exclude_unset=True)
        
        campaign = await self.campaign_repo.update(db, campaign_id, data)
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        return CampaignResponse.model_validate(campaign)
    
    async def assign_resources(self, db: AsyncSession, assignment: CampaignAssignment):
        """Assign vehicles, drivers, and promoters to campaign"""
        # This would involve creating assignment records
        # Simplified for MVP
        pass
