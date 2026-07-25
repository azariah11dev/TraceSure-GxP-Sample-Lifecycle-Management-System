from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.dependencies.model_dependency import get_async_session
from models.usersdb import Users
from services.dependencies.jwt_dependency import get_current_user


role_assign_router = APIRouter(prefix="/role_assign", tags=["role_assign"])

@role_assign_router.put("/assign_role")
async def assign_role(
                      username: str, 
                      role: str, 
                      session: AsyncSession = Depends(get_async_session), 
                      current_user: Users = Depends(get_current_user)
):
    
    try:
        # Only Admins can assign roles
        if current_user.role != "Admin":
            raise HTTPException(status_code=403, detail="Not authorized.")

        allowed_roles = ["Admin", "Technician", "Manager", "QA", "Supervisor"]

        if role not in allowed_roles:
            raise HTTPException(status_code=400, detail=f"Invalid role. Allowed roles are: {', '.join(allowed_roles)}")
        result = await session.execute(select(Users).where(Users.username == username))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
    
        user.role = role
        await session.commit()
        await session.refresh(user)

        return {
            "status": "ok", 
            "message": f"Role assigned to user {username}."
        }
    
    except HTTPException:
        raise
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))