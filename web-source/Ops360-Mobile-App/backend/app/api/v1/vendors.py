from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from app.repositories.vendor_repo import VendorRepository
from app.core.security import get_current_user
from app.database.connection import get_db
from app.core.permissions import Permission

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.post("", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    vendor_data: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(Permission.require_operations())
):
    """Create a new vendor"""
    repo = VendorRepository()
    vendor = await repo.create(db, vendor_data.model_dump())
    return VendorResponse.model_validate(vendor)

@router.get("", response_model=List[VendorResponse])
async def get_vendors(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all vendors"""
    repo = VendorRepository()
    vendors = await repo.get_active_vendors(db)
    return [VendorResponse.model_validate(v) for v in vendors]

@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get vendor by ID"""
    repo = VendorRepository()
    vendor = await repo.get_by_id(db, vendor_id)
    
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    return VendorResponse.model_validate(vendor)
