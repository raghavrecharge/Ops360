from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.chart import PlanetaryPosition
from app.modules.ephemeris.calculator import ephemeris
from app.api.charts import get_or_compute_chart
from app.api.dashas import get_current_dasha, get_or_compute_dashas

router = APIRouter(prefix="/api/transits", tags=["transits"])

@router.get("/today/{profile_id}")
async def get_today_transits(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's transits with Sade Sati and Dhaiya indicators"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get natal Moon position
    natal_moon = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id,
        PlanetaryPosition.planet == "MOON"
    ).first()
    
    # Get today's transits
    today = datetime.now()
    jd = ephemeris.get_julian_day(today)
    transiting_planets = ephemeris.get_all_planets(jd)
    
    # Add rasi to transiting planets
    for planet, pos in transiting_planets.items():
        pos["rasi"] = ephemeris.get_rasi(pos["longitude"])
        pos["nakshatra"], pos["pada"] = ephemeris.get_nakshatra(pos["longitude"])
    
    # Check Sade Sati
    saturn_rasi = transiting_planets["SATURN"]["rasi"]
    moon_rasi = natal_moon.rasi
    
    sade_sati_phase = check_sade_sati(saturn_rasi, moon_rasi)
    dhaiya_kantaka = check_dhaiya_kantaka(saturn_rasi, moon_rasi)
    
    # Get current dasha
    dashas = get_or_compute_dashas(natal_chart, profile, "VIMSHOTTARI", db)
    current_md = get_current_dasha([d for d in dashas if d["level"] == "MAHA"])
    current_ad = None
    
    if current_md:
        children = db.query(app.models.dasha.Dasha).filter(
            app.models.dasha.Dasha.parent_id == current_md["id"]
        ).all()
        
        for child in children:
            if child.start_date <= today < child.end_date:
                current_ad = {
                    "lord": child.lord,
                    "start_date": child.start_date.isoformat(),
                    "end_date": child.end_date.isoformat()
                }
                break
    
    return {
        "date": today.isoformat(),
        "transiting_planets": {
            planet: {
                "longitude": pos["longitude"],
                "rasi": pos["rasi"],
                "nakshatra": pos["nakshatra"],
                "is_retrograde": pos.get("is_retrograde", False)
            }
            for planet, pos in transiting_planets.items()
        },
        "sade_sati": sade_sati_phase,
        "dhaiya_kantaka": dhaiya_kantaka,
        "current_dasha": {
            "maha_dasha": current_md,
            "antar_dasha": current_ad
        }
    }

@router.get("/range/{profile_id}")
async def get_transits_range(
    profile_id: int,
    start: str,
    end: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transits for a date range"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    start_date = datetime.fromisoformat(start)
    end_date = datetime.fromisoformat(end)
    
    transits = []
    current_date = start_date
    
    while current_date <= end_date:
        jd = ephemeris.get_julian_day(current_date)
        planets = ephemeris.get_all_planets(jd)
        
        # Add rasi
        for planet, pos in planets.items():
            pos["rasi"] = ephemeris.get_rasi(pos["longitude"])
        
        transits.append({
            "date": current_date.isoformat(),
            "planets": {
                planet: {
                    "rasi": pos["rasi"],
                    "longitude": pos["longitude"]
                }
                for planet, pos in planets.items()
            }
        })
        
        current_date += timedelta(days=1)
    
    return {
        "start_date": start,
        "end_date": end,
        "transits": transits
    }

def check_sade_sati(saturn_rasi: int, moon_rasi: int) -> dict:
    """Check Sade Sati phase"""
    diff = (saturn_rasi - moon_rasi) % 12
    
    if diff == 11:  # 12th from Moon
        return {
            "is_active": True,
            "phase": "rising",
            "description": "First phase - Saturn in 12th from Moon"
        }
    elif diff == 0:  # Over Moon
        return {
            "is_active": True,
            "phase": "peak",
            "description": "Second phase - Saturn over natal Moon (peak period)"
        }
    elif diff == 1:  # 2nd from Moon
        return {
            "is_active": True,
            "phase": "setting",
            "description": "Third phase - Saturn in 2nd from Moon"
        }
    else:
        return {
            "is_active": False,
            "phase": None,
            "description": "Not in Sade Sati"
        }

def check_dhaiya_kantaka(saturn_rasi: int, moon_rasi: int) -> dict:
    """Check Dhaiya and Kantaka Shani"""
    diff = (saturn_rasi - moon_rasi) % 12
    
    if diff == 3:  # 4th from Moon
        return {
            "is_active": True,
            "type": "dhaiya",
            "description": "Saturn in 4th from Moon (Dhaiya - 2.5 years of challenges)"
        }
    elif diff == 7:  # 8th from Moon
        return {
            "is_active": True,
            "type": "kantaka",
            "description": "Saturn in 8th from Moon (Kantaka Shani - obstacles)"
        }
    else:
        return {
            "is_active": False,
            "type": None,
            "description": "Not in Dhaiya or Kantaka"
        }

import app.models.dasha
