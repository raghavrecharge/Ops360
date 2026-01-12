from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.remedy import Remedy
from app.api.charts import get_or_compute_chart
from app.modules.remedies.calculator import remedies_calculator
from app.modules.strength.calculator import strength_calculator
from app.models.chart import PlanetaryPosition

router = APIRouter(prefix="/api/remedies", tags=["remedies"])

@router.get("/{profile_id}")
async def get_remedies(
    profile_id: int,
    planet: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all recommended remedies for a profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get natal chart and positions
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
    
    # Calculate Shadbala for weakness analysis
    shadbala = strength_calculator.calculate_shadbala(planets, natal_chart.julian_day)
    
    # Generate all remedies
    all_remedies = remedies_calculator.generate_all_remedies(planets, shadbala)
    
    # Filter by planet if specified
    if planet:
        planet = planet.upper()
        if planet in all_remedies["remedies_by_planet"]:
            return {
                "planet": planet,
                "remedies": all_remedies["remedies_by_planet"][planet],
                "is_weak": planet in all_remedies["weak_planets"],
                "is_afflicted": planet in all_remedies["afflicted_planets"]
            }
        else:
            # Generate remedies for the specific planet anyway
            return {
                "planet": planet,
                "remedies": {
                    "gemstone": remedies_calculator.generate_gemstone_remedy(planet),
                    "mantra": remedies_calculator.generate_mantra_remedy(planet),
                    "charity": remedies_calculator.generate_charity_remedy(planet),
                    "fasting": remedies_calculator.generate_fasting_remedy(planet),
                    "rudraksha": remedies_calculator.generate_rudraksha_remedy(planet)
                },
                "is_weak": False,
                "is_afflicted": False
            }
    
    return all_remedies


@router.get("/{profile_id}/quick")
async def get_quick_remedies(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get quick and easy remedies for weak planets"""
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
    weak_planets = remedies_calculator.get_weak_planets(shadbala)
    
    quick_remedies = {}
    for planet in weak_planets[:3]:  # Top 3 weak planets
        quick_remedies[planet] = remedies_calculator.generate_quick_remedies(planet)
    
    return {
        "weak_planets": weak_planets,
        "quick_remedies": quick_remedies,
        "note": "These are simple remedies that can be started immediately"
    }


@router.get("/{profile_id}/gemstones")
async def get_gemstone_recommendations(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get gemstone recommendations based on chart analysis"""
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
        "dignity": pos.dignity
    } for pos in positions}
    
    shadbala = strength_calculator.calculate_shadbala(planets, natal_chart.julian_day)
    
    # Find ascendant lord
    asc_rasi = int(natal_chart.ascendant / 30.0) + 1
    lords = {
        1: "MARS", 2: "VENUS", 3: "MERCURY", 4: "MOON",
        5: "SUN", 6: "MERCURY", 7: "VENUS", 8: "MARS",
        9: "JUPITER", 10: "SATURN", 11: "SATURN", 12: "JUPITER"
    }
    asc_lord = lords.get(asc_rasi, "SUN")
    
    recommendations = []
    
    # Primary recommendation: Ascendant lord gemstone
    asc_gem = remedies_calculator.generate_gemstone_remedy(asc_lord)
    asc_gem["recommendation_type"] = "Primary (Ascendant Lord)"
    asc_gem["priority"] = "High"
    recommendations.append(asc_gem)
    
    # Find 9th lord (luck) and 10th lord (career)
    ninth_rasi = ((asc_rasi - 1 + 8) % 12) + 1
    tenth_rasi = ((asc_rasi - 1 + 9) % 12) + 1
    ninth_lord = lords.get(ninth_rasi, "JUPITER")
    tenth_lord = lords.get(tenth_rasi, "SATURN")
    
    if ninth_lord != asc_lord:
        ninth_gem = remedies_calculator.generate_gemstone_remedy(ninth_lord)
        ninth_gem["recommendation_type"] = "Fortune Enhancement (9th Lord)"
        ninth_gem["priority"] = "Medium"
        recommendations.append(ninth_gem)
    
    if tenth_lord not in [asc_lord, ninth_lord]:
        tenth_gem = remedies_calculator.generate_gemstone_remedy(tenth_lord)
        tenth_gem["recommendation_type"] = "Career Enhancement (10th Lord)"
        tenth_gem["priority"] = "Medium"
        recommendations.append(tenth_gem)
    
    return {
        "ascendant_rasi": asc_rasi,
        "ascendant_lord": asc_lord,
        "gemstone_recommendations": recommendations,
        "caution": "Always consult a qualified astrologer before wearing gemstones"
    }


@router.get("/{profile_id}/mantras")
async def get_mantra_recommendations(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mantra recommendations for all planets"""
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
        "dignity": pos.dignity
    } for pos in positions}
    
    shadbala = strength_calculator.calculate_shadbala(planets, natal_chart.julian_day)
    weak_planets = remedies_calculator.get_weak_planets(shadbala)
    
    mantras = {}
    for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
        mantra = remedies_calculator.generate_mantra_remedy(planet)
        mantra["is_priority"] = planet in weak_planets
        mantras[planet] = mantra
    
    return {
        "weak_planets": weak_planets,
        "mantras": mantras,
        "daily_schedule": generate_mantra_schedule(weak_planets)
    }


@router.post("/{profile_id}/save")
async def save_remedy(
    profile_id: int,
    remedy_type: str,
    planet: str,
    description: str,
    duration: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a remedy for tracking"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    remedy = Remedy(
        profile_id=profile_id,
        remedy_type=remedy_type,
        planet=planet.upper(),
        description=description,
        duration=duration,
        implementation_steps={"status": "not_started"},
        created_at=datetime.utcnow()
    )
    
    db.add(remedy)
    db.commit()
    db.refresh(remedy)
    
    return {
        "id": remedy.id,
        "message": "Remedy saved successfully",
        "remedy": {
            "type": remedy.remedy_type,
            "planet": remedy.planet,
            "description": remedy.description
        }
    }


@router.get("/{profile_id}/saved")
async def get_saved_remedies(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all saved remedies for a profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    remedies = db.query(Remedy).filter(
        Remedy.profile_id == profile_id
    ).all()
    
    return {
        "profile_id": profile_id,
        "remedies": [
            {
                "id": r.id,
                "type": r.remedy_type,
                "planet": r.planet,
                "description": r.description,
                "duration": r.duration,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in remedies
        ]
    }


def generate_mantra_schedule(weak_planets: List[str]) -> dict:
    """Generate a daily mantra schedule"""
    schedule = {
        "morning": [],
        "evening": []
    }
    
    # Priority mantras in morning
    for planet in weak_planets[:2]:
        mantra_data = remedies_calculator.MANTRAS.get(planet, {})
        schedule["morning"].append({
            "planet": planet,
            "mantra": mantra_data.get("beej", ""),
            "count": 108
        })
    
    # Gayatri in evening
    schedule["evening"].append({
        "name": "Gayatri Mantra",
        "mantra": "Om Bhur Bhuva Swaha Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat",
        "count": 108
    })
    
    return schedule
