from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class VendorBase(BaseModel):
    name: str
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None

class VendorResponse(VendorBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
