from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON, Text
from app.core.database import Base

class Transit(Base):
    __tablename__ = "transits"
    
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    transit_date = Column(DateTime, nullable=False)
    planet = Column(String(50))
    transit_type = Column(String(100))  # Sade Sati, Dhaiya, Regular, etc.
    from_rasi = Column(Integer)
    to_rasi = Column(Integer)
    aspect_info = Column(JSON)  # Aspects to natal planets
    significance = Column(Text)
