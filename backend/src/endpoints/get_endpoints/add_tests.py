from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func

from services.dependencies.model_dependency import get_async_session
from models.trackerdb import Samples


add_test_router = APIRouter(prefix="/add_test", tags=["add_test"])

@add_test_router.get("/review_tests")
async def review_test(session: AsyncSession = Depends(get_async_session)):
    try:
        query = (
            select(Samples)
            .where(Samples.reviewed_status == False)
            .where(Samples.test_completed_date.isnot(None))
        )

        result = await session.execute(query)
        rows = result.scalars().all()

        if not rows:
            raise HTTPException(status_code=404, detail="No tests available for technician review")

        samples = {}

        for r in rows:
            if r.sample_name not in samples:
                samples[r.sample_name] = {
                    "sample_name": r.sample_name,
                    "status": r.status,
                    "performed_by": r.performed_by,
                    "open_deviation": False,
                    "created_date": r.created_date,
                    "total_tests": 0
                }

            # increment test count
            samples[r.sample_name]["total_tests"] += 1

            # if ANY test is out of spec → open deviation
            if r.status == "out_of_specification":
                samples[r.sample_name]["open_deviation"] = True
            
            if r.created_date and r.created_date < samples[r.sample_name]["created_date"]:
                samples[r.sample_name]["created_date"] = r.created_date
        
        # format dates AFTER grouping
        result = list(samples.values())
        for s in result:
            s["created_date"] = s["created_date"].strftime("%d-%B-%Y") if s["created_date"] else None

        return result

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@add_test_router.get("/technician_review_tests")
async def technician_review_test(
    sample_name: str, 
    session: AsyncSession = Depends(get_async_session)
    ):
    try:
        query = (
            select(Samples)
            .where(Samples.status == "pass")
            .where(Samples.reviewed_status == False)
        )
        result = await session.execute(query)
        rows = result.scalars().all()

        if not rows:
            raise HTTPException(status_code=404, detail="No tests available for technician review")
        
        return [
            {
                "test_name": r.test_name,
                "performed_by": r.performed_by,
                "test_result": r.result,
                "upper_spec": r.spec_range_upper_limit,
                "lower_spec": r.spec_range_lower_limit,
                "unit": r.unit,
                "status": r.status
            } 
            for r in rows if r.sample_name == sample_name
        ]

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@add_test_router.get("/{sample_name}")
async def get_sample(sample_name: str, session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(Samples).where(func.lower(func.trim(Samples.sample_name)) == sample_name.lower().strip())
        rows = (await session.execute(query)).scalars().all()

        if not rows:
            raise HTTPException(status_code=404, detail="Sample not found")

        tests = [row.test_name for row in rows]

        return {
            "sample_name": sample_name,
            "tests": tests
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))