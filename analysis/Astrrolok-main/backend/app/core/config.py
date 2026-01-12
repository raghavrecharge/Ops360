import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Database - MySQL required for production, SQLite only via explicit flag
    USE_SQLITE: bool = os.getenv("USE_SQLITE", "false").lower() == "true"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://astro:astropass@localhost:3306/astroos"
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Ephemeris
    EPHEMERIS_PATH: str = "/app/ephe"
    DEFAULT_AYANAMSA: str = "LAHIRI"
    
    # FAISS
    FAISS_INDEX_PATH: str = "/app/data/faiss_index"
    
    # Celery
    CELERY_BROKER_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    class Config:
        case_sensitive = True

settings = Settings()

# Override DATABASE_URL for SQLite if explicitly requested (local dev only)
if settings.USE_SQLITE:
    settings.DATABASE_URL = "sqlite:////app/backend/astroos_dev.db"
