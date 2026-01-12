from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, LargeBinary
from app.core.database import Base

class MLTrainingExample(Base):
    __tablename__ = "ml_training_examples"
    
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, nullable=False)
    event_type = Column(String(100))  # job_change, marriage, health_issue, etc.
    event_date = Column(DateTime)
    features = Column(JSON)  # Extracted features from chart/dasha/transits
    label = Column(Float)  # Outcome value (for regression) or class (for classification)
    example_metadata = Column(JSON)  # Additional context - renamed from 'metadata'
    created_at = Column(DateTime)

class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(255), nullable=False)
    model_type = Column(String(100))  # LightGBM, RandomForest, etc.
    version = Column(String(50), nullable=False)
    model_binary = Column(LargeBinary)  # Pickled model
    feature_names = Column(JSON)
    metrics = Column(JSON)  # Training metrics (accuracy, RMSE, etc.)
    trained_at = Column(DateTime)
    is_active = Column(Integer, default=1)
