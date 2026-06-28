from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import DeclarativeBase
import os

from schemas.model_schema import settings

DATABASE_URL = settings.DATABASE_URL or os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in environment or .env file")

engine = create_async_engine(DATABASE_URL, echo=True)

class Base(DeclarativeBase):
    pass

async def create_db_and_tables():
    from models.usersdb import Users

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)