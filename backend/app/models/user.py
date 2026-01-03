from sqlalchemy import Column, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base, BaseModel

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CLIENT_SERVICING = "client_servicing"
    OPERATIONS_MANAGER = "operations_manager"
    ACCOUNTS = "accounts"
    VENDOR = "vendor"
    CLIENT = "client"

class User(Base, BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
