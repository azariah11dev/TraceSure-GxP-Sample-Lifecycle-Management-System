from sqlalchemy import Column, String, DateTime, Float, Integer
from datetime import datetime, timezone

from models.database import Base


class CorrectionLog(Base):
    __tablename__ = "correction_logs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True)

    sample_name = Column(String, index=True, nullable=False)

    performed_by = Column(String, index=True, nullable=False)

    test_name = Column(String, index=True, nullable=False)

    old_result = Column(Float, index=True, nullable=False)

    new_result = Column(Float, index=True, nullable=False)

    explanation = Column(String, nullable=False)

    modified_by = Column(String, index=True, nullable=False)
    
    modified_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))