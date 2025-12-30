from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum

class ExpenseStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ExpenseBase(BaseModel):
    campaign_id: Optional[str] = None
    driver_id: Optional[str] = None
    expense_type: str
    amount: float
    description: Optional[str] = None
    bill_url: Optional[str] = None
    submitted_date: Optional[date] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    expense_type: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    bill_url: Optional[str] = None
    status: Optional[ExpenseStatus] = None

class ExpenseResponse(ExpenseBase):
    id: str
    status: ExpenseStatus
    approved_date: Optional[date]
    created_at: datetime
    
    class Config:
        from_attributes = True
