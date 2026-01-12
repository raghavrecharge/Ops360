from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Strength(Base):
    __tablename__ = "strengths"
    
    id = Column(Integer, primary_key=True, index=True)
    natal_chart_id = Column(Integer, ForeignKey("natal_charts.id"), nullable=False)
    strength_type = Column(String(50))  # Shadbala, Bhavabala, Vargabala, etc.
    planet = Column(String(50), nullable=True)  # For planet-specific strengths
    house = Column(Integer, nullable=True)  # For house-specific strengths
    value = Column(Float)
    components = Column(JSON)  # Breakdown of strength components
    
    # Relationships
    natal_chart = relationship("NatalChart", back_populates="strengths")
