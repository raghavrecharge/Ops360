from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.services.expense_service import ExpenseService
from app.core.security import get_current_user
from app.core.permissions import Permission
from app.database.connection import get_db

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new expense"""
    service = ExpenseService()
    return await service.create_expense(db, expense_data)

@router.get("", response_model=List[ExpenseResponse])
async def get_expenses(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all expenses"""
    service = ExpenseService()
    return await service.get_all_expenses(db)

@router.patch("/{expense_id}/approve", response_model=ExpenseResponse)
async def approve_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(Permission.require_accounts())
):
    """Approve an expense"""
    service = ExpenseService()
    return await service.approve_expense(db, expense_id)

@router.patch("/{expense_id}/reject", response_model=ExpenseResponse)
async def reject_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(Permission.require_accounts())
):
    """Reject an expense"""
    service = ExpenseService()
    return await service.reject_expense(db, expense_id)


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get expense by ID"""
    service = ExpenseService()
    return await service.get_expense(db, expense_id)


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int,
    expense_data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing expense"""
    service = ExpenseService()
    data = expense_data.model_dump()
    return await service.update_expense(db, expense_id, data)
