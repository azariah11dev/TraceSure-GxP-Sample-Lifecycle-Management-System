from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from dependencies.dependency import get_async_session
from schemas.user_auth_schema import LoginRequest, RegisterRequest, UserResponse
from models.trackerdb import Users
from auth.jwt_handler import create_access_token
from auth.dependencies import get_current_user

user_auth_router = APIRouter(prefix="/auth", tags=["auth"])
password_context = CryptContext(schemes=["argon2"], deprecated="auto")

@user_auth_router.post("/login")
async def login(data: LoginRequest, session: AsyncSession = Depends(get_async_session)):
    # Check if user exists
    result = await session.execute(select(Users).where(Users.username == data.username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User does not exist.")
    if not password_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password.")
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
    
@user_auth_router.post("/register")
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_async_session)):
    # check if username already exists
    user_result = await session.execute(select(Users).where(Users.username == data.username))
    if user_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists.")

    email_result = await session.execute(select(Users).where(Users.email == data.email))
    if email_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already exists.")
    
    # Hash password
    hashed_password = password_context.hash(data.password)

    # Create new user
    new_user = Users(username=data.username, email=data.email, password_hash=hashed_password)

    #Add to DB
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    return {"status": "ok", "message": "Registration successful!", "user": UserResponse.model_validate(new_user)}

@user_auth_router.post("/assign_role")
async def assign_role(username: str, role: str, session: AsyncSession = Depends(get_async_session), current_user: Users = Depends(get_current_user)
):
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

    return {"status": "ok", "message": f"Role assigned to user {username}."}
    