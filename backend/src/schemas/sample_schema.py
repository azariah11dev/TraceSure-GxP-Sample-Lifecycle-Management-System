from pydantic import BaseModel, Field
from datetime import date, datetime

class SampleCreation(BaseModel):
    sample_name: str
    created_by: str
    tests: list[str]

class SampleResults(BaseModel):
    sample_name: str
    performed_by: str
    test_name: str
    result_value: float
    explanation: str | None = None

class CorrectionLogEntry(BaseModel):
    sample_name: str
    performed_by: str
    test_name: str
    old_result: float
    new_result: float
    explanation: str
    modified_by: str

class DeviationSchema(BaseModel):
    form_status: str
    submitted_by: str
    submitted_by_role: str
    approver_name: str | None = None
    approver_role: str | None = None
    approval_status: bool | None = None

    sample_name: str
    test_name: str
    deviation_date: datetime

    deviation_report_date: datetime
    deviation_department: str
    deviation_reported_at: str

    deviation_type: str
    deviation_severity: str
    deviation_short_description: str = Field(max_length=200)
    deviation_long_description: str

    deviation_location: str
    deviation_sop_number: str | None = None
    deviation_instrument_id: str | None = None

    deviation_sample_type: str
    deviation_quantity_impacted: int
    deviation_batch_released: bool

    potential_impact_to_product_quality: str
    immediate_action_taken: str
    date_action_taken: date

    deviation_test_performed_by: str
    was_testing_repeated: bool
    reference_to_retest: str | None = None

    investigation_required: bool
    investigation_assigned_to: str | None = None

    investigation_start_date: date | None = None
    investigation_end_date: date | None = None

    root_cause_category: str | None = None
    root_cause_description: str | None = None

    capa_required: bool
    correction_action: str | None = None
    preventative_action: str | None = None

    responsible_person: str | None = None
    target_completion_date: date | None = None

    effectiveness_check_required: bool
    batch_disposition: str

class DeviationApprovalSchema(BaseModel):
    deviation_code: str
    approver_name: str
    approver_role: str
    approval_status: bool
    form_status: str

class DeviationTesting(BaseModel):
    sample_name: str
    test_name: str
    deviation_code: str
    test_performer: str
    previous_performer: str
    new_result: float
    spec_range_upper_limit: str
    spec_range_lower_limit: str
    unit: str
