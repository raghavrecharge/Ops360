from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.models.base import Base, BaseModel

class Vendor(Base, BaseModel):
    __tablename__ = "vendors"
    
    name = Column(String(255), nullable=False)
    company = Column(String(255))
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(Text)
    contact_person = Column(String(255))
    
    # Relationships
    vehicles = relationship("Vehicle", back_populates="vendor", cascade="all, delete-orphan")
    drivers = relationship("Driver", back_populates="vendor", cascade="all, delete-orphan")
