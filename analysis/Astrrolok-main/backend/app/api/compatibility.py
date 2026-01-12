from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.compatibility import CompatibilityReport
from app.api.charts import get_or_compute_chart
from app.modules.compatibility.calculator import compatibility_calculator
from app.models.chart import PlanetaryPosition

router = APIRouter(prefix="/api/compatibility", tags=["compatibility"])

@router.get("/{profile_id}/manglik")
async def check_manglik_status(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check Manglik status for a single profile"""
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
    
    chart = {
        "ascendant": natal_chart.ascendant,
        "planets": {pos.planet: {
            "rasi": pos.rasi,
            "longitude": pos.longitude,
            "dignity": pos.dignity
        } for pos in positions}
    }
    
    manglik = compatibility_calculator.check_manglik(chart)
    
    # Add remedies if Manglik
    if manglik["is_manglik"]:
        manglik["remedies"] = [
            "Kumbh Vivah (marriage to pot/tree) ceremony",
            "Chanting Hanuman Chalisa",
            "Wearing Red Coral after consultation",
            "Visiting Mangal (Mars) temples on Tuesdays",
            "Donating red items on Tuesdays"
        ]
    
    return {
        "profile": {"id": profile.id, "name": profile.name},
        "manglik_status": manglik
    }

@router.get("/{profile1_id}/{profile2_id}")
async def get_compatibility(
    profile1_id: int,
    profile2_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Ashtakoot compatibility between two profiles"""
    # Verify both profiles belong to user
    profile1 = db.query(Profile).filter(
        Profile.id == profile1_id,
        Profile.user_id == current_user.id
    ).first()
    
    profile2 = db.query(Profile).filter(
        Profile.id == profile2_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile1 or not profile2:
        raise HTTPException(status_code=404, detail="One or both profiles not found")
    
    # Check cache
    cached = db.query(CompatibilityReport).filter(
        CompatibilityReport.profile1_id == profile1_id,
        CompatibilityReport.profile2_id == profile2_id
    ).first()
    
    if cached:
        return {
            "profile1": {"id": profile1.id, "name": profile1.name},
            "profile2": {"id": profile2.id, "name": profile2.name},
            "ashtakoot": cached.ashtakoot_scores,
            "total_score": cached.total_score,
            "manglik_analysis": cached.manglik_analysis,
            "dasha_sandhi": cached.dasha_sandhi,
            "recommendations": cached.recommendations
        }
    
    # Get charts for both profiles
    natal_chart1 = get_or_compute_chart(profile1, db)
    natal_chart2 = get_or_compute_chart(profile2, db)
    
    # Get planetary positions
    positions1 = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart1.id
    ).all()
    
    positions2 = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart2.id
    ).all()
    
    # Build chart data structures
    chart1 = {
        "ascendant": natal_chart1.ascendant,
        "planets": {pos.planet: {
            "rasi": pos.rasi,
            "nakshatra": pos.nakshatra,
            "longitude": pos.longitude,
            "dignity": pos.dignity
        } for pos in positions1}
    }
    
    chart2 = {
        "ascendant": natal_chart2.ascendant,
        "planets": {pos.planet: {
            "rasi": pos.rasi,
            "nakshatra": pos.nakshatra,
            "longitude": pos.longitude,
            "dignity": pos.dignity
        } for pos in positions2}
    }
    
    # Calculate Ashtakoot
    ashtakoot = compatibility_calculator.calculate_ashtakoot(chart1, chart2)
    
    # Check Manglik for both
    manglik1 = compatibility_calculator.check_manglik(chart1)
    manglik2 = compatibility_calculator.check_manglik(chart2)
    
    manglik_analysis = {
        "profile1": manglik1,
        "profile2": manglik2,
        "both_manglik": manglik1["is_manglik"] and manglik2["is_manglik"],
        "manglik_match": manglik1["is_manglik"] == manglik2["is_manglik"],
        "recommendation": get_manglik_recommendation(manglik1, manglik2)
    }
    
    # Check Dasha Sandhi (simplified)
    dasha_sandhi = check_dasha_sandhi(profile1, profile2)
    
    # Generate recommendations
    recommendations = generate_recommendations(ashtakoot, manglik_analysis)
    
    # Format scores for storage
    ashtakoot_scores = {
        koot: {"score": score[0], "description": score[1]}
        for koot, score in ashtakoot["scores"].items()
    }
    
    # Cache result
    report = CompatibilityReport(
        profile1_id=profile1_id,
        profile2_id=profile2_id,
        total_score=ashtakoot["total"],
        ashtakoot_scores=ashtakoot_scores,
        manglik_analysis=manglik_analysis,
        dasha_sandhi=dasha_sandhi,
        recommendations=recommendations,
        created_at=datetime.utcnow()
    )
    db.add(report)
    db.commit()
    
    return {
        "profile1": {"id": profile1.id, "name": profile1.name},
        "profile2": {"id": profile2.id, "name": profile2.name},
        "ashtakoot": {
            "scores": ashtakoot_scores,
            "total": ashtakoot["total"],
            "max": ashtakoot["max"],
            "percentage": round(ashtakoot["percentage"], 1),
            "compatibility": ashtakoot["compatibility"]
        },
        "manglik_analysis": manglik_analysis,
        "dasha_sandhi": dasha_sandhi,
        "recommendations": recommendations
    }


@router.get("/{profile1_id}/{profile2_id}/detailed")
async def get_detailed_compatibility(
    profile1_id: int,
    profile2_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed compatibility analysis with interpretations"""
    # Get basic compatibility first
    profile1 = db.query(Profile).filter(
        Profile.id == profile1_id,
        Profile.user_id == current_user.id
    ).first()
    
    profile2 = db.query(Profile).filter(
        Profile.id == profile2_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile1 or not profile2:
        raise HTTPException(status_code=404, detail="One or both profiles not found")
    
    # Get charts
    natal_chart1 = get_or_compute_chart(profile1, db)
    natal_chart2 = get_or_compute_chart(profile2, db)
    
    positions1 = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart1.id
    ).all()
    
    positions2 = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart2.id
    ).all()
    
    # Build detailed analysis
    detailed = {
        "moon_comparison": compare_moons(positions1, positions2),
        "venus_mars_analysis": analyze_venus_mars(positions1, positions2),
        "seventh_house_analysis": analyze_seventh_houses(natal_chart1, natal_chart2, positions1, positions2),
        "overall_assessment": ""
    }
    
    # Overall assessment
    moon_compat = detailed["moon_comparison"].get("compatibility", "Moderate")
    venus_mars = detailed["venus_mars_analysis"].get("harmony", "Moderate")
    
    if moon_compat == "Good" and venus_mars in ["Good", "Excellent"]:
        detailed["overall_assessment"] = "Strong emotional and physical compatibility"
    elif moon_compat == "Poor" or venus_mars == "Poor":
        detailed["overall_assessment"] = "Some areas may need attention and understanding"
    else:
        detailed["overall_assessment"] = "Balanced compatibility with room for growth"
    
    return detailed


def get_manglik_recommendation(manglik1: dict, manglik2: dict) -> str:
    """Generate recommendation based on Manglik status"""
    if not manglik1["is_manglik"] and not manglik2["is_manglik"]:
        return "No Manglik dosha present. Good compatibility."
    
    if manglik1["is_manglik"] and manglik2["is_manglik"]:
        return "Both partners are Manglik. Doshas cancel each other. Favorable match."
    
    if (manglik1["cancelled"] or manglik2["cancelled"]):
        return "Manglik dosha is cancelled. Match can proceed with caution."
    
    return "Manglik dosha mismatch. Recommend remedial measures before proceeding."


def check_dasha_sandhi(profile1: Profile, profile2: Profile) -> dict:
    """Check for Dasha Sandhi (dasha transition periods)"""
    # Simplified check - in real implementation would check actual dasha periods
    return {
        "sandhi_present": False,
        "description": "No major dasha transitions affecting compatibility",
        "recommendation": "Proceed with normal timeline"
    }


def generate_recommendations(ashtakoot: dict, manglik: dict) -> list:
    """Generate marriage recommendations"""
    recommendations = []
    
    total = ashtakoot["total"]
    
    if total >= 25:
        recommendations.append("Excellent match. Highly recommended for marriage.")
    elif total >= 18:
        recommendations.append("Good match. Marriage recommended with minor remedies.")
    elif total >= 12:
        recommendations.append("Average match. Consider remedies and mutual understanding.")
    else:
        recommendations.append("Below average match. Detailed analysis recommended.")
    
    # Manglik recommendations
    if not manglik["manglik_match"] and (manglik["profile1"]["is_manglik"] or manglik["profile2"]["is_manglik"]):
        recommendations.append("Manglik dosha mismatch - recommend Kumbh Vivah or other remedies.")
    
    # Check specific koots
    scores = ashtakoot.get("scores", {})
    
    if scores.get("nadi", (0,))[0] == 0:
        recommendations.append("Nadi dosha present - health and progeny may need attention.")
    
    if scores.get("bhakoot", (0,))[0] == 0:
        recommendations.append("Bhakoot dosha present - financial harmony may need focus.")
    
    return recommendations


def compare_moons(positions1, positions2) -> dict:
    """Compare Moon positions for emotional compatibility"""
    moon1 = next((p for p in positions1 if p.planet == "MOON"), None)
    moon2 = next((p for p in positions2 if p.planet == "MOON"), None)
    
    if not moon1 or not moon2:
        return {"compatibility": "Unknown", "description": "Moon data not available"}
    
    rasi_diff = abs(moon1.rasi - moon2.rasi)
    if rasi_diff > 6:
        rasi_diff = 12 - rasi_diff
    
    if rasi_diff in [0, 4, 8]:  # Same or trine
        return {
            "compatibility": "Good",
            "description": "Moons in harmonious positions - good emotional understanding",
            "moon1_nakshatra": moon1.nakshatra,
            "moon2_nakshatra": moon2.nakshatra
        }
    elif rasi_diff in [3, 9]:  # Square
        return {
            "compatibility": "Challenging",
            "description": "Moons in challenging positions - may need emotional adjustment",
            "moon1_nakshatra": moon1.nakshatra,
            "moon2_nakshatra": moon2.nakshatra
        }
    else:
        return {
            "compatibility": "Moderate",
            "description": "Average emotional compatibility",
            "moon1_nakshatra": moon1.nakshatra,
            "moon2_nakshatra": moon2.nakshatra
        }


def analyze_venus_mars(positions1, positions2) -> dict:
    """Analyze Venus-Mars relationship for physical compatibility"""
    venus1 = next((p for p in positions1 if p.planet == "VENUS"), None)
    mars1 = next((p for p in positions1 if p.planet == "MARS"), None)
    venus2 = next((p for p in positions2 if p.planet == "VENUS"), None)
    mars2 = next((p for p in positions2 if p.planet == "MARS"), None)
    
    if not all([venus1, mars1, venus2, mars2]):
        return {"harmony": "Unknown"}
    
    # Check Venus-Mars aspects between charts
    v1_m2_diff = abs(venus1.rasi - mars2.rasi)
    m1_v2_diff = abs(mars1.rasi - venus2.rasi)
    
    good_aspects = [0, 4, 8]  # Conjunction, trine
    
    if v1_m2_diff in good_aspects or m1_v2_diff in good_aspects:
        return {
            "harmony": "Excellent",
            "description": "Strong Venus-Mars connection indicates good physical harmony"
        }
    else:
        return {
            "harmony": "Moderate",
            "description": "Average physical compatibility"
        }


def analyze_seventh_houses(chart1, chart2, positions1, positions2) -> dict:
    """Analyze 7th houses for marriage compatibility"""
    asc1_rasi = int(chart1.ascendant / 30.0) + 1
    asc2_rasi = int(chart2.ascendant / 30.0) + 1
    
    seventh1 = ((asc1_rasi - 1 + 6) % 12) + 1
    seventh2 = ((asc2_rasi - 1 + 6) % 12) + 1
    
    return {
        "profile1_7th_house": seventh1,
        "profile2_7th_house": seventh2,
        "interpretation": "7th house analysis indicates marriage potential"
    }
