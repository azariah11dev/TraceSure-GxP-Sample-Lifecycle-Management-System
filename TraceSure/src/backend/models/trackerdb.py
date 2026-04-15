from sqlalchemy import Column, String, DateTime, Boolean,Integer, Float, Text, Date
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import func
import os
from datetime import datetime, timezone
import uuid
from sqlalchemy.dialects.postgresql import UUID

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
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    sample_name = Column(String, index=True, nullable=False)
    created_by = Column(String, index=True, nullable=False)
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

class CorrectionLog(Base):
    __tablename__ = "correction_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sample_name = Column(String, index=True, nullable=False)
    test_name = Column(String, index=True, nullable=False)
    result = Column(Float, index=True)
    explanation = Column(String)
    modified_by = Column(String, index=True)
    modified_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class DeviationForm(Base):
    __tablename__ = "deviation_form"

    deviation_code = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    submitted_by = Column(String, index=True)
    manager_name = Column(String, index=True)
    manager_approval = Column(Boolean)
    sample_name = Column(String, index=True, nullable=False)
    test_name = Column(String, index=True, nullable= False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    deviation_date = Column(DateTime (timezone=True))
    deviation_report_date = Column(DateTime (timezone=True))
    deviation_department = Column(String, index=True)
    deviation_reported_at = Column(String, index=True)
    deviation_type = Column(String, index=True)
    deviation_severity = Column(String, index=True)
    deviation_short_description = Column(String, index=True)
    deviation_long_description = Column(Text, index=True)
    deviation_location = Column(String, index=True)
    deviation_sop_number = Column(String, index=True)
    deviation_instrument_id = Column(String, index=True)
    deviation_sample_type = Column(String, index=True)
    deviation_quantity_impacted = Column(Integer, index=True)
    deviation_batch_released = Column(Boolean)
    potential_impact_to_product_quality = Column(Text, index=True)
    immediate_action_taken = Column(String, index=True)
    date_action_taken = Column(Date)
    deviation_test_performed_by = Column(String, index=True)
    was_testing_repeated = Column(Boolean)
    reference_to_retest = Column(String, index=True)
    investigation_required = Column(Boolean)
    investigation_assigned_to = Column(String, index=True)
    investigation_start_date = Column(Date)
    investigation_end_date = Column(Date)
    root_cause_category = Column(String, index=True)
    root_cause_description = Column(Text, index=True)
    capa_required = Column(Boolean)
    correction_action = Column(Text, index=True)
    preventative_action = Column(Text, index=True)
    responsible_person = Column(String, index=True)
    target_completion_date = Column(Date)
    effectiveness_check_required = Column(Boolean)
    batch_disposition = Column(String, index=True)

engine = create_async_engine(DATABASE_URL, echo=True)

#create tables
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
