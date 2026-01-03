from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.repositories.client_repo import ClientRepository
from app.core.security import get_current_user
from app.core.permissions import Permission
from app.database.connection import get_db

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_data: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(Permission.require_roles(["admin", "client_servicing"]))
):
    """Create a new client"""
    repo = ClientRepository()
    client = await repo.create(db, client_data.model_dump())
    return ClientResponse.model_validate(client)

@router.get("", response_model=List[ClientResponse])
async def get_clients(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all clients"""
    repo = ClientRepository()
    clients = await repo.get_active_clients(db)
    return [ClientResponse.model_validate(c) for c in clients]

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get client by ID"""
    repo = ClientRepository()
    client = await repo.get_by_id(db, client_id)
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return ClientResponse.model_validate(client)
