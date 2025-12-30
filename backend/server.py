from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import date, datetime, timezone
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from auth import get_password_hash, verify_password, create_access_token, get_current_user, require_role

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Fleet Operations Management API")
api_router = APIRouter(prefix="/api")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enums
class UserRole:
    ADMIN = "admin"
    CLIENT_SERVICING = "client_servicing"
    OPERATIONS_MANAGER = "operations_manager"
    ACCOUNTS = "accounts"
    VENDOR = "vendor"
    CLIENT = "client"

# Schemas
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
    id: str
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

# Helper to convert MongoDB doc to response
def doc_to_dict(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc

# Auth Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    user_dict.pop("password_hash")
    return user_dict

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    access_token = create_access_token(data={"user_id": str(user["_id"]), "email": user["email"]})
    user_response = doc_to_dict(user.copy())
    user_response.pop("password_hash", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"email": current_user.get("email")})
    user_dict = doc_to_dict(user)
    user_dict.pop("password_hash", None)
    return user_dict

# Dashboard
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    today = date.today().isoformat()
    
    active_projects = await db.projects.count_documents({"status": "active"})
    running_campaigns = await db.campaigns.count_documents({"status": "running"})
    vehicles_on_ground = await db.vehicles.count_documents({"is_active": True})
    
    expenses_pipeline = [
        {"$match": {"submitted_date": today}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    todays_expenses = await db.expenses.aggregate(expenses_pipeline).to_list(1)
    todays_expense = todays_expenses[0]["total"] if todays_expenses else 0
    
    pending_expenses = await db.expenses.count_documents({"status": "pending"})
    pending_payments = await db.payments.count_documents({"status": "pending"})
    
    return DashboardStats(
        active_projects=active_projects,
        running_campaigns=running_campaigns,
        vehicles_on_ground=vehicles_on_ground,
        todays_expense=todays_expense,
        pending_expenses=pending_expenses,
        pending_payments=pending_payments
    )

# Generic CRUD routes
@api_router.post("/clients")
async def create_client(data: dict):
    data["is_active"] = True
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.clients.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/clients")
async def get_clients():
    clients = await db.clients.find({"is_active": True}).to_list(1000)
    return [doc_to_dict(c) for c in clients]

@api_router.get("/clients/{client_id}")
async def get_client(client_id: str):
    from bson import ObjectId
    client = await db.clients.find_one({"_id": ObjectId(client_id)})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return doc_to_dict(client)

@api_router.post("/projects")
async def create_project(data: dict):
    data["status"] = data.get("status", "active")
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.projects.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/projects")
async def get_projects():
    projects = await db.projects.find().to_list(1000)
    return [doc_to_dict(p) for p in projects]

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    from bson import ObjectId
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc_to_dict(project)

@api_router.post("/vendors")
async def create_vendor(data: dict):
    data["is_active"] = True
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.vendors.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/vendors")
async def get_vendors():
    vendors = await db.vendors.find({"is_active": True}).to_list(1000)
    return [doc_to_dict(v) for v in vendors]

@api_router.get("/vendors/{vendor_id}")
async def get_vendor(vendor_id: str):
    from bson import ObjectId
    vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return doc_to_dict(vendor)

@api_router.post("/vehicles")
async def create_vehicle(data: dict):
    data["is_active"] = True
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.vehicles.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/vehicles")
async def get_vehicles():
    vehicles = await db.vehicles.find({"is_active": True}).to_list(1000)
    return [doc_to_dict(v) for v in vehicles]

@api_router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    from bson import ObjectId
    vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return doc_to_dict(vehicle)

@api_router.post("/drivers")
async def create_driver(data: dict):
    data["is_active"] = True
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.drivers.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/drivers")
async def get_drivers():
    drivers = await db.drivers.find({"is_active": True}).to_list(1000)
    return [doc_to_dict(d) for d in drivers]

@api_router.get("/drivers/{driver_id}")
async def get_driver(driver_id: str):
    from bson import ObjectId
    driver = await db.drivers.find_one({"_id": ObjectId(driver_id)})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return doc_to_dict(driver)

@api_router.post("/promoters")
async def create_promoter(data: dict):
    data["is_active"] = True
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.promoters.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/promoters")
async def get_promoters():
    promoters = await db.promoters.find({"is_active": True}).to_list(1000)
    return [doc_to_dict(p) for p in promoters]

@api_router.post("/campaigns")
async def create_campaign(data: dict):
    data["status"] = data.get("status", "planning")
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.campaigns.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/campaigns")
async def get_campaigns():
    campaigns = await db.campaigns.find().to_list(1000)
    return [doc_to_dict(c) for c in campaigns]

@api_router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    from bson import ObjectId
    campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return doc_to_dict(campaign)

@api_router.post("/expenses")
async def create_expense(data: dict):
    data["status"] = data.get("status", "pending")
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.expenses.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/expenses")
async def get_expenses():
    expenses = await db.expenses.find().to_list(1000)
    return [doc_to_dict(e) for e in expenses]

@api_router.patch("/expenses/{expense_id}/approve")
async def approve_expense(expense_id: str):
    from bson import ObjectId
    result = await db.expenses.update_one(
        {"_id": ObjectId(expense_id)},
        {"$set": {"status": "approved", "approved_date": date.today().isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense approved"}

@api_router.post("/reports")
async def create_report(data: dict):
    data["created_at"] = datetime.now(timezone.utc)
    result = await db.reports.insert_one(data)
    data["id"] = str(result.inserted_id)
    data.pop("_id", None)
    return data

@api_router.get("/reports")
async def get_reports():
    reports = await db.reports.find().to_list(1000)
    return [doc_to_dict(r) for r in reports]

@api_router.get("/reports/campaign/{campaign_id}")
async def get_campaign_reports(campaign_id: str):
    reports = await db.reports.find({"campaign_id": campaign_id}).to_list(1000)
    return [doc_to_dict(r) for r in reports]

app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fleet-operations-api"}

@app.on_event("shutdown")
async def shutdown_event():
    client.close()
