from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import Optional
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.align27 import DayScore, Moment, RitualRecommendation
from app.models.chart import NatalChart, PlanetaryPosition
from app.models.dasha import Dasha, DashaLevel
from app.modules.align27.calculator import align27_calculator
from app.modules.ephemeris.calculator import ephemeris

router = APIRouter(prefix="/api/align27", tags=["align27"])


def get_chart_data(profile: Profile, db: Session):
    """Get natal chart data for a profile"""
    chart = db.query(NatalChart).filter(NatalChart.profile_id == profile.id).first()
    if not chart:
        from app.api.charts import get_or_compute_chart
        chart = get_or_compute_chart(profile, db)
    
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == chart.id
    ).all()
    
    moon_pos = next((p for p in positions if p.planet == "MOON"), None)
    moon_rasi = moon_pos.rasi if moon_pos else 1
    asc_rasi = int(chart.ascendant / 30.0) + 1
    
    return chart, moon_rasi, asc_rasi


def get_current_dasha(profile: Profile, db: Session, target_date: date) -> dict:
    """Get current dasha for profile on target date"""
    chart = db.query(NatalChart).filter(NatalChart.profile_id == profile.id).first()
    if not chart:
        return None
    
    target_dt = datetime.combine(target_date, datetime.min.time())
    
    dasha = db.query(Dasha).filter(
        Dasha.natal_chart_id == chart.id,
        Dasha.level == DashaLevel.MAHA,
        Dasha.start_date <= target_dt,
        Dasha.end_date >= target_dt
    ).first()
    
    if dasha:
        return {
            "lord": dasha.lord,
            "start_date": dasha.start_date.isoformat(),
            "end_date": dasha.end_date.isoformat()
        }
    return None


def get_transiting_planets(target_date: date) -> dict:
    """Get current transit positions"""
    jd = ephemeris.get_julian_day(datetime.combine(target_date, datetime.min.time()))
    planets = ephemeris.get_all_planets(jd)
    
    for planet, pos in planets.items():
        pos["rasi"] = ephemeris.get_rasi(pos["longitude"])
    
    return planets


@router.get("/day")
async def get_day_score(
    profile_id: int,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get daily Cosmic Traffic Light score.
    Returns score (0-100), color (GREEN/AMBER/RED), reasons, key transits, and dasha overlay.
    """
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get chart data
    chart, moon_rasi, asc_rasi = get_chart_data(profile, db)
    
    # Calculate hash for caching
    calc_hash = align27_calculator.calculate_hash(profile_id, target_date, moon_rasi, asc_rasi)
    
    # Check cache
    cached = db.query(DayScore).filter(
        DayScore.profile_id == profile_id,
        DayScore.date == target_date,
        DayScore.calculation_hash == calc_hash
    ).first()
    
    if cached:
        return {
            "date": target_date.isoformat(),
            "score": cached.score,
            "color": cached.traffic_light,
            "reasons": cached.reasons or [],
            "key_transits": cached.key_transits or [],
            "dasha_overlay": cached.dasha_overlay
        }
    
    # Calculate fresh
    transits = get_transiting_planets(target_date)
    current_dasha = get_current_dasha(profile, db, target_date)
    
    result = align27_calculator.calculate_day_score(
        target_date, moon_rasi, asc_rasi, transits, current_dasha
    )
    
    # Delete old cached entry if exists
    db.query(DayScore).filter(
        DayScore.profile_id == profile_id,
        DayScore.date == target_date
    ).delete()
    
    # Store in DB
    day_score = DayScore(
        profile_id=profile_id,
        date=target_date,
        score=result["score"],
        traffic_light=result["color"],
        reasons=result["reasons"],
        key_transits=result["key_transits"],
        dasha_overlay=result["dasha_overlay"],
        calculation_hash=calc_hash,
        created_at=datetime.utcnow()
    )
    db.add(day_score)
    db.commit()
    
    return {
        "date": target_date.isoformat(),
        "score": result["score"],
        "color": result["color"],
        "reasons": result["reasons"],
        "key_transits": result["key_transits"],
        "dasha_overlay": result["dasha_overlay"]
    }


@router.get("/moments")
async def get_moments(
    profile_id: int,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get daily moments (GOLDEN, PRODUCTIVE, SILENCE time windows).
    Returns non-overlapping time blocks with type, start, end, reason, confidence.
    """
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get chart data
    chart, moon_rasi, asc_rasi = get_chart_data(profile, db)
    
    # Check cache (via DayScore)
    calc_hash = align27_calculator.calculate_hash(profile_id, target_date, moon_rasi, asc_rasi)
    day_score = db.query(DayScore).filter(
        DayScore.profile_id == profile_id,
        DayScore.date == target_date,
        DayScore.calculation_hash == calc_hash
    ).first()
    
    if day_score:
        cached_moments = db.query(Moment).filter(
            Moment.day_score_id == day_score.id
        ).order_by(Moment.start_time).all()
        
        if cached_moments:
            return {
                "date": target_date.isoformat(),
                "moments": [
                    {
                        "type": m.moment_type,
                        "start": m.start_time.strftime("%H:%M"),
                        "end": m.end_time.strftime("%H:%M"),
                        "reason": m.reason,
                        "confidence": m.confidence
                    }
                    for m in cached_moments
                ]
            }
    
    # Calculate fresh
    transits = get_transiting_planets(target_date)
    moments = align27_calculator.generate_moments(
        target_date, moon_rasi, asc_rasi, transits
    )
    
    # Ensure day_score exists for storing moments
    if not day_score:
        current_dasha = get_current_dasha(profile, db, target_date)
        score_result = align27_calculator.calculate_day_score(
            target_date, moon_rasi, asc_rasi, transits, current_dasha
        )
        
        day_score = DayScore(
            profile_id=profile_id,
            date=target_date,
            score=score_result["score"],
            traffic_light=score_result["color"],
            reasons=score_result["reasons"],
            key_transits=score_result["key_transits"],
            dasha_overlay=score_result["dasha_overlay"],
            calculation_hash=calc_hash,
            created_at=datetime.utcnow()
        )
        db.add(day_score)
        db.commit()
        db.refresh(day_score)
    
    # Clear old moments and store new
    db.query(Moment).filter(Moment.day_score_id == day_score.id).delete()
    
    for m in moments:
        moment = Moment(
            day_score_id=day_score.id,
            moment_type=m["type"],
            start_time=m["start"],
            end_time=m["end"],
            reason=m["reason"],
            confidence=m["confidence"],
            planetary_basis=m.get("planetary_basis")
        )
        db.add(moment)
    
    db.commit()
    
    return {
        "date": target_date.isoformat(),
        "moments": [
            {
                "type": m["type"],
                "start": m["start"].strftime("%H:%M"),
                "end": m["end"].strftime("%H:%M"),
                "reason": m["reason"],
                "confidence": m["confidence"]
            }
            for m in moments
        ]
    }


@router.get("/rituals")
async def get_rituals(
    profile_id: int,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get ritual recommendations for the day.
    Returns ritual list with name, description, tags, why, duration, materials.
    """
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get chart data
    chart, moon_rasi, asc_rasi = get_chart_data(profile, db)
    
    # Get day score first
    calc_hash = align27_calculator.calculate_hash(profile_id, target_date, moon_rasi, asc_rasi)
    day_score_record = db.query(DayScore).filter(
        DayScore.profile_id == profile_id,
        DayScore.date == target_date,
        DayScore.calculation_hash == calc_hash
    ).first()
    
    # Check cached rituals
    if day_score_record:
        cached_rituals = db.query(RitualRecommendation).filter(
            RitualRecommendation.day_score_id == day_score_record.id
        ).order_by(RitualRecommendation.priority).all()
        
        if cached_rituals:
            return {
                "date": target_date.isoformat(),
                "rituals": [
                    {
                        "ritual_name": r.ritual_name,
                        "description": r.description,
                        "tags": r.tags or [],
                        "why": r.why,
                        "duration_minutes": r.duration_minutes,
                        "materials_needed": r.materials_needed or []
                    }
                    for r in cached_rituals
                ]
            }
    
    # Calculate fresh
    transits = get_transiting_planets(target_date)
    current_dasha = get_current_dasha(profile, db, target_date)
    
    # Ensure day_score exists
    if not day_score_record:
        score_result = align27_calculator.calculate_day_score(
            target_date, moon_rasi, asc_rasi, transits, current_dasha
        )
        
        day_score_record = DayScore(
            profile_id=profile_id,
            date=target_date,
            score=score_result["score"],
            traffic_light=score_result["color"],
            reasons=score_result["reasons"],
            key_transits=score_result["key_transits"],
            dasha_overlay=score_result["dasha_overlay"],
            calculation_hash=calc_hash,
            created_at=datetime.utcnow()
        )
        db.add(day_score_record)
        db.commit()
        db.refresh(day_score_record)
    
    day_score = {
        "score": day_score_record.score,
        "color": day_score_record.traffic_light
    }
    
    rituals = align27_calculator.generate_rituals(
        target_date, day_score, moon_rasi, current_dasha
    )
    
    # Clear old and store new
    db.query(RitualRecommendation).filter(
        RitualRecommendation.day_score_id == day_score_record.id
    ).delete()
    
    for r in rituals:
        ritual = RitualRecommendation(
            day_score_id=day_score_record.id,
            ritual_name=r["ritual_name"],
            description=r["description"],
            tags=r.get("tags", []),
            why=r.get("why", ""),
            duration_minutes=r.get("duration_minutes"),
            materials_needed=r.get("materials_needed", []),
            priority=r.get("priority", 2)
        )
        db.add(ritual)
    
    db.commit()
    
    return {
        "date": target_date.isoformat(),
        "rituals": rituals
    }


@router.get("/planner")
async def get_planner(
    profile_id: int,
    start: str = Query(..., description="Start date YYYY-MM-DD"),
    days: int = Query(90, ge=1, le=365, description="Number of days"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get planner for multiple days.
    Returns list of day summaries with date, score, color, best moment.
    """
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        start_date = datetime.strptime(start, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get chart data
    chart, moon_rasi, asc_rasi = get_chart_data(profile, db)
    
    # Get transits and dasha
    transits = get_transiting_planets(start_date)
    current_dasha = get_current_dasha(profile, db, start_date)
    
    # Generate planner
    planner = align27_calculator.generate_planner(
        start_date, days, moon_rasi, asc_rasi, transits, current_dasha
    )
    
    return {
        "profile_id": profile_id,
        "start_date": start_date.isoformat(),
        "days": days,
        "planner": planner
    }


@router.get("/ics")
async def get_ics_export(
    profile_id: int,
    start: str = Query(..., description="Start date YYYY-MM-DD"),
    end: str = Query(..., description="End date YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export moments to ICS calendar format.
    Returns downloadable .ics file.
    """
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        start_date = datetime.strptime(start, "%Y-%m-%d").date()
        end_date = datetime.strptime(end, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    if (end_date - start_date).days > 365:
        raise HTTPException(status_code=400, detail="Maximum range is 365 days")
    
    # Get chart data
    chart, moon_rasi, asc_rasi = get_chart_data(profile, db)
    
    # Get transits
    transits = get_transiting_planets(start_date)
    
    # Generate ICS
    ics_content = align27_calculator.generate_ics_events(
        start_date, end_date, profile.name,
        moon_rasi, asc_rasi, transits
    )
    
    filename = f"astroos_moments_{start}_{end}.ics"
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/today")
async def get_today_summary(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete today summary: score, moments, and rituals.
    Convenience endpoint combining day, moments, and rituals.
    """
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    today = date.today()
    today_str = today.isoformat()
    
    # Get chart data
    chart, moon_rasi, asc_rasi = get_chart_data(profile, db)
    
    # Get transits and dasha
    transits = get_transiting_planets(today)
    current_dasha = get_current_dasha(profile, db, today)
    
    # Calculate all data
    day_score = align27_calculator.calculate_day_score(
        today, moon_rasi, asc_rasi, transits, current_dasha
    )
    
    moments = align27_calculator.generate_moments(
        today, moon_rasi, asc_rasi, transits
    )
    
    rituals = align27_calculator.generate_rituals(
        today, day_score, moon_rasi, current_dasha
    )
    
    return {
        "date": today_str,
        "profile_id": profile_id,
        "profile_name": profile.name,
        "day_score": {
            "score": day_score["score"],
            "color": day_score["color"],
            "reasons": day_score["reasons"]
        },
        "moments": [
            {
                "type": m["type"],
                "start": m["start"].strftime("%H:%M"),
                "end": m["end"].strftime("%H:%M"),
                "reason": m["reason"],
                "confidence": m["confidence"]
            }
            for m in moments
        ],
        "rituals": rituals[:4],  # Top 4 rituals
        "dasha": current_dasha
    }
