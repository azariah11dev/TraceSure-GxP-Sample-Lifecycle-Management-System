from pydantic import BaseModel

class SampleCreation(BaseModel):
    sample_name: str
    created_by: str

class SampleResults(BaseModel):
    sample_name: str
    performed_by: str
    test_name: str
    result_value: float