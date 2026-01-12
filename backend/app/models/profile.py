from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class ChartStyle(enum.Enum):
    NORTH_INDIAN = "north_indian"
    SOUTH_INDIAN = "south_indian"
    EAST_INDIAN = "east_indian"

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    birth_date = Column(DateTime, nullable=False)
    birth_time = Column(String(50), nullable=False)  # HH:MM:SS
    birth_place = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timezone = Column(String(50), nullable=False)
    ayanamsa = Column(String(50), default="LAHIRI")
    chart_style = Column(SQLEnum(ChartStyle), default=ChartStyle.NORTH_INDIAN)
    language_preference = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="profiles")
    natal_charts = relationship("NatalChart", back_populates="profile", cascade="all, delete-orphan")
    day_scores = relationship("DayScore", back_populates="profile", cascade="all, delete-orphan")
