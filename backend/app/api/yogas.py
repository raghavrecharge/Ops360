from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.modules.yoga.detector import yoga_detector
from app.models.chart import PlanetaryPosition

router = APIRouter(prefix="/api/yogas", tags=["yogas"])

@router.get("/{profile_id}")
async def get_yogas(
    profile_id: int,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detected yogas for a profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get planetary positions
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    planets = {pos.planet: {
        "rasi": pos.rasi,
        "longitude": pos.longitude,
        "dignity": pos.dignity,
        "is_retrograde": bool(pos.is_retrograde)
    } for pos in positions}
    
    # Detect yogas
    yogas = yoga_detector.detect_yogas(planets, natal_chart.ascendant)
    
    # Filter by category if provided
    if category:
        yogas = [y for y in yogas if y["type"] == category]
    
    return {
        "yogas": yogas,
        "count": len(yogas),
        "categories": list(set(y["type"] for y in yogas))
    }

@router.get("/{profile_id}/categories")
async def get_yoga_categories(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get yoga categories with counts"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    planets = {pos.planet: {
        "rasi": pos.rasi,
        "longitude": pos.longitude,
        "dignity": pos.dignity,
        "is_retrograde": bool(pos.is_retrograde)
    } for pos in positions}
    
    yogas = yoga_detector.detect_yogas(planets, natal_chart.ascendant)
    
    # Group by category
    categories = {}
    for yoga in yogas:
        cat = yoga["type"]
        if cat not in categories:
            categories[cat] = {"count": 0, "yogas": []}
        categories[cat]["count"] += 1
        categories[cat]["yogas"].append(yoga["name"])
    
    return {"categories": categories}

@router.get("/rules")
async def get_yoga_rules(current_user: User = Depends(get_current_user)):
    """Get all yoga rules (admin)"""
    return {
        "rules": yoga_detector.rules,
        "count": len(yoga_detector.rules)
    }

@router.post("/rules/reload")
async def reload_yoga_rules(current_user: User = Depends(get_current_user)):
    """Reload yoga rules from file (admin)"""
    yoga_detector.rules = yoga_detector.load_rules()
    return {
        "status": "success",
        "rules_loaded": len(yoga_detector.rules)
    }
