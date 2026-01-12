from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class NatalChart(Base):
    __tablename__ = "natal_charts"
    
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    chart_hash = Column(String(64), unique=True, index=True)
    julian_day = Column(Float, nullable=False)
    sidereal_time = Column(Float)
    ayanamsa_value = Column(Float)
    ascendant = Column(Float)
    mc = Column(Float)
    house_cusps = Column(JSON)  # List of 12 house cusps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("Profile", back_populates="natal_charts")
    planetary_positions = relationship("PlanetaryPosition", back_populates="natal_chart", cascade="all, delete-orphan")
    divisional_charts = relationship("DivisionalChart", back_populates="natal_chart", cascade="all, delete-orphan")
    dashas = relationship("Dasha", back_populates="natal_chart", cascade="all, delete-orphan")
    yogas = relationship("Yoga", back_populates="natal_chart", cascade="all, delete-orphan")
    ashtakavarga_tables = relationship("AshtakavargaTable", back_populates="natal_chart", cascade="all, delete-orphan")
    strengths = relationship("Strength", back_populates="natal_chart", cascade="all, delete-orphan")

class PlanetaryPosition(Base):
    __tablename__ = "planetary_positions"
    
    id = Column(Integer, primary_key=True, index=True)
    natal_chart_id = Column(Integer, ForeignKey("natal_charts.id"), nullable=False)
    planet = Column(String(50), nullable=False)
    longitude = Column(Float, nullable=False)
    latitude = Column(Float)
    distance = Column(Float)
    speed = Column(Float)
    is_retrograde = Column(Integer, default=0)
    nakshatra = Column(String(50))
    nakshatra_pada = Column(Integer)
    rasi = Column(Integer)
    degree_in_rasi = Column(Float)
    is_combust = Column(Integer, default=0)
    dignity = Column(String(50))  # Own, Exalted, Debilitated, Friend, Enemy, Neutral
    
    # Relationships
    natal_chart = relationship("NatalChart", back_populates="planetary_positions")

class DivisionalChart(Base):
    __tablename__ = "divisional_charts"
    
    id = Column(Integer, primary_key=True, index=True)
    natal_chart_id = Column(Integer, ForeignKey("natal_charts.id"), nullable=False)
    division = Column(Integer, nullable=False)  # D1, D2, ... D60
    division_name = Column(String(50))  # Rasi, Hora, Drekkana, etc.
    planetary_positions = Column(JSON)  # {planet: rasi_number}
    
    # Relationships
    natal_chart = relationship("NatalChart", back_populates="divisional_charts")
