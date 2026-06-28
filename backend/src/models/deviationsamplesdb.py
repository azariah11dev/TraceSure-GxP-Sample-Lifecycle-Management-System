from sqlalchemy import Column, String, DateTime, Integer, Float
from datetime import datetime, timezone

from models.database import Base


class DeviationSamples(Base):
    __tablename__ = "deviation_samples"
    __table_args__ = {"extend_existing": True}

    sample_name = Column(String, index=True, nullable=False)

    test_name = Column(String, index=True, nullable=False)

    deviation_code = Column(String, index=True, nullable=False)

    previous_performer = Column(String, index=True, nullable=False)

    test_performer = Column(String, index=True, nullable=False)

    old_result = Column(Integer, index=True, nullable=False)

    new_result = Column(Integer, index=True, nullable=False)

    spec_range_upper_limit = Column(Float, index=True)

    spec_range_lower_limit = Column(Float, index=True)

    unit = Column(String)

    modified_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))