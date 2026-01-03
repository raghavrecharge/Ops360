from fastapi import APIRouter, Depends, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.repositories.base_repo import BaseRepository
from app.core.security import get_current_user
from app.core.permissions import Permission

router = APIRouter(prefix="/promoters", tags=["Promoters"])

class PromoterCreate(BaseModel):
    name: str
    phone: str = None
    email: EmailStr = None
    specialty: str = None

class PromoterResponse(BaseModel):
    id: str
    name: str
    phone: str = None
    email: str = None
    specialty: str = None
    is_active: bool
    created_at: datetime

@router.post("", response_model=PromoterResponse, status_code=status.HTTP_201_CREATED)
async def create_promoter(
    promoter_data: PromoterCreate,
    current_user: dict = Depends(Permission.require_operations())
):
    """Create a new promoter"""
    repo = BaseRepository("promoters")
    promoter = await repo.create(promoter_data.model_dump())
    return PromoterResponse(**promoter)

@router.get("", response_model=List[PromoterResponse])
async def get_promoters(current_user: dict = Depends(get_current_user)):
    """Get all promoters"""
    repo = BaseRepository("promoters")
    promoters = await repo.get_all({"is_active": True})
    return [PromoterResponse(**p) for p in promoters]
