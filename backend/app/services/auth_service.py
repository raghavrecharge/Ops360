from fastapi import HTTPException, status
from app.core.security import verify_password, get_password_hash, create_access_token
from app.database.connection import get_database
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from bson import ObjectId

class AuthService:
    def __init__(self):
        self.db = get_database()
        self.users_collection = self.db.users
    
    async def register_user(self, user_data: UserCreate) -> UserResponse:
        """Register a new user"""
        
        # Check if user exists
        existing = await self.users_collection.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user_dict = user_data.model_dump()
        user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
        user_dict["is_active"] = True
        
        from datetime import datetime, timezone
        user_dict["created_at"] = datetime.now(timezone.utc)
        
        result = await self.users_collection.insert_one(user_dict)
        
        return UserResponse(
            id=str(result.inserted_id),
            email=user_dict["email"],
            name=user_dict["name"],
            phone=user_dict.get("phone"),
            role=user_dict["role"],
            is_active=user_dict["is_active"],
            created_at=user_dict["created_at"]
        )
    
    async def login_user(self, credentials: UserLogin) -> TokenResponse:
        """Login user and return token"""
        
        # Find user
        user = await self.users_collection.find_one({"email": credentials.email})
        
        if not user or not verify_password(credentials.password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create access token
        access_token = create_access_token(
            data={
                "user_id": str(user["_id"]),
                "email": user["email"],
                "role": user["role"]
            }
        )
        
        user_response = UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            phone=user.get("phone"),
            role=user["role"],
            is_active=user["is_active"],
            created_at=user["created_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    async def get_current_user_info(self, email: str) -> UserResponse:
        """Get current user information"""
        user = await self.users_collection.find_one({"email": email})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            phone=user.get("phone"),
            role=user["role"],
            is_active=user["is_active"],
            created_at=user["created_at"]
        )
