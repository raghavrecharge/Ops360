from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class DashaSystem(enum.Enum):
    VIMSHOTTARI = "vimshottari"
    YOGINI = "yogini"
    ASHTOTTARI = "ashtottari"
    KALA_CHAKRA = "kala_chakra"
    CHARA = "chara"

class DashaLevel(enum.Enum):
    MAHA = "maha"
    ANTAR = "antar"
    PRATYANTAR = "pratyantar"
    SOOKSHMA = "sookshma"
    PRANA = "prana"

class Dasha(Base):
    __tablename__ = "dashas"
    
    id = Column(Integer, primary_key=True, index=True)
    natal_chart_id = Column(Integer, ForeignKey("natal_charts.id"), nullable=False)
    system = Column(SQLEnum(DashaSystem), nullable=False)
    level = Column(SQLEnum(DashaLevel), nullable=False)
    lord = Column(String(50), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    parent_id = Column(Integer, ForeignKey("dashas.id"), nullable=True)
    
    # Relationships
    natal_chart = relationship("NatalChart", back_populates="dashas")
    parent = relationship("Dasha", remote_side=[id], backref="children")
