from pydantic import BaseModel

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
    test_name: str
    result: float
    explanation: str
    modified_by: str