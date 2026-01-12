from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AshtakavargaTable(Base):
    __tablename__ = "ashtakavarga_tables"
    
    id = Column(Integer, primary_key=True, index=True)
    natal_chart_id = Column(Integer, ForeignKey("natal_charts.id"), nullable=False)
    table_type = Column(String(50))  # BAV (Bhinnashtakavarga) or SAV (Sarvashtakavarga)
    planet = Column(String(50))  # For BAV, null for SAV
    values = Column(JSON)  # 12x12 matrix for BAV, 12-element array for SAV
    reductions = Column(JSON)  # Various reduction values
    
    # Relationships
    natal_chart = relationship("NatalChart", back_populates="ashtakavarga_tables")
