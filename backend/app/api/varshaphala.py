from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, Dict, List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.varshaphala import VarshaphalaRecord
from app.api.charts import get_or_compute_chart
from app.modules.varshaphala.calculator import varshaphala_calculator
from app.models.chart import PlanetaryPosition

router = APIRouter(prefix="/api/varshaphala", tags=["varshaphala"])

@router.get("/{profile_id}/{year}")
async def get_varshaphala(
    profile_id: int,
    year: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Varshaphala (annual chart) for a specific year"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Check cache first
    cached = db.query(VarshaphalaRecord).filter(
        VarshaphalaRecord.profile_id == profile_id,
        VarshaphalaRecord.year == year
    ).first()
    
    if cached:
        return {
            "year": cached.year,
            "varsha_pravesh_date": cached.varsha_pravesh_date.isoformat(),
            "ascendant": cached.ascendant,
            "planetary_positions": cached.planetary_positions,
            "tajika_yogas": cached.tajika_yogas,
            "sahams": cached.sahams,
            "mudda_dasha": cached.annual_dasha,
            "predictions": cached.predictions
        }
    
    # Get natal chart to find birth Sun position
    natal_chart = get_or_compute_chart(profile, db)
    
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id,
        PlanetaryPosition.planet == "SUN"
    ).first()
    
    if not positions:
        raise HTTPException(status_code=500, detail="Could not find natal Sun position")
    
    birth_sun_lon = positions.longitude
    
    # Calculate Varsha Pravesh time
    birth_datetime = datetime.combine(
        profile.birth_date.date(),
        datetime.strptime(profile.birth_time, "%H:%M:%S").time()
    )
    
    varsha_pravesh = varshaphala_calculator.calculate_varsha_pravesh(
        birth_datetime, birth_sun_lon, year
    )
    
    # Calculate annual chart
    annual_chart = varshaphala_calculator.calculate_annual_chart(
        varsha_pravesh, profile.latitude, profile.longitude
    )
    
    # Detect Tajika yogas
    tajika_yogas = varshaphala_calculator.detect_tajika_yogas(annual_chart["planets"])
    
    # Calculate Sahams
    sahams = varshaphala_calculator.calculate_sahams(
        annual_chart["planets"], annual_chart["ascendant"]
    )
    
    # Calculate Mudda Dasha
    mudda_dasha = varshaphala_calculator.calculate_mudda_dasha(birth_datetime, year)
    
    # Format planetary positions
    planets_formatted = {}
    for planet, pos in annual_chart["planets"].items():
        planets_formatted[planet] = {
            "longitude": pos["longitude"],
            "rasi": pos.get("rasi", int(pos["longitude"] / 30.0) + 1),
            "nakshatra": pos.get("nakshatra", ""),
            "is_retrograde": pos.get("is_retrograde", False)
        }
    
    # Generate basic predictions
    predictions = generate_annual_predictions(planets_formatted, tajika_yogas)
    
    # Cache the result
    record = VarshaphalaRecord(
        profile_id=profile_id,
        year=year,
        varsha_pravesh_date=varsha_pravesh,
        julian_day=annual_chart["julian_day"],
        ascendant=annual_chart["ascendant"],
        planetary_positions=planets_formatted,
        tajika_yogas=[{"name": y["name"], "planets": y["planets"], "description": y["description"]} for y in tajika_yogas],
        sahams=sahams,
        annual_dasha=[{"sign": d["sign"], "start_date": d["start_date"].isoformat(), "end_date": d["end_date"].isoformat()} for d in mudda_dasha],
        predictions=predictions
    )
    db.add(record)
    db.commit()
    
    return {
        "year": year,
        "varsha_pravesh_date": varsha_pravesh.isoformat(),
        "ascendant": annual_chart["ascendant"],
        "ascendant_rasi": int(annual_chart["ascendant"] / 30.0) + 1,
        "planetary_positions": planets_formatted,
        "tajika_yogas": tajika_yogas,
        "sahams": sahams,
        "mudda_dasha": [{"sign": d["sign"], "start_date": d["start_date"].isoformat(), "end_date": d["end_date"].isoformat()} for d in mudda_dasha],
        "predictions": predictions
    }


@router.get("/{profile_id}/compare/{year1}/{year2}")
async def compare_varshaphala(
    profile_id: int,
    year1: int,
    year2: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare Varshaphala of two years"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get both years' data
    v1 = db.query(VarshaphalaRecord).filter(
        VarshaphalaRecord.profile_id == profile_id,
        VarshaphalaRecord.year == year1
    ).first()
    
    v2 = db.query(VarshaphalaRecord).filter(
        VarshaphalaRecord.profile_id == profile_id,
        VarshaphalaRecord.year == year2
    ).first()
    
    if not v1 or not v2:
        raise HTTPException(status_code=404, detail="Please generate both years first")
    
    return {
        "year1": {
            "year": v1.year,
            "ascendant": v1.ascendant,
            "tajika_yoga_count": len(v1.tajika_yogas) if v1.tajika_yogas else 0
        },
        "year2": {
            "year": v2.year,
            "ascendant": v2.ascendant,
            "tajika_yoga_count": len(v2.tajika_yogas) if v2.tajika_yogas else 0
        },
        "comparison": {
            "ascendant_changed": abs((v1.ascendant or 0) - (v2.ascendant or 0)) > 30,
            "yoga_difference": (len(v2.tajika_yogas) if v2.tajika_yogas else 0) - (len(v1.tajika_yogas) if v1.tajika_yogas else 0)
        }
    }


@router.get("/{profile_id}/muntha/{year}")
async def get_muntha(
    profile_id: int,
    year: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Muntha position for a year"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get natal ascendant
    natal_chart = get_or_compute_chart(profile, db)
    natal_asc_rasi = int(natal_chart.ascendant / 30.0) + 1
    
    # Calculate age
    birth_year = profile.birth_date.year
    age = year - birth_year
    
    # Muntha moves one sign per year from natal ascendant
    muntha_rasi = ((natal_asc_rasi - 1 + age) % 12) + 1
    
    sign_names = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    # Determine house from annual ascendant
    varsha = db.query(VarshaphalaRecord).filter(
        VarshaphalaRecord.profile_id == profile_id,
        VarshaphalaRecord.year == year
    ).first()
    
    annual_asc_rasi = int((varsha.ascendant if varsha else natal_chart.ascendant) / 30.0) + 1
    muntha_house = ((muntha_rasi - annual_asc_rasi) % 12) + 1
    
    # Interpretation
    house_meanings = {
        1: "Good health, success, happiness",
        2: "Financial gains, family prosperity",
        3: "Courage, short journeys, siblings benefit",
        4: "Property gains, mother's health, vehicles",
        5: "Children prosperity, romance, creativity",
        6: "Victory over enemies, health issues may arise",
        7: "Marriage prospects, partnerships",
        8: "Obstacles, health concerns, transformation",
        9: "Luck, long journeys, spiritual growth",
        10: "Career success, recognition",
        11: "Gains, wishes fulfilled, friendships",
        12: "Expenses, foreign connections, spirituality"
    }
    
    return {
        "year": year,
        "age": age,
        "muntha_rasi": muntha_rasi,
        "muntha_sign": sign_names[muntha_rasi - 1],
        "muntha_house": muntha_house,
        "interpretation": house_meanings.get(muntha_house, "General year"),
        "is_favorable": muntha_house in [1, 2, 4, 5, 9, 10, 11]
    }


def generate_annual_predictions(planets: Dict, yogas: List) -> Dict:
    """Generate basic annual predictions"""
    predictions = {
        "overall_theme": "",
        "career": "",
        "relationships": "",
        "health": "",
        "finance": ""
    }
    
    # Determine overall theme based on yogas
    if len(yogas) >= 3:
        predictions["overall_theme"] = "A year of significant developments with multiple planetary combinations active"
    elif len(yogas) >= 1:
        predictions["overall_theme"] = "Moderate year with specific areas of growth"
    else:
        predictions["overall_theme"] = "A stable year focused on consolidation"
    
    # Career based on 10th house lord (simplified)
    sun_rasi = planets.get("SUN", {}).get("rasi", 1)
    if sun_rasi in [1, 5, 9]:  # Fire signs
        predictions["career"] = "Dynamic period for career advancement and leadership opportunities"
    elif sun_rasi in [2, 6, 10]:  # Earth signs
        predictions["career"] = "Steady progress in career with focus on practical achievements"
    elif sun_rasi in [3, 7, 11]:  # Air signs
        predictions["career"] = "Good for networking, communications, and collaborative projects"
    else:  # Water signs
        predictions["career"] = "Intuitive approach to career, possible changes in direction"
    
    # Relationships based on Venus
    venus_rasi = planets.get("VENUS", {}).get("rasi", 1)
    if venus_rasi in [2, 7, 12]:  # Venus strong signs
        predictions["relationships"] = "Favorable period for relationships, harmony in partnerships"
    else:
        predictions["relationships"] = "Focus on communication and understanding in relationships"
    
    # Health based on Mars and Saturn
    mars_retro = planets.get("MARS", {}).get("is_retrograde", False)
    if mars_retro:
        predictions["health"] = "Need to manage energy levels, avoid overexertion"
    else:
        predictions["health"] = "Good vitality, maintain regular health routines"
    
    # Finance based on Jupiter
    jupiter_rasi = planets.get("JUPITER", {}).get("rasi", 1)
    if jupiter_rasi in [4, 9, 12]:  # Jupiter strong signs
        predictions["finance"] = "Good year for financial growth and investments"
    else:
        predictions["finance"] = "Steady financial year, focus on savings and wise spending"
    
    return predictions
