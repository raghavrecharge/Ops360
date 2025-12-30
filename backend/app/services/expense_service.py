from typing import List
from datetime import date
from fastapi import HTTPException, status
from app.repositories.expense_repo import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseStatus

class ExpenseService:
    def __init__(self):
        self.expense_repo = ExpenseRepository()
    
    async def create_expense(self, expense_data: ExpenseCreate) -> ExpenseResponse:
        """Create a new expense"""
        data = expense_data.model_dump()
        data["status"] = "pending"
        
        expense = await self.expense_repo.create(data)
        return ExpenseResponse(**expense)
    
    async def get_expense(self, expense_id: str) -> ExpenseResponse:
        """Get expense by ID"""
        expense = await self.expense_repo.get_by_id(expense_id)
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        return ExpenseResponse(**expense)
    
    async def get_all_expenses(self) -> List[ExpenseResponse]:
        """Get all expenses"""
        expenses = await self.expense_repo.get_all()
        return [ExpenseResponse(**e) for e in expenses]
    
    async def approve_expense(self, expense_id: str) -> ExpenseResponse:
        """Approve an expense"""
        update_data = {
            "status": ExpenseStatus.APPROVED.value,
            "approved_date": date.today().isoformat()
        }
        
        expense = await self.expense_repo.update(expense_id, update_data)
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        return ExpenseResponse(**expense)
    
    async def reject_expense(self, expense_id: str) -> ExpenseResponse:
        """Reject an expense"""
        update_data = {"status": ExpenseStatus.REJECTED.value}
        
        expense = await self.expense_repo.update(expense_id, update_data)
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        return ExpenseResponse(**expense)
