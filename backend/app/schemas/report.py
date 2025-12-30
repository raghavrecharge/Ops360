from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ReportBase(BaseModel):
    campaign_id: str
    report_date: date
    locations_covered: Optional[str] = None
    km_travelled: Optional[float] = None
    photos_url: Optional[str] = None
    gps_data: Optional[str] = None
    notes: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    locations_covered: Optional[str] = None
    km_travelled: Optional[float] = None
    photos_url: Optional[str] = None
    gps_data: Optional[str] = None
    notes: Optional[str] = None

class ReportResponse(ReportBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
