from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import os

from app.core.database import get_db, engine
from app.core.auth import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, get_current_user
)
from app.models.user import User
from app.models.profile import Profile
from app.models import Base

# Import routers
from app.api import charts, dashas, transits, export as export_router
from app.api import ashtakavarga, yogas, strength, varshaphala, compatibility, remedies
from app.api import align27
from app.api import kb, chat, ml  # Batch 5
from app.api import dashboard  # Batch 6

app = FastAPI(
    title="AstroOS API",
    description="Complete Vedic Astrology Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - Batch 2
app.include_router(charts.router)
app.include_router(dashas.router)
app.include_router(transits.router)
app.include_router(export_router.router)

# Include routers - Batch 3
app.include_router(ashtakavarga.router)
app.include_router(yogas.router)
app.include_router(strength.router)
app.include_router(varshaphala.router)
app.include_router(compatibility.router)
app.include_router(remedies.router)

# Include routers - Batch 4
app.include_router(align27.router)

# Include routers - Batch 5
app.include_router(kb.router)
app.include_router(chat.router)
app.include_router(ml.router)

# Include routers - Batch 6
app.include_router(dashboard.router)

@app.on_event("startup")
async def startup():
    """Create tables on startup if they don't exist"""
    Base.metadata.create_all(bind=engine)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "AstroOS", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/auth/register")
async def register(email: str, password: str, full_name: str = None, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"id": user.id, "email": user.email, "full_name": user.full_name}

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name}
    }

@app.get("/api/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value if current_user.role else None
    }

@app.get("/api/profiles")
async def list_profiles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profiles = db.query(Profile).filter(Profile.user_id == current_user.id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "birth_date": p.birth_date.isoformat(),
            "birth_place": p.birth_place,
            "ayanamsa": p.ayanamsa,
            "chart_style": p.chart_style.value if p.chart_style else None
        }
        for p in profiles
    ]

@app.post("/api/profiles")
async def create_profile(
    name: str,
    birth_date: str,
    birth_time: str,
    birth_place: str,
    latitude: float,
    longitude: float,
    timezone: str,
    ayanamsa: str = "LAHIRI",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime
    bd = datetime.fromisoformat(birth_date)
    
    profile = Profile(
        user_id=current_user.id,
        name=name,
        birth_date=bd,
        birth_time=birth_time,
        birth_place=birth_place,
        latitude=latitude,
        longitude=longitude,
        timezone=timezone,
        ayanamsa=ayanamsa,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return {"id": profile.id, "name": profile.name, "message": "Profile created successfully"}

@app.get("/api/profiles/{profile_id}")
async def get_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "id": profile.id,
        "name": profile.name,
        "birth_date": profile.birth_date.isoformat(),
        "birth_time": profile.birth_time,
        "birth_place": profile.birth_place,
        "latitude": profile.latitude,
        "longitude": profile.longitude,
        "timezone": profile.timezone,
        "ayanamsa": profile.ayanamsa,
        "chart_style": profile.chart_style.value if profile.chart_style else None
    }

@app.post("/api/demo/setup")
async def setup_demo(db: Session = Depends(get_db)):
    """Create demo user and profile"""
    from app.core.auth import get_password_hash
    from datetime import datetime as dt
    
    demo_user = db.query(User).filter(User.email == "demo@astroos.com").first()
    
    if not demo_user:
        demo_user = User(
            email="demo@astroos.com",
            hashed_password=get_password_hash("demo123"),
            full_name="Demo User",
            role="USER",
            is_active=True,
            created_at=dt.utcnow(),
            updated_at=dt.utcnow()
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    
    demo_profile = db.query(Profile).filter(Profile.user_id == demo_user.id).first()
    
    if not demo_profile:
        demo_profile = Profile(
            user_id=demo_user.id,
            name="Demo Profile",
            birth_date=dt(1990, 1, 15, 10, 30),
            birth_time="10:30:00",
            birth_place="New Delhi, India",
            latitude=28.6139,
            longitude=77.2090,
            timezone="Asia/Kolkata",
            ayanamsa="LAHIRI",
            language_preference="en",
            created_at=dt.utcnow(),
            updated_at=dt.utcnow()
        )
        db.add(demo_profile)
        db.commit()
    
    return {
        "status": "success",
        "message": "Demo setup complete",
        "credentials": {
            "email": "demo@astroos.com",
            "password": "demo123"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
