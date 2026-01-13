from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from app.repositories.driver_repo import DriverRepository
from app.database.connection import get_db
from app.core.role_permissions import Permission
from app.api.dependencies import require_permission, get_current_active_user

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(
    driver_data: DriverCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission(Permission.DRIVER_CREATE))
):
    """Create a new driver"""
    repo = DriverRepository()
    driver = await repo.create(db, driver_data.model_dump())
    created_driver = await repo.get_by_id(db, driver.id)
    return DriverResponse.model_validate(created_driver)

@router.get("", response_model=List[DriverResponse])
async def get_drivers(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission(Permission.DRIVER_READ))
):
    """Get all drivers (vendors see only their own)"""
    repo = DriverRepository()
    
    # Check if user is vendor - filter by their vendor_id
    user_role = current_user.get("role")
    user_vendor_id = current_user.get("vendor_id")
    
    if user_role == "vendor":
        # Vendor users see only their own drivers
        if not user_vendor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vendor user must be linked to a vendor"
            )
        drivers = await repo.get_by_vendor_async(db, user_vendor_id)
    else:
        # Admin and other roles see all drivers
        drivers = await repo.get_active_drivers(db)
    
    return [DriverResponse.model_validate(d) for d in drivers]

@router.get("/{driver_id}", response_model=DriverResponse)
async def get_driver(
    driver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission(Permission.DRIVER_READ))
):
    """Get driver by ID"""
    repo = DriverRepository()
    driver = await repo.get_by_id(db, driver_id)
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return DriverResponse.model_validate(driver)

@router.patch("/{driver_id}", response_model=DriverResponse)
@router.put("/{driver_id}", response_model=DriverResponse)
async def update_driver(
    driver_id: int,
    driver_data: DriverUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission(Permission.DRIVER_UPDATE))
):
    """Update driver by ID"""
    repo = DriverRepository()
    
    # Check if driver exists
    driver = await repo.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Update with only provided fields
    updated_driver = await repo.update(db, driver_id, driver_data.model_dump(exclude_unset=True))
    
    if not updated_driver:
        raise HTTPException(status_code=404, detail="Driver not found after update")
    
    return DriverResponse.model_validate(updated_driver)

@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_driver(
    driver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission(Permission.DRIVER_DELETE))
):
    """Delete driver by ID (soft delete)"""
    repo = DriverRepository()
    
    # Check if driver exists
    driver = await repo.get_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Soft delete
    await repo.delete(db, driver_id)
    return None
