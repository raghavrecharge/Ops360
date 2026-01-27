from sqlalchemy import Column, String, Date, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.models.base import Base, BaseModel

class Driver(Base, BaseModel):
    __tablename__ = "drivers"
    
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    license_number = Column(String(100))
    license_validity = Column(Date)
    address = Column(String(500))
    emergency_contact = Column(String(100))
    emergency_phone = Column(String(20))
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="SET NULL"))
    assigned_vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="SET NULL"))
    
    # Relationships
    vendor = relationship("Vendor", back_populates="drivers")
    assigned_vehicle = relationship("Vehicle", back_populates="assigned_driver", foreign_keys=[assigned_vehicle_id])
    expenses = relationship("Expense", back_populates="driver", cascade="all, delete-orphan")
