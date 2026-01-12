from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from app.core.database import Base

class Remedy(Base):
    __tablename__ = "remedies"
    
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    remedy_type = Column(String(100))  # Gemstone, Mantra, Ritual, Charity, etc.
    planet = Column(String(50))
    description = Column(Text)
    duration = Column(String(100))
    implementation_steps = Column(JSON)
    created_at = Column(DateTime)
