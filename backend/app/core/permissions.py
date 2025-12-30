from enum import Enum
from fastapi import HTTPException, status, Depends
from app.core.security import get_current_user

class UserRole(str, Enum):
    ADMIN = "admin"
    CLIENT_SERVICING = "client_servicing"
    OPERATIONS_MANAGER = "operations_manager"
    ACCOUNTS = "accounts"
    VENDOR = "vendor"
    CLIENT = "client"

class Permission:
    """Role-based permission checker"""
    
    @staticmethod
    def require_roles(allowed_roles: list[UserRole]):
        async def role_checker(current_user: dict = Depends(get_current_user)):
            user_role = current_user.get("role")
            if user_role not in [role.value for role in allowed_roles]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
            return current_user
        return role_checker
    
    @staticmethod
    def require_admin():
        return Permission.require_roles([UserRole.ADMIN])
    
    @staticmethod
    def require_operations():
        return Permission.require_roles([UserRole.ADMIN, UserRole.OPERATIONS_MANAGER])
    
    @staticmethod
    def require_accounts():
        return Permission.require_roles([UserRole.ADMIN, UserRole.ACCOUNTS])
