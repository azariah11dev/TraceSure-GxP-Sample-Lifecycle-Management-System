from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from endpoints.post_endpoints.user_auth import user_auth_router
from models.trackerdb import create_db_and_tables
from dependencies.dependency import get_async_session


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

app = FastAPI(title="TraceSure", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500",
                   "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return {"message": "Welcome to TraceSure API!",
            "description": "This is the backend server for TraceSure, a tool for tracking and analyzing software execution traces.",
            "health_check": "/health - Check the health status of the API.",
            "login page": "/auth/login - Login endpoint for user authentication.",
            "registration page": "/auth/register - Registration endpoint for new users.",
            "assign role page": "/auth/assign_role - Endpoint for assigning roles to users (Admin only)."}

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(user_auth_router)