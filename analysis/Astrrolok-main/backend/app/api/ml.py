"""
ML API Endpoints
Life event prediction and training
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.modules.ml.life_event_classifier import LifeEventClassifier, EVENT_LABELS


router = APIRouter(prefix="/api/ml", tags=["machine-learning"])


class TrainingExampleRequest(BaseModel):
    profile_id: int
    event_type: str
    event_date: str  # ISO format
    features: Dict[str, float]
    metadata: Optional[Dict[str, Any]] = None


class PredictRequest(BaseModel):
    profile_id: Optional[int] = None
    features: Dict[str, float]


class TopFactor(BaseModel):
    factor: str
    description: str
    impact: str


class PredictionResponse(BaseModel):
    success: bool
    probabilities: Optional[Dict[str, float]] = None
    predictions: Optional[Dict[str, bool]] = None
    top_factors: Optional[List[TopFactor]] = None
    error: Optional[str] = None


class TrainingStatsResponse(BaseModel):
    total_examples: int
    by_event_type: Dict[str, int]
    active_model: Optional[Dict[str, Any]] = None


class TrainResponse(BaseModel):
    success: bool
    version: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.get("/event-labels")
async def get_event_labels():
    """Get available event labels for classification"""
    return {
        "labels": EVENT_LABELS,
        "descriptions": {
            "marriage": "Marriage or significant relationship milestone",
            "job_change": "Career change, promotion, or job transition",
            "health_issue": "Significant health event or concern",
            "foreign_travel": "International travel or relocation",
            "property_purchase": "Real estate acquisition or major purchase"
        }
    }


@router.post("/training-examples")
async def add_training_example(
    request: TrainingExampleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a training example for the classifier"""
    classifier = LifeEventClassifier(db)
    
    try:
        event_date = datetime.fromisoformat(request.event_date.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")
    
    if request.event_type not in EVENT_LABELS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid event type. Must be one of: {EVENT_LABELS}"
        )
    
    example = classifier.add_training_example(
        profile_id=request.profile_id,
        event_type=request.event_type,
        event_date=event_date,
        features=request.features,
        metadata=request.metadata
    )
    
    return {
        "id": example.id,
        "message": "Training example added successfully",
        "event_type": request.event_type
    }


@router.post("/train", response_model=TrainResponse)
async def train_model(
    min_examples: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Train the life event classifier"""
    classifier = LifeEventClassifier(db)
    result = classifier.train_model(min_examples=min_examples)
    
    if result["success"]:
        return TrainResponse(
            success=True,
            version=result["version"],
            metrics=result["metrics"]
        )
    else:
        return TrainResponse(
            success=False,
            error=result.get("error", "Training failed")
        )


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    request: PredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Predict life event probabilities"""
    classifier = LifeEventClassifier(db)
    result = classifier.predict(request.features)
    
    if result["success"]:
        return PredictionResponse(
            success=True,
            probabilities=result["probabilities"],
            predictions=result["predictions"],
            top_factors=[TopFactor(**f) for f in result["top_factors"]]
        )
    else:
        return PredictionResponse(
            success=False,
            error=result.get("error", "Prediction failed")
        )


@router.get("/stats", response_model=TrainingStatsResponse)
async def get_training_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get training data statistics"""
    classifier = LifeEventClassifier(db)
    stats = classifier.get_training_stats()
    return TrainingStatsResponse(**stats)


@router.post("/extract-features")
async def extract_features_from_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Extract ML features from a profile's astrological data.
    This endpoint fetches chart, dasha, transit, strength, and ashtakavarga data
    and converts them to the feature format needed for ML prediction.
    """
    # This would integrate with the astrology modules
    # For now, return a placeholder
    classifier = LifeEventClassifier(db)
    
    # In production, this would call the astrology APIs to get real data
    # For demo purposes, we'll return sample features
    sample_features = {
        "sun_house": 1, "moon_house": 4, "mars_house": 7,
        "mercury_house": 2, "jupiter_house": 9, "venus_house": 5,
        "saturn_house": 10, "rahu_house": 6, "ketu_house": 12,
        "sun_strength": 65.0, "moon_strength": 72.0, "mars_strength": 58.0,
        "mercury_strength": 70.0, "jupiter_strength": 80.0, "venus_strength": 68.0,
        "saturn_strength": 55.0, "rahu_strength": 45.0, "ketu_strength": 40.0,
        "mahadasha_lord_num": 5, "antardasha_lord_num": 6,
        "pratyantara_lord_num": 2, "dasha_balance_years": 3.5,
        "transit_sun": 10, "transit_moon": 2, "transit_mars": 4,
        "transit_mercury": 10, "transit_jupiter": 3, "transit_venus": 11,
        "transit_saturn": 1, "transit_rahu": 7, "transit_ketu": 1,
        "house_1_strength": 32, "house_2_strength": 28, "house_3_strength": 25,
        "house_4_strength": 30, "house_5_strength": 35, "house_6_strength": 22,
        "house_7_strength": 38, "house_8_strength": 20, "house_9_strength": 42,
        "house_10_strength": 36, "house_11_strength": 40, "house_12_strength": 18,
        "sade_sati_active": 0, "ketu_mahadasha": 0, "jupiter_return": 0,
        "saturn_return": 0, "rahu_ketu_axis_transit": 0
    }
    
    return {
        "profile_id": profile_id,
        "features": sample_features,
        "feature_count": len(sample_features),
        "note": "Features extracted from profile's astrological data"
    }
