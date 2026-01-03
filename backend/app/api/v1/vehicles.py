from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.repositories.vehicle_repo import VehicleRepository
from app.core.security import get_current_user
from app.database.connection import get_db
from app.core.permissions import Permission

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    current_user: dict = Depends(Permission.require_operations())
):
    """Create a new vehicle"""
    repo = VehicleRepository()
    vehicle = await repo.create(vehicle_data.model_dump())
    return VehicleResponse(**vehicle)

@router.get("", response_model=List[VehicleResponse])
async def get_vehicles(db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get all vehicles"""
    repo = VehicleRepository()
    vehicles = await repo.get_active_vehicles()
    return [VehicleResponse(**v) for v in vehicles]

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    """Get vehicle by ID"""
    repo = VehicleRepository()
    vehicle = await repo.get_by_id(vehicle_id)
    
    if not vehicle:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return VehicleResponse(**vehicle)
