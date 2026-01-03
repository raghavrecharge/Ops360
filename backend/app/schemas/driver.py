from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class DriverBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    license_number: Optional[str] = None
    license_validity: Optional[date] = None
    vendor_id: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    license_number: Optional[str] = None
    license_validity: Optional[date] = None
    vendor_id: Optional[str] = None

class DriverResponse(DriverBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
