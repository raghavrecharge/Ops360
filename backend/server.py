from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from datetime import date, datetime, timezone
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from auth import get_password_hash, verify_password, create_access_token, get_current_user, require_role
from database import get_db, init_db, Base, engine
from models import (
    User, Client, Project, Vendor, Vehicle, Driver, Promoter,
    Campaign, Expense, Report, Payment, CampaignStatus, CampaignType, PaymentStatus, ExpenseStatus
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Fleet Operations Management API")
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic Schemas
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class DashboardStats(BaseModel):
    active_projects: int
    running_campaigns: int
    vehicles_on_ground: int
    todays_expense: float
    pending_expenses: int
    pending_payments: int

# Auth Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_obj = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        is_active=True
    )
    
    db.add(user_obj)
    await db.commit()
    await db.refresh(user_obj)
    
    return user_obj

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    access_token = create_access_token(data={"user_id": user.id, "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# Dashboard
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    today = date.today()
    
    # Count active projects
    result = await db.execute(select(func.count(Project.id)).where(Project.status == "active"))
    active_projects = result.scalar() or 0
    
    # Count running campaigns
    result = await db.execute(select(func.count(Campaign.id)).where(Campaign.status == "running"))
    running_campaigns = result.scalar() or 0
    
    # Count active vehicles
    result = await db.execute(select(func.count(Vehicle.id)).where(Vehicle.is_active == True))
    vehicles_on_ground = result.scalar() or 0
    
    # Sum today's expenses
    result = await db.execute(
        select(func.sum(Expense.amount))
        .where(func.date(Expense.created_at) == today)
    )
    todays_expense = result.scalar() or 0
    
    # Count pending expenses
    result = await db.execute(select(func.count(Expense.id)).where(Expense.status == "pending"))
    pending_expenses = result.scalar() or 0
    
    # Count pending payments
    result = await db.execute(select(func.count(Payment.id)).where(Payment.status == "pending"))
    pending_payments = result.scalar() or 0
    
    return DashboardStats(
        active_projects=active_projects,
        running_campaigns=running_campaigns,
        vehicles_on_ground=vehicles_on_ground,
        todays_expense=float(todays_expense),
        pending_expenses=pending_expenses,
        pending_payments=pending_payments
    )

# Client Routes
@api_router.post("/clients")
async def create_client(name: str, company: Optional[str] = None, email: Optional[str] = None, phone: Optional[str] = None, address: Optional[str] = None, contact_person: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    client = Client(name=name, company=company, email=email, phone=phone, address=address, contact_person=contact_person, is_active=True)
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client

@api_router.get("/clients")
async def get_clients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).where(Client.is_active == True))
    return result.scalars().all()

@api_router.get("/clients/{client_id}")
async def get_client(client_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

# Project Routes
@api_router.post("/projects")
async def create_project(name: str, description: Optional[str] = None, client_id: int = None, budget: Optional[float] = None, start_date: Optional[date] = None, end_date: Optional[date] = None, assigned_cs: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    project = Project(name=name, description=description, client_id=client_id, budget=budget, start_date=start_date, end_date=end_date, assigned_cs=assigned_cs, status="active")
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@api_router.get("/projects")
async def get_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project))
    return result.scalars().all()

@api_router.get("/projects/{project_id}")
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Vendor Routes
@api_router.post("/vendors")
async def create_vendor(name: str, company: Optional[str] = None, email: Optional[str] = None, phone: Optional[str] = None, address: Optional[str] = None, contact_person: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    vendor = Vendor(name=name, company=company, email=email, phone=phone, address=address, contact_person=contact_person, is_active=True)
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor

@api_router.get("/vendors")
async def get_vendors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vendor).where(Vendor.is_active == True))
    return result.scalars().all()

@api_router.get("/vendors/{vendor_id}")
async def get_vendor(vendor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

# Vehicle Routes
@api_router.post("/vehicles")
async def create_vehicle(vehicle_number: str, vehicle_type: Optional[str] = None, capacity: Optional[str] = None, vendor_id: Optional[int] = None, rc_validity: Optional[date] = None, insurance_validity: Optional[date] = None, permit_validity: Optional[date] = None, db: AsyncSession = Depends(get_db)):
    vehicle = Vehicle(vehicle_number=vehicle_number, vehicle_type=vehicle_type, capacity=capacity, vendor_id=vendor_id, rc_validity=rc_validity, insurance_validity=insurance_validity, permit_validity=permit_validity, is_active=True)
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    return vehicle

@api_router.get("/vehicles")
async def get_vehicles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle).where(Vehicle.is_active == True))
    return result.scalars().all()

@api_router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

# Driver Routes
@api_router.post("/drivers")
async def create_driver(name: str, phone: Optional[str] = None, email: Optional[str] = None, license_number: Optional[str] = None, license_validity: Optional[date] = None, vendor_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    driver = Driver(name=name, phone=phone, email=email, license_number=license_number, license_validity=license_validity, vendor_id=vendor_id, is_active=True)
    db.add(driver)
    await db.commit()
    await db.refresh(driver)
    return driver

@api_router.get("/drivers")
async def get_drivers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Driver).where(Driver.is_active == True))
    return result.scalars().all()

@api_router.get("/drivers/{driver_id}")
async def get_driver(driver_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Driver).where(Driver.id == driver_id))
    driver = result.scalar_one_or_none()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

# Promoter Routes
@api_router.post("/promoters")
async def create_promoter(name: str, phone: Optional[str] = None, email: Optional[str] = None, specialty: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    promoter = Promoter(name=name, phone=phone, email=email, specialty=specialty, is_active=True)
    db.add(promoter)
    await db.commit()
    await db.refresh(promoter)
    return promoter

@api_router.get("/promoters")
async def get_promoters(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Promoter).where(Promoter.is_active == True))
    return result.scalars().all()

# Campaign Routes
@api_router.post("/campaigns")
async def create_campaign(name: str, project_id: int, campaign_type: str, description: Optional[str] = None, status: Optional[str] = None, start_date: Optional[date] = None, end_date: Optional[date] = None, budget: Optional[float] = None, locations: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    campaign = Campaign(name=name, project_id=project_id, campaign_type=campaign_type, description=description, status=status or "planning", start_date=start_date, end_date=end_date, budget=budget, locations=locations)
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign

@api_router.get("/campaigns")
async def get_campaigns(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign))
    return result.scalars().all()

@api_router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

# Expense Routes
@api_router.post("/expenses")
async def create_expense(campaign_id: Optional[int] = None, driver_id: Optional[int] = None, expense_type: Optional[str] = None, amount: float = None, description: Optional[str] = None, bill_url: Optional[str] = None, status: Optional[str] = None, submitted_date: Optional[date] = None, db: AsyncSession = Depends(get_db)):
    expense = Expense(campaign_id=campaign_id, driver_id=driver_id, expense_type=expense_type, amount=amount, description=description, bill_url=bill_url, status=status or "pending", submitted_date=submitted_date)
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense

@api_router.get("/expenses")
async def get_expenses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense))
    return result.scalars().all()

@api_router.patch("/expenses/{expense_id}/approve")
async def approve_expense(expense_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = "approved"
    expense.approved_date = date.today()
    
    db.add(expense)
    await db.commit()
    
    return {"message": "Expense approved"}

# Report Routes
@api_router.post("/reports")
async def create_report(campaign_id: int, report_date: date, locations_covered: Optional[str] = None, km_travelled: Optional[float] = None, photos_url: Optional[str] = None, gps_data: Optional[str] = None, notes: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    report = Report(campaign_id=campaign_id, report_date=report_date, locations_covered=locations_covered, km_travelled=km_travelled, photos_url=photos_url, gps_data=gps_data, notes=notes)
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report

@api_router.get("/reports")
async def get_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report))
    return result.scalars().all()

@api_router.get("/reports/campaign/{campaign_id}")
async def get_campaign_reports(campaign_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.campaign_id == campaign_id))
    return result.scalars().all()

app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fleet-operations-api"}

@app.on_event("startup")
async def startup():
    await init_db()
