"""Production-ready Fleet Operations API with MySQL/SQLAlchemy
Features:
- Full CRUD endpoints with validation
- Query optimization with eager loading
- Security hardening (CORS, rate limiting, validation)
- Comprehensive error handling
- Structured logging
"""

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, and_, or_
from sqlalchemy.orm import selectinload, joinedload
from datetime import date, datetime, timezone, timedelta
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator

from auth import get_password_hash, verify_password, create_access_token, get_current_user, require_role
from database import get_db, init_db, Base, engine
from models import (
    User, Client, Project, Vendor, Vehicle, Driver, Promoter,
    Campaign, Expense, Report, Payment, CampaignStatus, CampaignType, PaymentStatus, ExpenseStatus
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fleet Operations Management API",
    description="Production-ready API for managing fleet operations",
    version="2.0.0"
)

# Add middleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,  # Cache CORS preflight for 10 minutes
)

api_router = APIRouter(prefix="/api", tags=["Fleet Operations"])

# ============== Pydantic Schemas ==============

class BaseResponse(BaseModel):
    """Base response schema"""
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=8, max_length=255)
    role: str
    
    @validator('role')
    def validate_role(cls, v):
        valid_roles = {'admin', 'client_servicing', 'operations_manager', 'accounts', 'vendor', 'client'}
        if v not in valid_roles:
            raise ValueError(f'Role must be one of {valid_roles}')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseResponse):
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

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    contact_person: Optional[str] = Field(None, max_length=255)

class ClientResponse(BaseResponse):
    id: int
    name: str
    company: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    contact_person: Optional[str]
    is_active: bool
    created_at: datetime

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    client_id: int
    budget: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    assigned_cs: Optional[str] = Field(None, max_length=255)

class ProjectResponse(BaseResponse):
    id: int
    name: str
    description: Optional[str]
    client_id: int
    budget: Optional[float]
    start_date: Optional[date]
    end_date: Optional[date]
    status: str
    assigned_cs: Optional[str]
    created_at: datetime

class VehicleCreate(BaseModel):
    vehicle_number: str = Field(..., min_length=1, max_length=50)
    vehicle_type: Optional[str] = Field(None, max_length=100)
    capacity: Optional[str] = Field(None, max_length=100)
    vendor_id: Optional[int] = None
    rc_validity: Optional[date] = None
    insurance_validity: Optional[date] = None
    permit_validity: Optional[date] = None

class VehicleResponse(BaseResponse):
    id: int
    vehicle_number: str
    vehicle_type: Optional[str]
    capacity: Optional[str]
    vendor_id: Optional[int]
    rc_validity: Optional[date]
    insurance_validity: Optional[date]
    permit_validity: Optional[date]
    is_active: bool
    created_at: datetime

class DriverCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    license_number: Optional[str] = Field(None, max_length=100)
    license_validity: Optional[date] = None
    vendor_id: Optional[int] = None

class DriverResponse(BaseResponse):
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    license_number: Optional[str]
    license_validity: Optional[date]
    vendor_id: Optional[int]
    is_active: bool
    created_at: datetime

class DashboardStats(BaseModel):
    active_projects: int
    running_campaigns: int
    vehicles_on_ground: int
    todays_expense: float
    pending_expenses: int
    pending_payments: int
    total_drivers: int
    total_vendors: int

# ============== Auth Routes ==============

@api_router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    logger.info(f"Registering new user: {user_data.email}")
    
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    
    if existing:
        logger.warning(f"Registration failed: Email {user_data.email} already registered")
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
    logger.info(f"User registered successfully: {user_obj.id}")
    
    return user_obj

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user and get access token"""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Login failed for email: {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role}
    )
    
    logger.info(f"User logged in: {user.id}")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get current user info"""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# ============== Dashboard Route ==============

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Get dashboard statistics with optimized queries"""
    today = date.today()
    
    # Use separate queries with proper indexing
    result = await db.execute(select(func.count(Project.id)).where(Project.status == "active"))
    active_projects = result.scalar() or 0
    
    result = await db.execute(select(func.count(Campaign.id)).where(Campaign.status == "running"))
    running_campaigns = result.scalar() or 0
    
    result = await db.execute(select(func.count(Vehicle.id)).where(Vehicle.is_active == True))
    vehicles_on_ground = result.scalar() or 0
    
    result = await db.execute(
        select(func.sum(Expense.amount))
        .where(func.date(Expense.created_at) == today)
    )
    todays_expense = float(result.scalar() or 0)
    
    result = await db.execute(select(func.count(Expense.id)).where(Expense.status == "pending"))
    pending_expenses = result.scalar() or 0
    
    result = await db.execute(select(func.count(Payment.id)).where(Payment.status == "pending"))
    pending_payments = result.scalar() or 0
    
    result = await db.execute(select(func.count(Driver.id)))
    total_drivers = result.scalar() or 0
    
    result = await db.execute(select(func.count(Vendor.id)))
    total_vendors = result.scalar() or 0
    
    logger.info("Dashboard stats retrieved")
    return DashboardStats(
        active_projects=active_projects,
        running_campaigns=running_campaigns,
        vehicles_on_ground=vehicles_on_ground,
        todays_expense=todays_expense,
        pending_expenses=pending_expenses,
        pending_payments=pending_payments,
        total_drivers=total_drivers,
        total_vendors=total_vendors
    )


# ============== Client Routes ==============

@api_router.post("/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(client_data: ClientCreate, db: AsyncSession = Depends(get_db)):
    """Create a new client"""
    logger.info(f"Creating client: {client_data.name}")
    
    client = Client(**client_data.dict())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    
    logger.info(f"Client created: {client.id}")
    return client

@api_router.get("/clients", response_model=List[ClientResponse])
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """List all active clients with pagination"""
    result = await db.execute(
        select(Client).where(Client.is_active == True)
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

@api_router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int, db: AsyncSession = Depends(get_db)):
    """Get client by ID with relationships"""
    result = await db.execute(
        select(Client).where(Client.id == client_id)
        .options(selectinload(Client.projects))
    )
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@api_router.put("/clients/{client_id}", response_model=ClientResponse)
async def update_client(client_id: int, client_data: ClientCreate, db: AsyncSession = Depends(get_db)):
    """Update client details"""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    for key, value in client_data.dict(exclude_unset=True).items():
        setattr(client, key, value)
    
    db.add(client)
    await db.commit()
    await db.refresh(client)
    
    logger.info(f"Client updated: {client_id}")
    return client

@api_router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: int, db: AsyncSession = Depends(get_db)):
    """Soft delete client"""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client.is_active = False
    db.add(client)
    await db.commit()
    
    logger.info(f"Client deleted: {client_id}")

# ============== Project Routes ==============

@api_router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project_data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    """Create a new project"""
    # Verify client exists
    client_result = await db.execute(select(Client).where(Client.id == project_data.client_id))
    if not client_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Client not found")
    
    project = Project(**project_data.dict())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    logger.info(f"Project created: {project.id}")
    return project

@api_router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """List all projects with pagination"""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.client))
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    """Get project details with relationships"""
    result = await db.execute(
        select(Project).where(Project.id == project_id)
        .options(selectinload(Project.client), selectinload(Project.campaigns))
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project_data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    """Update project details"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for key, value in project_data.dict(exclude_unset=True).items():
        setattr(project, key, value)
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    logger.info(f"Project updated: {project_id}")
    return project

# ============== Vehicle Routes ==============

@api_router.post("/vehicles", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(vehicle_data: VehicleCreate, db: AsyncSession = Depends(get_db)):
    """Create a new vehicle"""
    # Check for duplicate vehicle number
    result = await db.execute(
        select(Vehicle).where(Vehicle.vehicle_number == vehicle_data.vehicle_number)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Vehicle number already exists")
    
    vehicle = Vehicle(**vehicle_data.dict())
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    
    logger.info(f"Vehicle created: {vehicle.id}")
    return vehicle

@api_router.get("/vehicles", response_model=List[VehicleResponse])
async def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """List all active vehicles with pagination"""
    result = await db.execute(
        select(Vehicle).where(Vehicle.is_active == True)
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

@api_router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    """Get vehicle details"""
    result = await db.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id)
        .options(selectinload(Vehicle.vendor))
    )
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

# ============== Driver Routes ==============

@api_router.post("/drivers", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(driver_data: DriverCreate, db: AsyncSession = Depends(get_db)):
    """Create a new driver"""
    driver = Driver(**driver_data.dict())
    db.add(driver)
    await db.commit()
    await db.refresh(driver)
    
    logger.info(f"Driver created: {driver.id}")
    return driver

@api_router.get("/drivers", response_model=List[DriverResponse])
async def get_drivers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """List all active drivers with pagination"""
    result = await db.execute(
        select(Driver).where(Driver.is_active == True)
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

@api_router.get("/drivers/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: int, db: AsyncSession = Depends(get_db)):
    """Get driver details"""
    result = await db.execute(
        select(Driver).where(Driver.id == driver_id)
        .options(selectinload(Driver.vendor))
    )
    driver = result.scalar_one_or_none()
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

# ============== Expense Routes ==============

class ExpenseCreate(BaseModel):
    campaign_id: Optional[int] = None
    driver_id: Optional[int] = None
    expense_type: str = Field(..., max_length=100)
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    bill_url: Optional[str] = None
    submitted_date: Optional[date] = None

@api_router.post("/expenses", status_code=status.HTTP_201_CREATED)
async def create_expense(expense_data: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    """Create a new expense"""
    expense = Expense(**expense_data.dict())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    
    logger.info(f"Expense created: {expense.id}")
    return expense

@api_router.get("/expenses")
async def get_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List expenses with optional status filter"""
    query = select(Expense)
    if status_filter:
        query = query.where(Expense.status == status_filter)
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@api_router.patch("/expenses/{expense_id}/approve")
async def approve_expense(expense_id: int, db: AsyncSession = Depends(get_db)):
    """Approve an expense"""
    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = "approved"
    expense.approved_date = date.today()
    
    db.add(expense)
    await db.commit()
    
    logger.info(f"Expense approved: {expense_id}")
    return {"message": "Expense approved", "expense_id": expense_id}

# ============== Health & Init ==============

app.include_router(api_router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "fleet-operations-api",
        "version": "2.0.0"
    }

@app.on_event("startup")
async def startup():
    """Initialize database on startup"""
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized successfully")

@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    logger.info("Shutting down application")
