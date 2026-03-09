from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from dependencies.dependency import get_async_session
from models.trackerdb import Samples
from schemas.sample_schema import SampleCreation

update_sample_test_router = APIRouter(prefix="/update_sample_test", tags=["update_sample_test"])

@update_sample_test_router.put("/add_tests")
async def add_tests(data: SampleCreation, session: AsyncSession = Depends(get_async_session)):

    # 1. Fetch existing tests for this sample
    existing_tests_query = select(Samples.test_name).where(
        Samples.sample_name == data.sample_name
    )
    existing_tests = (await session.execute(existing_tests_query)).scalars().all()

    # Normalize for safety (optional but recommended)
    requested_tests = [t.strip().lower() for t in data.tests]
    existing_tests_normalized = [t.strip().lower() for t in existing_tests]

    # 2. Check if ANY requested test already exists
    duplicates = [t for t in requested_tests if t in existing_tests_normalized]

    if duplicates:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot add tests. The following tests already exist for sample "
                f"{data.sample_name}: {duplicates}. "
                "No tests were added."
            )
        )

    # 3. If we reach here, ALL tests are new → safe to insert
    inserted_rows = []
    for test in requested_tests:
        row = Samples(
            sample_name=data.sample_name,
            created_by=data.created_by,
            performed_by=None,
            test_name=test,
            result=None,
            spec_range_upper_limit=None,
            spec_range_lower_limit=None,
            unit=None,
            status=None,
            test_completed_date=None,
            reviewed_by=None,
            reviewed_status=None,
            manager_name=None,
            manager_approval=None,
            released_date=None,
            QA_name=None,
            QA_approval=None
        )
        session.add(row)
        inserted_rows.append(row)

    await session.commit()

    return {
        "sample_name": data.sample_name,
        "added_tests": requested_tests,
        "message": f"Successfully added {len(requested_tests)} new tests to sample {data.sample_name}."
    }