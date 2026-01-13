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
    # New fields
    company_website: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    specifications: Optional[str] = None
    designation: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    # New fields
    company_website: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    specifications: Optional[str] = None
    designation: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class VendorResponse(VendorBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
