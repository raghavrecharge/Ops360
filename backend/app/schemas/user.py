from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserRegistration(UserBase):
    """Admin-only user registration with password confirmation"""
    password: str
    confirm_password: str
    vendor_id: Optional[int] = None
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: UserRole
    is_active: bool
    
    class Config:
        from_attributes = True
