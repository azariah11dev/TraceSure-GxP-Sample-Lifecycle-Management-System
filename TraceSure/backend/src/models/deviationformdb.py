from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, Date
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone

from models.database import Base


class DeviationForm(Base):
    __tablename__ = "deviation_form"
    __table_args__ = {"extend_existing": True}

    deviation_code = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)

    form_status = Column(String, index=True)

    submitted_by = Column(String, index=True)

    submitted_by_role = Column(String, index=True)

    approver_name = Column(String, index=True)

    approver_role = Column(String, index=True)

    approval_status = Column(Boolean)

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