from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logging import logger

class Database:
    client: AsyncIOMotorClient = None
    db = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    logger.info("Connecting to MongoDB...")
    Database.client = AsyncIOMotorClient(settings.MONGO_URL)
    Database.db = Database.client[settings.DB_NAME]
    logger.info(f"Connected to MongoDB: {settings.DB_NAME}")

async def close_mongo_connection():
    """Close MongoDB connection"""
    logger.info("Closing MongoDB connection...")
    if Database.client:
        Database.client.close()
    logger.info("MongoDB connection closed")

def get_database():
    """Get database instance"""
    return Database.db
