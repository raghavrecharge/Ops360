from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum

class CampaignType(str, Enum):
    L_SHAPE = "l_shape"
    BTL = "btl"
    ROADSHOW = "roadshow"
    SAMPLING = "sampling"
    OTHER = "other"

class CampaignStatus(str, Enum):
    PLANNING = "planning"
    UPCOMING = "upcoming"
    RUNNING = "running"
    HOLD = "hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_id: str
    campaign_type: CampaignType
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    locations: Optional[str] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    campaign_type: Optional[CampaignType] = None
    status: Optional[CampaignStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    locations: Optional[str] = None

class CampaignResponse(CampaignBase):
    id: str
    status: CampaignStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class CampaignAssignment(BaseModel):
    campaign_id: str
    vehicle_ids: Optional[list[str]] = []
    driver_ids: Optional[list[str]] = []
    promoter_ids: Optional[list[str]] = []
