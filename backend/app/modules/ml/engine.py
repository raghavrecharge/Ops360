import pickle
import json
import numpy as np
from datetime import datetime
from typing import Dict, List
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score
import shap

class MLPredictionEngine:
    """Machine Learning prediction engine using LightGBM"""
    
    def __init__(self):
        self.model = None
        self.feature_names = []
        self.model_version = "v1.0.0"
        self.is_classification = False
    
    def extract_features(self, chart: Dict, dasha: Dict = None, transits: Dict = None) -> Dict[str, float]:
        """Extract features from astrological data"""
        features = {}
        
        # Planetary positions features
        for planet in ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]:
            if planet in chart["planets"]:
                p_data = chart["planets"][planet]
                features[f"{planet}_rasi"] = float(p_data["rasi"])
                features[f"{planet}_longitude"] = p_data["longitude"]
                
                # Dignity encoding
                dignity_map = {"Exalted": 2.0, "Own": 1.5, "Friend": 1.0, 
                              "Neutral": 0.0, "Enemy": -1.0, "Debilitated": -2.0}
                features[f"{planet}_dignity"] = dignity_map.get(p_data.get("dignity", "Neutral"), 0.0)
                
                features[f"{planet}_retrograde"] = 1.0 if p_data.get("is_retrograde") else 0.0
        
        # House cusps
        for i in range(12):
            if i < len(chart.get("house_cusps", [])):
                features[f"house_{i+1}_cusp"] = chart["house_cusps"][i]
        
        # Ascendant
        features["ascendant"] = chart.get("ascendant", 0.0)
        
        # Dasha features
        if dasha:
            dasha_lord_map = {"SUN": 0, "MOON": 1, "MARS": 2, "MERCURY": 3,
                             "JUPITER": 4, "VENUS": 5, "SATURN": 6, "RAHU": 7, "KETU": 8}
            features["dasha_lord"] = float(dasha_lord_map.get(dasha.get("lord", "SUN"), 0))
            features["dasha_years_remaining"] = dasha.get("years", 0.0)
        
        # Transit features
        if transits:
            for planet, transit_data in transits.items():
                if planet in ["SUN", "MOON", "MARS", "JUPITER", "SATURN"]:
                    features[f"transit_{planet}_rasi"] = float(transit_data.get("rasi", 0))
        
        return features
    
    def prepare_training_data(self, examples: List[Dict]) -> tuple:
        """Prepare training data from examples"""
        X = []
        y = []
        
        for example in examples:
            features = example.get("features", {})
            label = example.get("label")
            
            if features and label is not None:
                X.append(features)
                y.append(label)
        
        if not X:
            return None, None, []
        
        # Get feature names from first example
        feature_names = list(X[0].keys())
        
        # Convert to numpy arrays
        X_array = np.array([[f.get(name, 0.0) for name in feature_names] for f in X])
        y_array = np.array(y)
        
        return X_array, y_array, feature_names
    
    def train(self, training_examples: List[Dict], task_type: str = "regression") -> Dict:
        """Train LightGBM model"""
        X, y, feature_names = self.prepare_training_data(training_examples)
        
        if X is None or len(X) < 10:
            return {
                "status": "error",
                "message": "Insufficient training data (minimum 10 examples required)"
            }
        
        self.feature_names = feature_names
        self.is_classification = task_type == "classification"
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        if self.is_classification:
            self.model = lgb.LGBMClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        else:
            self.model = lgb.LGBMRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        
        if self.is_classification:
            metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "train_size": len(X_train),
                "test_size": len(X_test)
            }
        else:
            metrics = {
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "r2_score": float(r2_score(y_test, y_pred)),
                "train_size": len(X_train),
                "test_size": len(X_test)
            }
        
        return {
            "status": "success",
            "metrics": metrics,
            "feature_names": feature_names,
            "model_version": self.model_version
        }
    
    def predict(self, features: Dict[str, float]) -> Dict:
        """Make prediction and explain"""
        if self.model is None:
            return {
                "status": "error",
                "message": "Model not trained"
            }
        
        # Convert features to array
        feature_array = np.array([[features.get(name, 0.0) for name in self.feature_names]])
        
        # Predict
        prediction = self.model.predict(feature_array)[0]
        
        # Get feature importances
        feature_importances = dict(zip(self.feature_names, self.model.feature_importances_))
        top_features = sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Simple SHAP explanation (would be better with actual SHAP values)
        explanation = [
            f"{name}: importance {importance:.3f}"
            for name, importance in top_features
        ]
        
        return {
            "status": "success",
            "prediction": float(prediction),
            "top_features": dict(top_features),
            "explanation": explanation,
            "model_version": self.model_version
        }
    
    def save_model(self, file_path: str):
        """Save model to file"""
        model_data = {
            "model": self.model,
            "feature_names": self.feature_names,
            "model_version": self.model_version,
            "is_classification": self.is_classification
        }
        
        with open(file_path, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, file_path: str):
        """Load model from file"""
        with open(file_path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data["model"]
        self.feature_names = model_data["feature_names"]
        self.model_version = model_data["model_version"]
        self.is_classification = model_data.get("is_classification", False)

ml_engine = MLPredictionEngine()
