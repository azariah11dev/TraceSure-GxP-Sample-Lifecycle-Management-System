from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.dependencies.model_dependency import get_async_session
from models.usersdb import Users
from services.dependencies.jwt_dependency import get_current_user

user_role_router = APIRouter(prefix="/current_users", tags=["current_users"])

@user_role_router.get("/")
async def current_users(
    session: AsyncSession = Depends(get_async_session),
    current_user: Users = Depends(get_current_user)
):
    try:
        # Only Admins can view all users
        if current_user.role != "Admin":
            raise HTTPException(status_code=403, detail="Not authorized.")

        result = await session.execute(select(Users))
        users = result.scalars().all()

        return [
            {
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active
            }
            for u in users
        ]

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")