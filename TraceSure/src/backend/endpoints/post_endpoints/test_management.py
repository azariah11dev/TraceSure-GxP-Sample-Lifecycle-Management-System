from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from dependencies.dependency import get_async_session
from models.trackerdb import Samples
from schemas.sample_schema import SampleCreation, SampleResults
from services.samples import SampleAnalyzer
from services.specifications import SpecificationAppender

sample_test_router = APIRouter(prefix="/sample", tags=["sample"])

@sample_test_router.post("/create_sample")
async def create_sample(data: SampleCreation, session: AsyncSession = Depends(get_async_session)):

    log_results(data)

    test_collection = ["identification", "assay", "dissolution", "content_uniformity", "individual_impurity", "total_impurities", "microbial_limit_TAMC", "microbial_limit_TYMC", 'water_content']

    result_row = []

    for test in test_collection:
        row = Samples(
            sample_name=data.sample_name,
            created_by=data.created_by,
            performed_by=None,
            test_name=test_collection[test],
            result=None,
            spec_range_upper_limit=None,
            spec_range_lower_limit=None,
            unit=None,
            status=None,
            reviewed_by=None,
            reviewed_status=None,
            manager_name=None,
            manager_approval=None,
            released_date=None,
            QA_name=None,
            QA_approval=None
        )
        session.add(result_row)
        result_row.append(row)
    
    await session.commit()
    await session.refresh(result_row[0])

    formatted_date = result_row[0].created_date.strftime("%d-%m-%Y")

    return {"sample name": data.sample_name,
            "created by": data.created_by,
            "created date": formatted_date}

@sample_test_router.post("/log_results")
async def log_results(data: SampleResults,
                      session: AsyncSession = Depends(get_async_session)):
    # 1. Find the specific test row for this sample
    query = select(Samples).where(
        Samples.sample_name == data.sample_name,
        Samples.test_name == data.test_name
    )
    row = (await session.execute(query)).scalars().first()
    specs = SpecificationAppender().get_spec(data.test_name)
    date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

    if not row:
        raise HTTPException(status_code=404, detail="Test row not found for this sample")

    # 2. Run analyzer for this test
    analyzer = SampleAnalyzer(session=session, test_name=data.test_name)
    status = await analyzer.evaluate(data.result_value)

    # Append specification
    if specs:
        row.spec_range_lower_limit = specs["lower"]
        row.spec_range_upper_limit = specs["upper"]
        row.unit = specs["unit"]

    # 3. Update the row
    row.result = data.result_value
    row.status = status
    row.performed_by = data.performed_by  # or from auth
    row.test_completed_date= date

    await session.commit()
    await session.refresh(row)

    return {
        "sample_name": data.sample_name,
        "test_name": data.test_name,
        "result": data.result_value,
        "status": status
    }

