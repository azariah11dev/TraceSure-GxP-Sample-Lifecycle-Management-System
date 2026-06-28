from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.dependencies.model_dependency import get_async_session
from models.trackerdb import Samples
from models.deviationformdb import DeviationForm


display_tests_router = APIRouter(prefix="/display_tests", tags=["display_tests"])

@display_tests_router.get("/deviations")
async def get_deviations(session: AsyncSession = Depends(get_async_session)):
    try:
        # Get all OOS/OOT tests
        rows = (await session.execute(
            select(Samples).where(
                (Samples.status == "out_of_specification") |
                (Samples.status == "out_of_trend")
            )
        )).scalars().all()

        if not rows:
            return []

        # Get ALL deviation forms (not only approved)
        deviations = (await session.execute(
            select(DeviationForm)
        )).scalars().all()

        # Build a lookup dictionary for fast matching
        deviation_lookup = {
            (d.sample_name, d.test_name): d.form_status
            for d in deviations
        }

        return [
            {
                "sample_name": r.sample_name,
                "test_name": r.test_name,
                "result": r.result,
                "spec_upper": r.spec_range_upper_limit,
                "spec_lower": r.spec_range_lower_limit,
                "unit": r.unit,
                "deviation_status": r.status,
                "form_status": deviation_lookup.get((r.sample_name, r.test_name))
            }
            for r in rows
        ]
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@display_tests_router.get("/{sample_name}")
async def get_tests_for_sample(sample_name: str, session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(Samples).where(Samples.sample_name == sample_name)
        rows = (await session.execute(query)).scalars().all()

        if not rows:
            return []

        return [
            {
                "test_name": r.test_name,
                "result": r.result,
                "spec_upper": r.spec_range_upper_limit,
                "spec_lower": r.spec_range_lower_limit,
                "unit": r.unit,
                "status": r.status,
                "open_deviation": (True if (r.status == "out_of_specification") else False)
            }
            for r in rows
        ]
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@display_tests_router.get("")
async def display_tests(session: AsyncSession = Depends(get_async_session)):
    try:
        # Fetch all tests that are NOT approved
        query = select(Samples).where(Samples.manager_approval == False)
        rows = (await session.execute(query)).scalars().all()

        if not rows:
            return []   # return empty list instead of 404

        samples = {}
        for row in rows:
            name = row.sample_name
            if name not in samples:
                samples[name] = {
                    "sample_name": name,
                    "creation_date": row.created_date.strftime("%d-%B-%Y"),
                    "pending_tests": 0,
                    "completed_tests": 0,
                    "open_deviations": 0,
                    "status": row.status,
                }
            samples[name]["pending_tests"] += 1

            if row.test_completed_date is not None:
                samples[name]["completed_tests"] += 1

            if row.status == "out_of_specification":
                samples[name]["open_deviations"] += 1

        # Convert dict → list for frontend
        return list(samples.values())
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))