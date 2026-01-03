from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from app.repositories.driver_repo import DriverRepository
from app.core.security import get_current_user
from app.database.connection import get_db
from app.core.permissions import Permission

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(
    driver_data: DriverCreate,
    current_user: dict = Depends(Permission.require_operations())
):
    """Create a new driver"""
    repo = DriverRepository()
    driver = await repo.create(driver_data.model_dump())
    return DriverResponse(**driver)

@router.get("", response_model=List[DriverResponse])
async def get_drivers(db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get all drivers"""
    repo = DriverRepository()
    drivers = await repo.get_active_drivers()
    return [DriverResponse(**d) for d in drivers]

@router.get("/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: str, db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get driver by ID"""
    repo = DriverRepository()
    driver = await repo.get_by_id(driver_id)
    
    if not driver:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return DriverResponse(**driver)
