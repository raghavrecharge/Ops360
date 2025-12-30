from typing import List, Optional
from fastapi import HTTPException, status
from app.repositories.campaign_repo import CampaignRepository
from app.schemas.campaign import (
    CampaignCreate, CampaignUpdate, CampaignResponse, CampaignAssignment
)

class CampaignService:
    def __init__(self):
        self.campaign_repo = CampaignRepository()
    
    async def create_campaign(self, campaign_data: CampaignCreate) -> CampaignResponse:
        """Create a new campaign"""
        data = campaign_data.model_dump()
        data["status"] = "planning"
        
        campaign = await self.campaign_repo.create(data)
        return CampaignResponse(**campaign)
    
    async def get_campaign(self, campaign_id: str) -> CampaignResponse:
        """Get campaign by ID"""
        campaign = await self.campaign_repo.get_by_id(campaign_id)
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        return CampaignResponse(**campaign)
    
    async def get_all_campaigns(self) -> List[CampaignResponse]:
        """Get all campaigns"""
        campaigns = await self.campaign_repo.get_all()
        return [CampaignResponse(**c) for c in campaigns]
    
    async def update_campaign(self, campaign_id: str, update_data: CampaignUpdate) -> CampaignResponse:
        """Update campaign"""
        data = update_data.model_dump(exclude_unset=True)
        
        campaign = await self.campaign_repo.update(campaign_id, data)
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        return CampaignResponse(**campaign)
    
    async def assign_resources(self, assignment: CampaignAssignment):
        """Assign vehicles, drivers, and promoters to campaign"""
        # This would involve creating assignment records
        # Simplified for MVP
        pass
