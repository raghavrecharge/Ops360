from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, BaseModel
from sqlalchemy import Integer

class Driver(Base, BaseModel):
    __tablename__ = "drivers"
    
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    license_number = Column(String(100))
    license_validity = Column(Date)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="SET NULL"))
    
    # Relationships
    vendor = relationship("Vendor", back_populates="drivers")
    expenses = relationship("Expense", back_populates="driver", cascade="all, delete-orphan")
