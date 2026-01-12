from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON
from app.core.database import Base

class VarshaphalaRecord(Base):
    __tablename__ = "varshaphala_records"
    
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    year = Column(Integer, nullable=False)
    varsha_pravesh_date = Column(DateTime, nullable=False)
    julian_day = Column(Float)
    ascendant = Column(Float)
    planetary_positions = Column(JSON)
    tajika_yogas = Column(JSON)  # List of detected Tajika yogas
    sahams = Column(JSON)  # Various sahams (arabic parts)
    annual_dasha = Column(JSON)  # Mudda/Varsha dasha
    predictions = Column(JSON)
