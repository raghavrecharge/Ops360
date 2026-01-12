"""
Life Event Classifier
Multi-label classifier for predicting life events based on astrological factors
Labels: marriage, job_change, health_issue, foreign_travel, property_purchase
"""
import pickle
import numpy as np
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
import json

from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import lightgbm as lgb

from app.models.ml import MLTrainingExample, MLModel


# Event labels
EVENT_LABELS = [
    "marriage",
    "job_change", 
    "health_issue",
    "foreign_travel",
    "property_purchase"
]

# Feature names for the classifier
FEATURE_NAMES = [
    # Planet positions (12 features - house positions 1-12)
    "sun_house", "moon_house", "mars_house", "mercury_house",
    "jupiter_house", "venus_house", "saturn_house", "rahu_house",
    "ketu_house",
    
    # Planet strengths (9 features - 0-100 scale)
    "sun_strength", "moon_strength", "mars_strength", "mercury_strength",
    "jupiter_strength", "venus_strength", "saturn_strength", "rahu_strength",
    "ketu_strength",
    
    # Dasha info (4 features)
    "mahadasha_lord_num", "antardasha_lord_num", "pratyantara_lord_num",
    "dasha_balance_years",
    
    # Transit info (9 features - house of transit)
    "transit_sun", "transit_moon", "transit_mars", "transit_mercury",
    "transit_jupiter", "transit_venus", "transit_saturn", "transit_rahu",
    "transit_ketu",
    
    # House strengths (12 features - Ashtakavarga SAV)
    "house_1_strength", "house_2_strength", "house_3_strength",
    "house_4_strength", "house_5_strength", "house_6_strength",
    "house_7_strength", "house_8_strength", "house_9_strength",
    "house_10_strength", "house_11_strength", "house_12_strength",
    
    # Special factors (5 features)
    "sade_sati_active", "ketu_mahadasha", "jupiter_return",
    "saturn_return", "rahu_ketu_axis_transit"
]

# Planet to number mapping
PLANET_NUM = {
    "Sun": 1, "Moon": 2, "Mars": 3, "Mercury": 4, "Jupiter": 5,
    "Venus": 6, "Saturn": 7, "Rahu": 8, "Ketu": 9
}


class LifeEventClassifier:
    """Multi-label life event classifier"""
    
    def __init__(self, db: Session):
        self.db = db
        self.model: Optional[MultiOutputClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        self._load_active_model()
    
    def _load_active_model(self):
        """Load the active model from database"""
        model_record = self.db.query(MLModel).filter(
            MLModel.is_active == 1
        ).order_by(MLModel.trained_at.desc()).first()
        
        if model_record and model_record.model_binary:
            data = pickle.loads(model_record.model_binary)
            self.model = data.get("model")
            self.scaler = data.get("scaler")
    
    def extract_features(self, chart_data: Dict, dasha_data: Dict = None, 
                        transit_data: Dict = None, strength_data: Dict = None,
                        ashtakavarga_data: Dict = None) -> Dict[str, float]:
        """Extract features from astrological data"""
        features = {}
        
        # Planet positions (from chart data)
        planets = chart_data.get("planets", {})
        for planet in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]:
            key = f"{planet.lower()}_house"
            features[key] = planets.get(planet, {}).get("house", 0)
        
        # Planet strengths (from strength data or defaults)
        strengths = strength_data.get("shadbala", {}) if strength_data else {}
        for planet in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]:
            key = f"{planet.lower()}_strength"
            planet_strength = strengths.get(planet, {})
            features[key] = planet_strength.get("total_strength", 50.0)
        
        # Dasha info
        if dasha_data:
            current = dasha_data.get("current_dasha", {})
            features["mahadasha_lord_num"] = PLANET_NUM.get(current.get("maha_lord", ""), 0)
            features["antardasha_lord_num"] = PLANET_NUM.get(current.get("antar_lord", ""), 0)
            features["pratyantara_lord_num"] = PLANET_NUM.get(current.get("prat_lord", ""), 0)
            features["dasha_balance_years"] = current.get("balance_years", 0)
        else:
            features["mahadasha_lord_num"] = 0
            features["antardasha_lord_num"] = 0
            features["pratyantara_lord_num"] = 0
            features["dasha_balance_years"] = 0
        
        # Transit positions
        if transit_data:
            transits = transit_data.get("current_transits", {})
            for planet in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]:
                key = f"transit_{planet.lower()}"
                features[key] = transits.get(planet, {}).get("house", 0)
        else:
            for planet in ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"]:
                features[f"transit_{planet}"] = 0
        
        # House strengths (Ashtakavarga SAV)
        if ashtakavarga_data:
            sav = ashtakavarga_data.get("sav", {}).get("totals", [0] * 12)
            for i in range(12):
                features[f"house_{i+1}_strength"] = sav[i] if i < len(sav) else 28
        else:
            for i in range(12):
                features[f"house_{i+1}_strength"] = 28  # Default average
        
        # Special factors
        features["sade_sati_active"] = 1 if transit_data and transit_data.get("sade_sati", {}).get("active") else 0
        
        mahadasha_lord = dasha_data.get("current_dasha", {}).get("maha_lord", "") if dasha_data else ""
        features["ketu_mahadasha"] = 1 if mahadasha_lord == "Ketu" else 0
        
        # Jupiter and Saturn returns (simplified)
        features["jupiter_return"] = 0
        features["saturn_return"] = 0
        features["rahu_ketu_axis_transit"] = 0
        
        if transit_data:
            transits = transit_data.get("current_transits", {})
            if transits.get("Jupiter", {}).get("house") == planets.get("Jupiter", {}).get("house"):
                features["jupiter_return"] = 1
            if transits.get("Saturn", {}).get("house") == planets.get("Saturn", {}).get("house"):
                features["saturn_return"] = 1
            
            # Rahu-Ketu axis
            rahu_transit = transits.get("Rahu", {}).get("house", 0)
            if rahu_transit in [1, 7]:  # Transiting 1st or 7th house
                features["rahu_ketu_axis_transit"] = 1
        
        return features
    
    def features_to_array(self, features: Dict[str, float]) -> np.ndarray:
        """Convert features dict to numpy array"""
        return np.array([features.get(f, 0) for f in FEATURE_NAMES]).reshape(1, -1)
    
    def add_training_example(
        self,
        profile_id: int,
        event_type: str,
        event_date: datetime,
        features: Dict[str, float],
        metadata: Dict = None
    ) -> MLTrainingExample:
        """Add a training example"""
        if event_type not in EVENT_LABELS:
            raise ValueError(f"Invalid event type. Must be one of: {EVENT_LABELS}")
        
        example = MLTrainingExample(
            profile_id=profile_id,
            event_type=event_type,
            event_date=event_date,
            features=features,
            label=1.0,  # Positive example
            example_metadata=metadata or {},
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(example)
        self.db.commit()
        self.db.refresh(example)
        return example
    
    def train_model(self, min_examples: int = 10) -> Dict[str, Any]:
        """Train the multi-label classifier"""
        # Get all training examples
        examples = self.db.query(MLTrainingExample).all()
        
        if len(examples) < min_examples:
            return {
                "success": False,
                "error": f"Not enough training examples. Need at least {min_examples}, have {len(examples)}"
            }
        
        # Prepare features and labels
        X = []
        y = {label: [] for label in EVENT_LABELS}
        
        for ex in examples:
            features = ex.features
            X.append([features.get(f, 0) for f in FEATURE_NAMES])
            
            for label in EVENT_LABELS:
                y[label].append(1 if ex.event_type == label else 0)
        
        X = np.array(X)
        Y = np.column_stack([y[label] for label in EVENT_LABELS])
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, Y_train, Y_test = train_test_split(
            X_scaled, Y, test_size=0.2, random_state=42
        )
        
        # Train multi-output classifier with LightGBM
        base_classifier = lgb.LGBMClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            verbose=-1
        )
        self.model = MultiOutputClassifier(base_classifier)
        self.model.fit(X_train, Y_train)
        
        # Evaluate
        train_score = self.model.score(X_train, Y_train)
        test_score = self.model.score(X_test, Y_test)
        
        # Per-label accuracy
        Y_pred = self.model.predict(X_test)
        label_accuracy = {}
        for i, label in enumerate(EVENT_LABELS):
            correct = np.sum(Y_pred[:, i] == Y_test[:, i])
            label_accuracy[label] = round(correct / len(Y_test), 3)
        
        # Save model
        version = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        model_binary = pickle.dumps({
            "model": self.model,
            "scaler": self.scaler
        })
        
        # Deactivate previous models
        self.db.query(MLModel).update({MLModel.is_active: 0})
        
        # Save new model
        model_record = MLModel(
            model_name="life_event_classifier",
            model_type="LightGBM_MultiOutput",
            version=version,
            model_binary=model_binary,
            feature_names=FEATURE_NAMES,
            metrics={
                "train_score": round(train_score, 3),
                "test_score": round(test_score, 3),
                "label_accuracy": label_accuracy,
                "n_examples": len(examples)
            },
            trained_at=datetime.now(timezone.utc),
            is_active=1
        )
        self.db.add(model_record)
        self.db.commit()
        
        return {
            "success": True,
            "version": version,
            "metrics": {
                "train_score": round(train_score, 3),
                "test_score": round(test_score, 3),
                "label_accuracy": label_accuracy,
                "n_examples": len(examples)
            }
        }
    
    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        """Predict life event probabilities"""
        if self.model is None or self.scaler is None:
            return {
                "success": False,
                "error": "No trained model available. Train a model first."
            }
        
        # Prepare features
        X = self.features_to_array(features)
        X_scaled = self.scaler.transform(X)
        
        # Get predictions and probabilities
        predictions = self.model.predict(X_scaled)[0]
        
        # Get probabilities (if available)
        probabilities = {}
        try:
            proba = self.model.predict_proba(X_scaled)
            for i, label in enumerate(EVENT_LABELS):
                # proba[i] is the probability array for label i
                probabilities[label] = round(float(proba[i][0][1]), 3)  # Probability of positive class
        except:
            # Fallback to binary predictions
            for i, label in enumerate(EVENT_LABELS):
                probabilities[label] = float(predictions[i])
        
        # Identify top factors
        top_factors = self._get_top_factors(features, probabilities)
        
        return {
            "success": True,
            "probabilities": probabilities,
            "predictions": {label: bool(predictions[i]) for i, label in enumerate(EVENT_LABELS)},
            "top_factors": top_factors
        }
    
    def _get_top_factors(self, features: Dict[str, float], probabilities: Dict[str, float]) -> List[Dict]:
        """Identify top contributing factors for predictions"""
        factors = []
        
        # Analyze key astrological factors
        if features.get("sade_sati_active") == 1:
            factors.append({
                "factor": "Sade Sati Active",
                "description": "Saturn's 7.5 year transit over Moon",
                "impact": "Potential challenges in career, health, relationships"
            })
        
        if features.get("ketu_mahadasha") == 1:
            factors.append({
                "factor": "Ketu Mahadasha",
                "description": "Current major period of Ketu",
                "impact": "Spiritual growth, detachment, unexpected changes"
            })
        
        if features.get("jupiter_return") == 1:
            factors.append({
                "factor": "Jupiter Return",
                "description": "Jupiter transiting natal position",
                "impact": "Opportunities for growth, expansion, luck"
            })
        
        if features.get("saturn_return") == 1:
            factors.append({
                "factor": "Saturn Return",
                "description": "Saturn transiting natal position",
                "impact": "Major life restructuring, maturity, responsibilities"
            })
        
        # Strong houses for specific events
        if probabilities.get("marriage", 0) > 0.5:
            h7_strength = features.get("house_7_strength", 28)
            factors.append({
                "factor": f"7th House Strength: {h7_strength}/48",
                "description": "House of marriage and partnerships",
                "impact": "Higher strength indicates favorable period for relationships"
            })
        
        if probabilities.get("job_change", 0) > 0.5:
            h10_strength = features.get("house_10_strength", 28)
            factors.append({
                "factor": f"10th House Strength: {h10_strength}/48",
                "description": "House of career and profession",
                "impact": "Career changes likely during strong 10th house periods"
            })
        
        if probabilities.get("foreign_travel", 0) > 0.5:
            h9_strength = features.get("house_9_strength", 28)
            factors.append({
                "factor": f"9th House Strength: {h9_strength}/48",
                "description": "House of long journeys and foreign lands",
                "impact": "Travel opportunities indicated"
            })
        
        return factors[:5]  # Return top 5 factors
    
    def get_training_stats(self) -> Dict[str, Any]:
        """Get statistics about training data"""
        examples = self.db.query(MLTrainingExample).all()
        
        by_type = {}
        for label in EVENT_LABELS:
            by_type[label] = sum(1 for ex in examples if ex.event_type == label)
        
        model = self.db.query(MLModel).filter(MLModel.is_active == 1).first()
        
        return {
            "total_examples": len(examples),
            "by_event_type": by_type,
            "active_model": {
                "version": model.version if model else None,
                "trained_at": model.trained_at.isoformat() if model and model.trained_at else None,
                "metrics": model.metrics if model else None
            } if model else None
        }
