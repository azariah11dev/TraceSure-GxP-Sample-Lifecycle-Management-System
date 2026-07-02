from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func

from services.dependencies.model_dependency import get_async_session
from models.trackerdb import Samples
from schemas.sample_schema import ReviewTestResults


review_test_router = APIRouter(prefix="/review_test", tags=["review_test"])

@review_test_router.put("/technician_review_tests")
async def technician_review_test(
    data: ReviewTestResults,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        query = (
            select(Samples)
            .where(Samples.sample_name == data.sample_name)
            .where(Samples.test_name == data.test_name)
            .where(Samples.status == "pass")
            .where(Samples.reviewed_status == False)
        )

        result = await session.execute(query)
        test_sample = result.scalars().first()

        if not test_sample:
            raise HTTPException(status_code=404, detail="Test not found or already reviewed")
        
        if test_sample.performed_by == data.reviewed_by:
            raise HTTPException(status_code=400, detail="The reviewer cannot be the same as the test performer")

        # Update fields
        test_sample.reviewed_by = data.reviewed_by
        test_sample.reviewed_status = data.reviewed_status

        await session.commit()
        await session.refresh(test_sample)

        return {
            "sample_name": test_sample.sample_name,
            "test_name": test_sample.test_name,
            "reviewed_by": test_sample.reviewed_by,
            "reviewed_status": test_sample.reviewed_status,
            "status": test_sample.status
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
