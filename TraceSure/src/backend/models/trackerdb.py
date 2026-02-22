from sqlalchemy import Column, String, DateTime, Boolean,Integer, Float
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import func
import os
from datetime import datetime, timezone

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:deep_value@localhost:5432/TraceSureDB"
)

class Base(DeclarativeBase):
    pass

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable= False, default="Technician")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Samples(Base):
    __tablename__ = "samples"

    sample_name = Column(String,primary_key=True, index=True, nullable=False)
    created_by = Column(String)
    created_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    performed_by = Column(String, index=True)
    test_name = Column(String, index=True)
    result = Column(Float, index=True)
    spec_range_upper_limit = Column(Float, index=True)
    spec_range_lower_limit = Column(Float, index=True)
    unit = Column(String)
    status = Column(String, index=True)
    test_completed_date = Column(DateTime(timezone=True))
    reviewed_by = Column(String)
    reviewed_status = Column(Boolean)
    manager_name = Column(String)
    manager_approval = Column(Boolean)
    released_date = Column(DateTime(timezone=True))
    QA_name = Column(String)
    QA_approval = Column(Boolean)

engine = create_async_engine(DATABASE_URL, echo=True)

#create tables
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
