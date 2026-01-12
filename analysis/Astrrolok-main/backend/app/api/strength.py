from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.api.charts import get_or_compute_chart
from app.modules.strength.calculator import strength_calculator
from app.models.chart import PlanetaryPosition

router = APIRouter(prefix="/api/strength", tags=["strength"])

@router.get("/{profile_id}/shadbala")
async def get_shadbala(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Shadbala for all planets"""
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
        "longitude": pos.longitude,
        "rasi": pos.rasi,
        "is_retrograde": bool(pos.is_retrograde),
        "dignity": pos.dignity
    } for pos in positions}
    
    shadbala = strength_calculator.calculate_shadbala(planets, natal_chart.julian_day)
    
    return {"shadbala": shadbala}

@router.get("/{profile_id}/bhavabala")
async def get_bhavabala(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Bhava Bala (house strength)"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    bhavabala = strength_calculator.calculate_bhavabala(natal_chart.house_cusps)
    
    return {"bhavabala": bhavabala}

@router.get("/{profile_id}/vargabala")
async def get_vargabala(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Varga Bala (divisional chart strength)"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    from app.models.chart import DivisionalChart
    divisional_charts = db.query(DivisionalChart).filter(
        DivisionalChart.natal_chart_id == natal_chart.id
    ).all()
    
    div_data = {dc.division: dc.planetary_positions for dc in divisional_charts}
    
    vargabala = strength_calculator.calculate_vargabala(div_data)
    
    return {"vargabala": vargabala}

@router.get("/{profile_id}/ishtakashta")
async def get_ishtakashta(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Ishta/Kashta Phala"""
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
        "longitude": pos.longitude,
        "dignity": pos.dignity
    } for pos in positions}
    
    ishtakashta = strength_calculator.calculate_ishtakashta(planets)
    
    return {"ishtakashta": ishtakashta}

@router.get("/{profile_id}/avasthas")
async def get_avasthas(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Avasthas (planetary states)"""
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
        "longitude": pos.longitude,
        "rasi": pos.rasi,
        "dignity": pos.dignity,
        "is_retrograde": bool(pos.is_retrograde),
        "is_combust": bool(pos.is_combust)
    } for pos in positions}
    
    avasthas = strength_calculator.calculate_avasthas(planets)
    
    return {"avasthas": avasthas}

@router.get("/{profile_id}/summary")
async def get_strength_summary(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive strength summary"""
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
        "longitude": pos.longitude,
        "rasi": pos.rasi,
        "is_retrograde": bool(pos.is_retrograde),
        "dignity": pos.dignity,
        "is_combust": bool(pos.is_combust)
    } for pos in positions}
    
    shadbala = strength_calculator.calculate_shadbala(planets, natal_chart.julian_day)
    ishtakashta = strength_calculator.calculate_ishtakashta(planets)
    avasthas = strength_calculator.calculate_avasthas(planets)
    
    # Determine strongest/weakest planets
    planet_strengths = [(p, data["total"]) for p, data in shadbala.items()]
    planet_strengths.sort(key=lambda x: x[1], reverse=True)
    
    return {
        "strongest_planet": planet_strengths[0][0] if planet_strengths else None,
        "weakest_planet": planet_strengths[-1][0] if planet_strengths else None,
        "shadbala_summary": {p: data["total"] for p, data in shadbala.items()},
        "ishtakashta_summary": ishtakashta,
        "avastha_summary": avasthas
    }
