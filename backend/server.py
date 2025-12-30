from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, datetime, timezone
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

from database import get_db, init_db
from models import (
    User, Client, Project, Vendor, Vehicle, Driver, Promoter,
    Campaign, Expense, Report, Payment, UserRole, ExpenseStatus, PaymentStatus
)
from schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    ClientCreate, ClientResponse, ProjectCreate, ProjectResponse,
    VendorCreate, VendorResponse, VehicleCreate, VehicleResponse,
    DriverCreate, DriverResponse, PromoterCreate, PromoterResponse,
    CampaignCreate, CampaignResponse, ExpenseCreate, ExpenseResponse,
    ReportCreate, ReportResponse, DashboardStats
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_role
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Fleet Operations Management API")
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.getenv('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_db()
    logger.info("Database initialized")

# Auth Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

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
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Dashboard Route
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    
    active_projects = await db.execute(select(func.count(Project.id)).where(Project.status == "active"))
    running_campaigns = await db.execute(select(func.count(Campaign.id)).where(Campaign.status == "running"))
    vehicles_on_ground = await db.execute(select(func.count(Vehicle.id)).where(Vehicle.is_active == True))
    
    todays_expenses = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.submitted_date == today)
    )
    
    pending_expenses = await db.execute(
        select(func.count(Expense.id)).where(Expense.status == ExpenseStatus.PENDING)
    )
    
    pending_payments = await db.execute(
        select(func.count(Payment.id)).where(Payment.status == PaymentStatus.PENDING)
    )
    
    return DashboardStats(
        active_projects=active_projects.scalar() or 0,
        running_campaigns=running_campaigns.scalar() or 0,
        vehicles_on_ground=vehicles_on_ground.scalar() or 0,
        todays_expense=todays_expenses.scalar() or 0,
        pending_expenses=pending_expenses.scalar() or 0,
        pending_payments=pending_payments.scalar() or 0
    )

# Client Routes
@api_router.post("/clients", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.CLIENT_SERVICING]))
):
    client = Client(**client_data.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client

@api_router.get("/clients", response_model=list[ClientResponse])
async def get_clients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Client).where(Client.is_active == True))
    return result.scalars().all()

@api_router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

# Project Routes
@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.CLIENT_SERVICING]))
):
    project = Project(**project_data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@api_router.get("/projects", response_model=list[ProjectResponse])
async def get_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Project))
    return result.scalars().all()

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Vendor Routes
@api_router.post("/vendors", response_model=VendorResponse)
async def create_vendor(
    vendor_data: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.OPERATIONS_MANAGER]))
):
    vendor = Vendor(**vendor_data.model_dump())
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor

@api_router.get("/vendors", response_model=list[VendorResponse])
async def get_vendors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Vendor).where(Vendor.is_active == True))
    return result.scalars().all()

@api_router.get("/vendors/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

# Vehicle Routes
@api_router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.OPERATIONS_MANAGER]))
):
    vehicle = Vehicle(**vehicle_data.model_dump())
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    return vehicle

@api_router.get("/vehicles", response_model=list[VehicleResponse])
async def get_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Vehicle).where(Vehicle.is_active == True))
    return result.scalars().all()

@api_router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

# Driver Routes
@api_router.post("/drivers", response_model=DriverResponse)
async def create_driver(
    driver_data: DriverCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.OPERATIONS_MANAGER]))
):
    driver = Driver(**driver_data.model_dump())
    db.add(driver)
    await db.commit()
    await db.refresh(driver)
    return driver

@api_router.get("/drivers", response_model=list[DriverResponse])
async def get_drivers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Driver).where(Driver.is_active == True))
    return result.scalars().all()

@api_router.get("/drivers/{driver_id}", response_model=DriverResponse)
async def get_driver(
    driver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Driver).where(Driver.id == driver_id))
    driver = result.scalar_one_or_none()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

# Promoter Routes
@api_router.post("/promoters", response_model=PromoterResponse)
async def create_promoter(
    promoter_data: PromoterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.OPERATIONS_MANAGER]))
):
    promoter = Promoter(**promoter_data.model_dump())
    db.add(promoter)
    await db.commit()
    await db.refresh(promoter)
    return promoter

@api_router.get("/promoters", response_model=list[PromoterResponse])
async def get_promoters(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Promoter).where(Promoter.is_active == True))
    return result.scalars().all()

# Campaign Routes
@api_router.post("/campaigns", response_model=CampaignResponse)
async def create_campaign(
    campaign_data: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.CLIENT_SERVICING, UserRole.OPERATIONS_MANAGER]))
):
    campaign = Campaign(**campaign_data.model_dump())
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign

@api_router.get("/campaigns", response_model=list[CampaignResponse])
async def get_campaigns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Campaign))
    return result.scalars().all()

@api_router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

# Expense Routes
@api_router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(
    expense_data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = Expense(**expense_data.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense

@api_router.get("/expenses", response_model=list[ExpenseResponse])
async def get_expenses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Expense))
    return result.scalars().all()

@api_router.patch("/expenses/{expense_id}/approve")
async def approve_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.ACCOUNTS]))
):
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = ExpenseStatus.APPROVED
    expense.approved_date = date.today()
    await db.commit()
    return {"message": "Expense approved"}

# Report Routes
@api_router.post("/reports", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.OPERATIONS_MANAGER]))
):
    report = Report(**report_data.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report

@api_router.get("/reports", response_model=list[ReportResponse])
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Report))
    return result.scalars().all()

@api_router.get("/reports/campaign/{campaign_id}", response_model=list[ReportResponse])
async def get_campaign_reports(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Report).where(Report.campaign_id == campaign_id))
    return result.scalars().all()

app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fleet-operations-api"}
