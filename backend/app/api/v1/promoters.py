from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.repositories.base_repo import BaseRepository
from app.models.promoter import Promoter
from app.core.security import get_current_user
from app.database.connection import get_db
from app.core.permissions import Permission

router = APIRouter(prefix="/promoters", tags=["Promoters"])

class PromoterCreate(BaseModel):
    name: str
    phone: str = None
    email: EmailStr = None
    specialty: str = None

class PromoterResponse(BaseModel):
    id: int
    name: str
    phone: str = None
    email: str = None
    specialty: str = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("", response_model=PromoterResponse, status_code=status.HTTP_201_CREATED)
async def create_promoter(
    promoter_data: PromoterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(Permission.require_operations())
):
    """Create a new promoter"""
    repo = BaseRepository(Promoter)
    promoter = await repo.create(db, promoter_data.model_dump())
    return PromoterResponse.model_validate(promoter)

@router.get("", response_model=List[PromoterResponse])
async def get_promoters(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all promoters"""
    repo = BaseRepository(Promoter)
    promoters = await repo.get_all(db, {"is_active": True})
    return [PromoterResponse.model_validate(p) for p in promoters]
