from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.modules.ashtakavarga.calculator import ashtakavarga_calculator
from app.models.chart import PlanetaryPosition

router = APIRouter(prefix="/api/ashtakavarga", tags=["ashtakavarga"])

@router.get("/{profile_id}/bav")
async def get_bav(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Bhinnashtakavarga for all planets"""
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
    
    planetary_positions = {pos.planet: {"rasi": pos.rasi, "longitude": pos.longitude} for pos in positions}
    
    # Calculate BAV
    result = ashtakavarga_calculator.calculate_all(planetary_positions)
    
    return {
        "bav": result["bav"],
        "planet_totals": {planet: sum(values) for planet, values in result["bav"].items()}
    }

@router.get("/{profile_id}/sav")
async def get_sav(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Sarvashtakavarga"""
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
    
    planetary_positions = {pos.planet: {"rasi": pos.rasi, "longitude": pos.longitude} for pos in positions}
    
    result = ashtakavarga_calculator.calculate_all(planetary_positions)
    
    return {
        "sav": result["sav"],
        "reductions": result["reductions"],
        "total_points": result["summary"]["total_points"]
    }

@router.get("/{profile_id}/summary")
async def get_ashtakavarga_summary(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Ashtakavarga summary with strong/weak houses"""
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
    
    planetary_positions = {pos.planet: {"rasi": pos.rasi, "longitude": pos.longitude} for pos in positions}
    
    result = ashtakavarga_calculator.calculate_all(planetary_positions)
    
    # Determine strong and weak houses
    sav = result["sav"]
    avg = result["summary"]["average"]
    
    strong_houses = [i+1 for i, val in enumerate(sav) if val > avg]
    weak_houses = [i+1 for i, val in enumerate(sav) if val < avg]
    
    return {
        "summary": result["summary"],
        "strong_houses": strong_houses,
        "weak_houses": weak_houses,
        "sav_by_house": dict(enumerate(sav, 1)),
        "interpretation": {
            "strongest_house": result["summary"]["max_rasi"],
            "weakest_house": result["summary"]["min_rasi"],
            "overall_strength": "Good" if result["summary"]["total_points"] > 300 else "Moderate"
        }
    }
