from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'ops360-mobile-secret-key-2025')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

app = FastAPI(title="Ops360 Mobile API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== Helper Functions ==============

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        email = payload.get("email")
        if not user_id or not email:
            raise credentials_exception
        return {"user_id": user_id, "email": email, "role": payload.get("role")}
    except JWTError:
        raise credentials_exception

def doc_to_dict(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc

# ============== Pydantic Models ==============

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    password: str
    role: str = "vendor"  # Default to vendor (Driver role)

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

class AttendanceCreate(BaseModel):
    action: str  # "start" or "end"
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    photo: Optional[str] = None  # base64 image
    notes: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: str
    user_id: str
    date: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    start_location: Optional[dict] = None
    end_location: Optional[dict] = None
    start_photo: Optional[str] = None
    end_photo: Optional[str] = None
    status: str  # "not_started", "in_progress", "completed"
    created_at: datetime

class ActivityCreate(BaseModel):
    description: Optional[str] = None
    photo: str  # base64 image
    latitude: float
    longitude: float
    activity_type: Optional[str] = None  # route, delivery, store_visit, etc.

class ActivityResponse(BaseModel):
    id: str
    user_id: str
    date: str
    description: Optional[str]
    photo: str
    location: dict
    activity_type: Optional[str]
    created_at: datetime

class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None
    receipt_image: Optional[str] = None  # base64 image

class ExpenseResponse(BaseModel):
    id: str
    user_id: str
    date: str
    category: str
    amount: float
    description: Optional[str]
    receipt_image: Optional[str]
    status: str  # pending, approved, rejected
    created_at: datetime

class DashboardStats(BaseModel):
    day_status: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    last_location: Optional[dict] = None
    total_expenses: float
    expenses_count: int
    activities_count: int
    last_activity: Optional[dict] = None

# ============== Auth Routes ==============

@api_router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
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
    """Login user"""
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    access_token = create_access_token(
        data={"user_id": str(user["_id"]), "email": user["email"], "role": user.get("role", "vendor")}
    )
    
    user_response = doc_to_dict(user.copy())
    user_response.pop("password_hash", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    user = await db.users.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_dict = doc_to_dict(user.copy())
    user_dict.pop("password_hash", None)
    return user_dict

# ============== Attendance Routes ==============

@api_router.post("/attendance", response_model=AttendanceResponse)
async def mark_attendance(data: AttendanceCreate, current_user: dict = Depends(get_current_user)):
    """Mark attendance (start or end day)"""
    today = date.today().isoformat()
    user_id = current_user["user_id"]
    
    # Check existing attendance for today
    existing = await db.attendance.find_one({"user_id": user_id, "date": today})
    
    if data.action == "start":
        if existing:
            raise HTTPException(status_code=400, detail="Day already started")
        
        attendance = {
            "user_id": user_id,
            "date": today,
            "start_time": datetime.now(timezone.utc),
            "start_location": {
                "latitude": data.latitude,
                "longitude": data.longitude,
                "accuracy": data.accuracy
            },
            "start_photo": data.photo,
            "status": "in_progress",
            "created_at": datetime.now(timezone.utc)
        }
        result = await db.attendance.insert_one(attendance)
        attendance["id"] = str(result.inserted_id)
        return attendance
    
    elif data.action == "end":
        if not existing:
            raise HTTPException(status_code=400, detail="Day not started yet")
        if existing.get("status") == "completed":
            raise HTTPException(status_code=400, detail="Day already ended")
        
        if not data.photo:
            raise HTTPException(status_code=400, detail="End day photo is required")
        
        update_data = {
            "end_time": datetime.now(timezone.utc),
            "end_location": {
                "latitude": data.latitude,
                "longitude": data.longitude,
                "accuracy": data.accuracy
            },
            "end_photo": data.photo,
            "status": "completed"
        }
        
        await db.attendance.update_one(
            {"_id": existing["_id"]},
            {"$set": update_data}
        )
        
        updated = await db.attendance.find_one({"_id": existing["_id"]})
        return doc_to_dict(updated)
    
    raise HTTPException(status_code=400, detail="Invalid action. Use 'start' or 'end'")

@api_router.get("/attendance/today", response_model=Optional[AttendanceResponse])
async def get_today_attendance(current_user: dict = Depends(get_current_user)):
    """Get today's attendance"""
    today = date.today().isoformat()
    attendance = await db.attendance.find_one({"user_id": current_user["user_id"], "date": today})
    if attendance:
        return doc_to_dict(attendance)
    return None

@api_router.get("/attendance/history", response_model=List[AttendanceResponse])
async def get_attendance_history(current_user: dict = Depends(get_current_user)):
    """Get attendance history"""
    attendances = await db.attendance.find({"user_id": current_user["user_id"]}).sort("date", -1).to_list(30)
    return [doc_to_dict(a) for a in attendances]

# ============== Activity Routes ==============

@api_router.post("/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(data: ActivityCreate, current_user: dict = Depends(get_current_user)):
    """Submit an activity with photo"""
    today = date.today().isoformat()
    user_id = current_user["user_id"]
    
    # Check if day is started
    attendance = await db.attendance.find_one({"user_id": user_id, "date": today})
    if not attendance:
        raise HTTPException(status_code=400, detail="Please start your day first")
    if attendance.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Day has ended. Cannot submit activities")
    
    activity = {
        "user_id": user_id,
        "date": today,
        "description": data.description,
        "photo": data.photo,
        "location": {
            "latitude": data.latitude,
            "longitude": data.longitude
        },
        "activity_type": data.activity_type,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.activities.insert_one(activity)
    activity["id"] = str(result.inserted_id)
    return activity

@api_router.get("/activities", response_model=List[ActivityResponse])
async def get_activities(current_user: dict = Depends(get_current_user), date_filter: Optional[str] = None):
    """Get activities (optionally filter by date)"""
    query = {"user_id": current_user["user_id"]}
    if date_filter:
        query["date"] = date_filter
    
    activities = await db.activities.find(query).sort("created_at", -1).to_list(100)
    return [doc_to_dict(a) for a in activities]

@api_router.get("/activities/today", response_model=List[ActivityResponse])
async def get_today_activities(current_user: dict = Depends(get_current_user)):
    """Get today's activities"""
    today = date.today().isoformat()
    activities = await db.activities.find({"user_id": current_user["user_id"], "date": today}).sort("created_at", -1).to_list(100)
    return [doc_to_dict(a) for a in activities]

# ============== Expense Routes ==============

# Role-based expense categories
DRIVER_CATEGORIES = ["Fuel", "Toll", "Food", "Maintenance", "Parking", "Other"]
PROMOTER_CATEGORIES = ["Travel", "Food", "Promotion Materials", "Communication", "Other"]

@api_router.get("/expenses/categories")
async def get_expense_categories(current_user: dict = Depends(get_current_user)):
    """Get expense categories based on user role"""
    role = current_user.get("role", "vendor")
    if role == "vendor":
        return {"categories": DRIVER_CATEGORIES}
    elif role == "promoter":
        return {"categories": PROMOTER_CATEGORIES}
    return {"categories": DRIVER_CATEGORIES + PROMOTER_CATEGORIES}

@api_router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    """Create a new expense"""
    today = date.today().isoformat()
    user_id = current_user["user_id"]
    
    # Check if day is started
    attendance = await db.attendance.find_one({"user_id": user_id, "date": today})
    if not attendance:
        raise HTTPException(status_code=400, detail="Please start your day first")
    if attendance.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Day has ended. Cannot add expenses")
    
    expense = {
        "user_id": user_id,
        "date": today,
        "category": data.category,
        "amount": data.amount,
        "description": data.description,
        "receipt_image": data.receipt_image,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.expenses.insert_one(expense)
    expense["id"] = str(result.inserted_id)
    return expense

@api_router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(current_user: dict = Depends(get_current_user), date_filter: Optional[str] = None):
    """Get expenses (optionally filter by date)"""
    query = {"user_id": current_user["user_id"]}
    if date_filter:
        query["date"] = date_filter
    
    expenses = await db.expenses.find(query).sort("created_at", -1).to_list(100)
    return [doc_to_dict(e) for e in expenses]

@api_router.get("/expenses/today", response_model=List[ExpenseResponse])
async def get_today_expenses(current_user: dict = Depends(get_current_user)):
    """Get today's expenses"""
    today = date.today().isoformat()
    expenses = await db.expenses.find({"user_id": current_user["user_id"], "date": today}).sort("created_at", -1).to_list(100)
    return [doc_to_dict(e) for e in expenses]

@api_router.get("/expenses/today/total")
async def get_today_expense_total(current_user: dict = Depends(get_current_user)):
    """Get today's total expense"""
    today = date.today().isoformat()
    pipeline = [
        {"$match": {"user_id": current_user["user_id"], "date": today}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    result = await db.expenses.aggregate(pipeline).to_list(1)
    if result:
        return {"total": result[0]["total"], "count": result[0]["count"]}
    return {"total": 0, "count": 0}

# ============== Dashboard Route ==============

@api_router.get("/dashboard/mobile", response_model=DashboardStats)
async def get_mobile_dashboard(current_user: dict = Depends(get_current_user)):
    """Get mobile dashboard stats"""
    today = date.today().isoformat()
    user_id = current_user["user_id"]
    
    # Get attendance
    attendance = await db.attendance.find_one({"user_id": user_id, "date": today})
    
    day_status = "not_started"
    start_time = None
    end_time = None
    last_location = None
    
    if attendance:
        day_status = attendance.get("status", "not_started")
        if attendance.get("start_time"):
            start_time = attendance["start_time"].isoformat() if isinstance(attendance["start_time"], datetime) else str(attendance["start_time"])
        if attendance.get("end_time"):
            end_time = attendance["end_time"].isoformat() if isinstance(attendance["end_time"], datetime) else str(attendance["end_time"])
        last_location = attendance.get("end_location") or attendance.get("start_location")
    
    # Get expenses
    expense_stats = await db.expenses.aggregate([
        {"$match": {"user_id": user_id, "date": today}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(1)
    
    total_expenses = expense_stats[0]["total"] if expense_stats else 0
    expenses_count = expense_stats[0]["count"] if expense_stats else 0
    
    # Get activities count
    activities_count = await db.activities.count_documents({"user_id": user_id, "date": today})
    
    # Get last activity
    last_activity_doc = await db.activities.find_one(
        {"user_id": user_id, "date": today},
        sort=[("created_at", -1)]
    )
    last_activity = None
    if last_activity_doc:
        last_activity = {
            "description": last_activity_doc.get("description"),
            "activity_type": last_activity_doc.get("activity_type"),
            "created_at": last_activity_doc["created_at"].isoformat() if isinstance(last_activity_doc.get("created_at"), datetime) else str(last_activity_doc.get("created_at"))
        }
    
    return DashboardStats(
        day_status=day_status,
        start_time=start_time,
        end_time=end_time,
        last_location=last_location,
        total_expenses=total_expenses,
        expenses_count=expenses_count,
        activities_count=activities_count,
        last_activity=last_activity
    )

# ============== Health Check ==============

@api_router.get("/")
async def root():
    return {"message": "Ops360 Mobile API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ops360-mobile-api"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
