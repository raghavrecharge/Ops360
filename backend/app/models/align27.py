from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, Date, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class DayScore(Base):
    __tablename__ = "day_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    score = Column(Float, nullable=False)  # Numeric score 0-100
    traffic_light = Column(String(10), nullable=False)  # GREEN, AMBER, RED
    reasons = Column(JSON)  # List of scoring reasons
    key_transits = Column(JSON)  # Key transits affecting score
    dasha_overlay = Column(JSON)  # Current dasha info
    calculation_hash = Column(String(64), index=True)  # Hash for caching
    created_at = Column(DateTime)
    
    # Relationships
    profile = relationship("Profile", back_populates="day_scores")
    moments = relationship("Moment", back_populates="day_score", cascade="all, delete-orphan")
    rituals = relationship("RitualRecommendation", back_populates="day_score", cascade="all, delete-orphan")

class Moment(Base):
    __tablename__ = "moments"
    
    id = Column(Integer, primary_key=True, index=True)
    day_score_id = Column(Integer, ForeignKey("day_scores.id"), nullable=False)
    moment_type = Column(String(20), nullable=False)  # GOLDEN, PRODUCTIVE, SILENCE
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    reason = Column(Text)
    confidence = Column(Float)  # 0.0 - 1.0
    planetary_basis = Column(JSON)
    
    # Relationships
    day_score = relationship("DayScore", back_populates="moments")

class RitualRecommendation(Base):
    __tablename__ = "ritual_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    day_score_id = Column(Integer, ForeignKey("day_scores.id"), nullable=False)
    ritual_name = Column(String(255), nullable=False)
    description = Column(Text)
    tags = Column(JSON)  # ["meditation", "mantra", "puja"]
    why = Column(Text)  # Why this ritual is recommended
    recommended_time = Column(DateTime)
    duration_minutes = Column(Integer)
    materials_needed = Column(JSON)
    priority = Column(Integer, default=1)  # 1=high, 2=medium, 3=low
    
    # Relationships
    day_score = relationship("DayScore", back_populates="rituals")
