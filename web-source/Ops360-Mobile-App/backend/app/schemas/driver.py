from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class DriverBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    license_number: Optional[str] = None
    license_validity: Optional[date] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    vendor_id: Optional[int] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    license_number: Optional[str] = None
    license_validity: Optional[date] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    vendor_id: Optional[int] = None
    assigned_vehicle_id: Optional[int] = None

class DriverResponse(DriverBase):
    id: int
    is_active: bool
    created_at: datetime
    assigned_vehicle_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class DriverDetailResponse(DriverResponse):
    """Extended driver response with related data"""
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
