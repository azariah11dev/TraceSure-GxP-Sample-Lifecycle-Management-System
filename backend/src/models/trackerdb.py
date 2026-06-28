from sqlalchemy import Column, String, DateTime, Boolean,Integer, Float
from datetime import datetime, timezone

from models.database import Base


class Samples(Base):
    __tablename__ = "samples"
    __table_args__ = {"extend_existing": True}
    
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
