from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import hashlib

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.chart import NatalChart, PlanetaryPosition, DivisionalChart
from app.modules.charts.calculator import chart_calculator
from app.modules.ephemeris.calculator import ephemeris

router = APIRouter(prefix="/api/charts", tags=["charts"])

@router.get("/{profile_id}")
async def get_chart(
    profile_id: int,
    chart: str = "D1",
    style: str = "north_indian",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get natal or divisional chart"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Compute or fetch cached chart
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get divisional chart
    division = 1 if chart == "D1" else int(chart[1:])
    
    if division == 1:
        # Return D1 with North Indian format
        return format_north_indian_chart(natal_chart, profile)
    else:
        # Return divisional chart
        div_chart = db.query(DivisionalChart).filter(
            DivisionalChart.natal_chart_id == natal_chart.id,
            DivisionalChart.division == division
        ).first()
        
        if not div_chart:
            raise HTTPException(status_code=404, detail=f"Chart {chart} not found")
        
        return {
            "division": division,
            "division_name": div_chart.division_name,
            "planetary_positions": div_chart.planetary_positions
        }

@router.get("/{profile_id}/divisional")
async def get_divisional_chart(
    profile_id: int,
    d: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific divisional chart"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    div_chart = db.query(DivisionalChart).filter(
        DivisionalChart.natal_chart_id == natal_chart.id,
        DivisionalChart.division == d
    ).first()
    
    if not div_chart:
        raise HTTPException(status_code=404, detail=f"D{d} not found")
    
    return {
        "division": d,
        "division_name": div_chart.division_name,
        "planetary_positions": div_chart.planetary_positions
    }

@router.get("/{profile_id}/bundle")
async def get_chart_bundle(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get D1 + D9 + D10 + planetary table"""
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
    
    # Get divisional charts
    d9 = db.query(DivisionalChart).filter(
        DivisionalChart.natal_chart_id == natal_chart.id,
        DivisionalChart.division == 9
    ).first()
    
    d10 = db.query(DivisionalChart).filter(
        DivisionalChart.natal_chart_id == natal_chart.id,
        DivisionalChart.division == 10
    ).first()
    
    return {
        "d1": format_north_indian_chart(natal_chart, profile),
        "d9": {"planetary_positions": d9.planetary_positions} if d9 else None,
        "d10": {"planetary_positions": d10.planetary_positions} if d10 else None,
        "planetary_table": [
            {
                "planet": pos.planet,
                "longitude": pos.longitude,
                "rasi": pos.rasi,
                "nakshatra": pos.nakshatra,
                "pada": pos.nakshatra_pada,
                "degree_in_rasi": pos.degree_in_rasi,
                "is_retrograde": bool(pos.is_retrograde),
                "is_combust": bool(pos.is_combust),
                "dignity": pos.dignity
            }
            for pos in positions
        ]
    }

def get_or_compute_chart(profile: Profile, db: Session) -> NatalChart:
    """Get cached chart or compute new one"""
    # Build datetime from profile
    birth_datetime = datetime.combine(
        profile.birth_date.date(),
        datetime.strptime(profile.birth_time, "%H:%M:%S").time()
    )
    
    # Generate hash
    chart_hash = chart_calculator.generate_chart_hash(
        birth_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    # Check cache
    natal_chart = db.query(NatalChart).filter(
        NatalChart.chart_hash == chart_hash
    ).first()
    
    if natal_chart:
        return natal_chart
    
    # Compute new chart
    chart_data = chart_calculator.calculate_natal_chart(
        birth_datetime,
        profile.latitude,
        profile.longitude,
        profile.ayanamsa
    )
    
    # Store in DB
    natal_chart = NatalChart(
        profile_id=profile.id,
        chart_hash=chart_hash,
        julian_day=chart_data["julian_day"],
        ayanamsa_value=chart_data["ayanamsa_value"],
        ascendant=chart_data["ascendant"],
        mc=chart_data["mc"],
        house_cusps=chart_data["house_cusps"],
        created_at=datetime.utcnow()
    )
    db.add(natal_chart)
    db.flush()
    
    # Store planetary positions
    for planet, pos in chart_data["planets"].items():
        planet_pos = PlanetaryPosition(
            natal_chart_id=natal_chart.id,
            planet=planet,
            longitude=pos["longitude"],
            latitude=pos.get("latitude"),
            distance=pos.get("distance"),
            speed=pos.get("speed"),
            is_retrograde=1 if pos.get("is_retrograde") else 0,
            nakshatra=pos.get("nakshatra"),
            nakshatra_pada=pos.get("pada"),
            rasi=pos.get("rasi"),
            degree_in_rasi=pos.get("degree_in_rasi"),
            is_combust=1 if pos.get("is_combust") else 0,
            dignity=pos.get("dignity")
        )
        db.add(planet_pos)
    
    # Store divisional charts
    from app.modules.charts.calculator import DivisionalChartCalculator
    div_calc = DivisionalChartCalculator()
    
    for div_num, div_name in div_calc.DIVISIONS.items():
        div_positions = chart_data["divisional_charts"].get(div_num, {})
        
        div_chart = DivisionalChart(
            natal_chart_id=natal_chart.id,
            division=div_num,
            division_name=div_name,
            planetary_positions=div_positions
        )
        db.add(div_chart)
    
    db.commit()
    db.refresh(natal_chart)
    
    return natal_chart

def format_north_indian_chart(natal_chart: NatalChart, profile: Profile) -> dict:
    """Format chart for North Indian display"""
    # Get planetary positions
    from app.core.database import SessionLocal
    db = SessionLocal()
    
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id
    ).all()
    
    # Calculate ascendant rasi
    asc_rasi = int(natal_chart.ascendant / 30.0) + 1
    
    # North Indian chart has fixed house positions
    # Houses are arranged: 1=center-top, 2=left, 3=bottom-left, etc.
    # We need to map rasis to houses based on ascendant
    
    houses = {}
    for house_num in range(1, 13):
        rasi_num = ((asc_rasi - 1 + house_num - 1) % 12) + 1
        houses[house_num] = {
            "rasi": rasi_num,
            "planets": []
        }
    
    # Place planets in houses
    for pos in positions:
        planet_rasi = pos.rasi
        # Find which house this rasi is in
        for house_num, house_data in houses.items():
            if house_data["rasi"] == planet_rasi:
                houses[house_num]["planets"].append({
                    "planet": pos.planet,
                    "degree": round(pos.degree_in_rasi, 2)
                })
                break
    
    db.close()
    
    return {
        "chart_type": "north_indian",
        "ascendant": natal_chart.ascendant,
        "ascendant_rasi": asc_rasi,
        "houses": houses,
        "sign_names": [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
    }
