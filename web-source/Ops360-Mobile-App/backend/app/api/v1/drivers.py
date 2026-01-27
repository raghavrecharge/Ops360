from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse, DriverDetailResponse
from app.repositories.driver_repo import DriverRepository
from app.repositories.vehicle_repo import VehicleRepository
from app.core.security import get_current_user
from app.database.connection import get_db
from app.core.permissions import Permission

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(
    driver_data: DriverCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new driver"""
    repo = DriverRepository()
    driver = await repo.create(db, driver_data.model_dump(exclude_none=True))
    return DriverResponse.model_validate(driver)

@router.get("", response_model=List[DriverResponse])
async def get_drivers(
    vendor_id: Optional[int] = Query(None, description="Filter by vendor"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all drivers with optional vendor filter"""
    repo = DriverRepository()
    if vendor_id:
        drivers = await repo.get_by_vendor(db, vendor_id)
    else:
        drivers = await repo.get_active_drivers(db)
    return [DriverResponse.model_validate(d) for d in drivers]

@router.get("/{driver_id}", response_model=DriverDetailResponse)
async def get_driver(
    driver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get driver by ID with detailed info"""
    repo = DriverRepository()
    driver = await repo.get_by_id(db, driver_id)
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return DriverDetailResponse.model_validate(driver)

@router.put("/{driver_id}", response_model=DriverResponse)
async def update_driver(
    driver_id: int,
    driver_data: DriverUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update driver information"""
    repo = DriverRepository()
    driver = await repo.get_by_id(db, driver_id)
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    update_data = driver_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    updated_driver = await repo.update(db, driver_id, update_data)
    return DriverResponse.model_validate(updated_driver)

@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_driver(
    driver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete (deactivate) a driver"""
    repo = DriverRepository()
    driver = await repo.get_by_id(db, driver_id)
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    await repo.delete(db, driver_id)
    return None

@router.post("/{driver_id}/assign-vehicle/{vehicle_id}", response_model=DriverResponse)
async def assign_vehicle_to_driver(
    driver_id: int,
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Assign a vehicle to a driver"""
    driver_repo = DriverRepository()
    vehicle_repo = VehicleRepository()
    
    driver = await driver_repo.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    vehicle = await vehicle_repo.get_by_id(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    updated_driver = await driver_repo.update(db, driver_id, {"assigned_vehicle_id": vehicle_id})
    return DriverResponse.model_validate(updated_driver)
