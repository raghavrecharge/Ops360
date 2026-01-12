from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Yoga(Base):
    __tablename__ = "yogas"
    
    id = Column(Integer, primary_key=True, index=True)
    natal_chart_id = Column(Integer, ForeignKey("natal_charts.id"), nullable=False)
    yoga_name = Column(String(255), nullable=False)
    yoga_type = Column(String(100))  # Raja, Dhana, Arishta, etc.
    description = Column(Text)
    strength = Column(Integer)  # 1-10 scale
    forming_planets = Column(JSON)  # List of planets involved
    rule_reference = Column(String(255))  # Reference to rule that detected it
    
    # Relationships
    natal_chart = relationship("NatalChart", back_populates="yogas")
