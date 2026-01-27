from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.models.user import User

class AuthService:
    
    async def register_user(self, db: AsyncSession, user_data: UserCreate) -> UserResponse:
        """Register a new user"""
        
        # Check if user exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = User(
            email=user_data.email,
            name=user_data.name,
            phone=user_data.phone,
            password_hash=get_password_hash(user_data.password),
            role=user_data.role
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return UserResponse.model_validate(user)
    
    async def login_user(self, db: AsyncSession, credentials: UserLogin) -> TokenResponse:
        """Login user and return token"""
        
        # Find user
        result = await db.execute(select(User).where(User.email == credentials.email))
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create access token
        access_token = create_access_token(
            data={
                "user_id": user.id,
                "email": user.email,
                "role": user.role.value
            }
        )
        
        user_response = UserResponse.model_validate(user)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    async def get_current_user_info(self, db: AsyncSession, email: str) -> UserResponse:
        """Get current user information"""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse.model_validate(user)
