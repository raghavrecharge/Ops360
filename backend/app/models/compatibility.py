from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from app.core.database import Base

class CompatibilityReport(Base):
    __tablename__ = "compatibility_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    profile1_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    profile2_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    total_score = Column(Float)
    ashtakoot_scores = Column(JSON)  # Varna, Vashya, Tara, Yoni, etc.
    manglik_analysis = Column(JSON)  # Manglik status and cancellations
    dasha_sandhi = Column(JSON)  # Changed to JSON for dict storage
    recommendations = Column(JSON)  # Changed to JSON for list storage
    created_at = Column(DateTime)
