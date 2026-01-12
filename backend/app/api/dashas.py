from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.chart import NatalChart, PlanetaryPosition
from app.models.dasha import Dasha, DashaSystem, DashaLevel
from app.modules.dasha.calculator import dasha_engine, VimshottariDasha
from app.api.charts import get_or_compute_chart

router = APIRouter(prefix="/api/dashas", tags=["dashas"])

@router.get("/systems")
async def get_dasha_systems():
    """Get available dasha systems"""
    return {
        "systems": [
            {"id": "vimshottari", "name": "Vimshottari", "max_depth": 5},
            {"id": "yogini", "name": "Yogini", "max_depth": 2},
            {"id": "ashtottari", "name": "Ashtottari", "max_depth": 2},
            {"id": "kala_chakra", "name": "Kala Chakra", "max_depth": 2},
            {"id": "chara", "name": "Chara (Jaimini)", "max_depth": 2}
        ]
    }

@router.get("/{profile_id}")
async def get_dashas(
    profile_id: int,
    system: str = "vimshottari",
    depth: int = 1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashas for profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    natal_chart = get_or_compute_chart(profile, db)
    
    # Get or compute dashas
    dashas = get_or_compute_dashas(natal_chart, profile, system.upper(), db)
    
    # Filter by depth
    if depth == 1:
        dashas = [d for d in dashas if d["level"] == "maha"]
    
    # Get current dasha
    current_dasha = get_current_dasha(dashas)
    
    return {
        "system": system,
        "dashas": dashas,
        "current": current_dasha
    }

@router.get("/node/{dasha_id}/children")
async def get_dasha_children(
    dasha_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get children dashas for a parent dasha"""
    parent_dasha = db.query(Dasha).filter(Dasha.id == dasha_id).first()
    
    if not parent_dasha:
        raise HTTPException(status_code=404, detail="Dasha not found")
    
    # Verify ownership
    natal_chart = db.query(NatalChart).filter(
        NatalChart.id == parent_dasha.natal_chart_id
    ).first()
    
    profile = db.query(Profile).filter(
        Profile.id == natal_chart.profile_id,
        Profile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get children
    children = db.query(Dasha).filter(
        Dasha.parent_id == dasha_id
    ).order_by(Dasha.start_date).all()
    
    return {
        "parent": {
            "id": parent_dasha.id,
            "lord": parent_dasha.lord,
            "level": parent_dasha.level.value
        },
        "children": [
            {
                "id": d.id,
                "lord": d.lord,
                "level": d.level.value,
                "start_date": d.start_date.isoformat(),
                "end_date": d.end_date.isoformat(),
                "has_children": db.query(Dasha).filter(Dasha.parent_id == d.id).count() > 0
            }
            for d in children
        ]
    }

def get_or_compute_dashas(natal_chart: NatalChart, profile: Profile, system: str, db: Session):
    """Get cached dashas or compute new ones"""
    # Convert string to enum for comparison
    try:
        system_enum = DashaSystem[system]  # e.g., DashaSystem["VIMSHOTTARI"]
    except KeyError:
        system_enum = DashaSystem.VIMSHOTTARI  # Default
    
    # Check if dashas exist
    existing = db.query(Dasha).filter(
        Dasha.natal_chart_id == natal_chart.id,
        Dasha.system == system_enum
    ).first()
    
    if existing:
        # Return all dashas for this system
        all_dashas = db.query(Dasha).filter(
            Dasha.natal_chart_id == natal_chart.id,
            Dasha.system == system_enum
        ).order_by(Dasha.start_date).all()
        
        return [
            {
                "id": d.id,
                "lord": d.lord,
                "level": d.level.value,
                "start_date": d.start_date.isoformat(),
                "end_date": d.end_date.isoformat(),
                "parent_id": d.parent_id,
                "has_children": db.query(Dasha).filter(Dasha.parent_id == d.id).count() > 0
            }
            for d in all_dashas
        ]
    
    # Compute new dashas
    birth_datetime = datetime.combine(
        profile.birth_date.date(),
        datetime.strptime(profile.birth_time, "%H:%M:%S").time()
    )
    
    # Get Moon longitude
    moon_pos = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.natal_chart_id == natal_chart.id,
        PlanetaryPosition.planet == "MOON"
    ).first()
    
    if not moon_pos:
        raise HTTPException(status_code=500, detail="Moon position not found")
    
    # Calculate dashas
    if system == "VIMSHOTTARI":
        maha_dashas = dasha_engine.calculate_dashas(
            "vimshottari",
            birth_datetime,
            moon_pos.longitude,
            num_years=120
        )
        
        # Store Maha Dashas and compute all 5 levels
        calculator = VimshottariDasha(birth_datetime, moon_pos.longitude)
        
        for maha in maha_dashas[:10]:  # First 10 Maha Dashas
            maha_record = Dasha(
                natal_chart_id=natal_chart.id,
                system=DashaSystem.VIMSHOTTARI,
                level=DashaLevel.MAHA,
                lord=maha["lord"],
                start_date=maha["start_date"],
                end_date=maha["end_date"],
                parent_id=None
            )
            db.add(maha_record)
            db.flush()
            
            # Calculate Antar Dashas
            antar_dashas = calculator.calculate_antar_dashas(maha)
            for antar in antar_dashas:
                antar_record = Dasha(
                    natal_chart_id=natal_chart.id,
                    system=DashaSystem.VIMSHOTTARI,
                    level=DashaLevel.ANTAR,
                    lord=antar["lord"],
                    start_date=antar["start_date"],
                    end_date=antar["end_date"],
                    parent_id=maha_record.id
                )
                db.add(antar_record)
                db.flush()
                
                # Calculate Pratyantar Dashas (only for first 3 Antars to save space)
                if antar_dashas.index(antar) < 3:
                    pratyantar_dashas = calculator.calculate_pratyantar_dashas(antar)
                    for pratyantar in pratyantar_dashas:
                        pratyantar_record = Dasha(
                            natal_chart_id=natal_chart.id,
                            system=DashaSystem.VIMSHOTTARI,
                            level=DashaLevel.PRATYANTAR,
                            lord=pratyantar["lord"],
                            start_date=pratyantar["start_date"],
                            end_date=pratyantar["end_date"],
                            parent_id=antar_record.id
                        )
                        db.add(pratyantar_record)
                        db.flush()
                        
                        # Sookshma (only first Pratyantar)
                        if pratyantar_dashas.index(pratyantar) == 0:
                            sookshma_dashas = calculator.calculate_sookshma_dashas(pratyantar)
                            for sookshma in sookshma_dashas:
                                sookshma_record = Dasha(
                                    natal_chart_id=natal_chart.id,
                                    system=DashaSystem.VIMSHOTTARI,
                                    level=DashaLevel.SOOKSHMA,
                                    lord=sookshma["lord"],
                                    start_date=sookshma["start_date"],
                                    end_date=sookshma["end_date"],
                                    parent_id=pratyantar_record.id
                                )
                                db.add(sookshma_record)
                                db.flush()
                                
                                # Prana (only first Sookshma)
                                if sookshma_dashas.index(sookshma) == 0:
                                    prana_dashas = calculator.calculate_prana_dashas(sookshma)
                                    for prana in prana_dashas:
                                        prana_record = Dasha(
                                            natal_chart_id=natal_chart.id,
                                            system=DashaSystem.VIMSHOTTARI,
                                            level=DashaLevel.PRANA,
                                            lord=prana["lord"],
                                            start_date=prana["start_date"],
                                            end_date=prana["end_date"],
                                            parent_id=sookshma_record.id
                                        )
                                        db.add(prana_record)
    
    else:
        # Other systems (simplified - only Maha level stored)
        if system == "CHARA":
            # Get planets for Chara Dasha
            all_positions = db.query(PlanetaryPosition).filter(
                PlanetaryPosition.natal_chart_id == natal_chart.id
            ).all()
            
            planets_dict = {pos.planet: {"longitude": pos.longitude, "rasi": pos.rasi} for pos in all_positions}
            
            maha_dashas = dasha_engine.calculate_dashas(
                "chara",
                birth_datetime,
                moon_pos.longitude,
                ascendant=natal_chart.ascendant,
                planets=planets_dict,
                num_years=120
            )
        else:
            maha_dashas = dasha_engine.calculate_dashas(
                system.lower(),
                birth_datetime,
                moon_pos.longitude,
                num_years=120
            )
        
        for maha in maha_dashas[:20]:
            maha_record = Dasha(
                natal_chart_id=natal_chart.id,
                system=system_enum,
                level=DashaLevel.MAHA,
                lord=maha["lord"],
                start_date=maha["start_date"],
                end_date=maha["end_date"],
                parent_id=None
            )
            db.add(maha_record)
    
    db.commit()
    
    # Return all dashas
    all_dashas = db.query(Dasha).filter(
        Dasha.natal_chart_id == natal_chart.id,
        Dasha.system == system_enum
    ).order_by(Dasha.start_date).all()
    
    return [
        {
            "id": d.id,
            "lord": d.lord,
            "level": d.level.value,
            "start_date": d.start_date.isoformat(),
            "end_date": d.end_date.isoformat(),
            "parent_id": d.parent_id,
            "has_children": db.query(Dasha).filter(Dasha.parent_id == d.id).count() > 0
        }
        for d in all_dashas
    ]

def get_current_dasha(dashas):
    """Get currently running dasha"""
    now = datetime.now()
    
    for dasha in dashas:
        start = datetime.fromisoformat(dasha["start_date"])
        end = datetime.fromisoformat(dasha["end_date"])
        
        if start <= now < end:
            return dasha
    
    return None
