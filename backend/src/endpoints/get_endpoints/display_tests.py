from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.dependencies.model_dependency import get_async_session
from models.trackerdb import Samples
from models.deviationformdb import DeviationForm


display_tests_router = APIRouter(prefix="/display_tests", tags=["display_tests"])

@display_tests_router.get("/dashboard")
async def dashboard(session: AsyncSession = Depends(get_async_session)):
    try:
        query = await session.execute(select(Samples))
        result = query.scalars().all()

        return [
            {
                "QA_approval": r.QA_approval,
                "status": r.status,
                "reviewed_status": r.reviewed_status,
                "manager_approval": r.manager_approval
            }
            for r in result
        ]
    
    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
    
    except HTTPException:
        raise
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@display_tests_router.get("/management_approval")
async def get_management_approval_combined(session: AsyncSession = Depends(get_async_session)):
    try:
        # Fetch all tests needing manager approval
        query = (
            select(Samples)
            .where(Samples.reviewed_status == True)
            .where(Samples.manager_approval == False)
        )
        rows = (await session.execute(query)).scalars().all()

        if not rows:
            return {
                "samples": [],
                "tests": []
            }

        # ─────────────────────────────────────────────
        # SAMPLE‑LEVEL AGGREGATION
        # ─────────────────────────────────────────────
        samples = {}

        for row in rows:
            name = row.sample_name

            if name not in samples:
                samples[name] = {
                    "sample_name": name,
                    "status": row.status,
                    "performed_by": row.performed_by,
                    "total_tests": 0,
                    "creation_date": row.created_date,
                    "completed_date": row.test_completed_date,
                    "deviations": 0,
                }

            samples[name]["total_tests"] += 1

            # earliest creation date
            if row.created_date:
                if samples[name]["creation_date"] is None or row.created_date < samples[name]["creation_date"]:
                    samples[name]["creation_date"] = row.created_date

            # latest completed date
            if row.test_completed_date:
                if samples[name]["completed_date"] is None or row.test_completed_date > samples[name]["completed_date"]:
                    samples[name]["completed_date"] = row.test_completed_date

            # deviation count
            if row.status == "out_of_specification":
                samples[name]["deviations"] += 1

        sample_output = []
        for name, s in samples.items():
            total_days = None
            if s["creation_date"] and s["completed_date"]:
                total_days = (s["completed_date"] - s["creation_date"]).days

            sample_output.append({
                "sample_name": name,
                "status": s["status"],
                "performed_by": s["performed_by"],
                "total_tests": s["total_tests"],
                "creation_date": s["creation_date"].strftime("%d-%B-%Y") if s["creation_date"] else None,
                "completed_date": s["completed_date"].strftime("%d-%B-%Y") if s["completed_date"] else None,
                "total_days": total_days,
                "deviations": s["deviations"],
            })

        # ─────────────────────────────────────────────
        # TEST‑LEVEL LISTING
        # ─────────────────────────────────────────────
        test_output = [
            {
                "test_name": r.test_name,
                "performed_by": r.performed_by,
                "test_result": r.result,
                "upper_spec": r.spec_range_upper_limit,
                "lower_spec": r.spec_range_lower_limit,
                "unit": r.unit,
                "status": r.status,
                "reviewed_by": r.reviewed_by,
                "deviation": (True if r.status == "out_of_specification" else False)
            }
            for r in rows
        ]

        # ─────────────────────────────────────────────
        # RETURN BOTH IN ONE RESPONSE
        # ─────────────────────────────────────────────
        return {
            "samples": sample_output,
            "tests": test_output
        }
    
    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@display_tests_router.get("/test_for_release")
async def get_management_approval(session: AsyncSession = Depends(get_async_session)):
    try:
        # Fetch all tests needing manager approval
        query = (
            select(Samples)
            .where(Samples.manager_approval == True)
            .where(Samples.QA_approval == False)
        )
        rows = (await session.execute(query)).scalars().all()

        if not rows:
            return {
                "samples": [],
                "tests": []
            }
        
        # ─────────────────────────────────────────────
        # SAMPLE‑LEVEL AGGREGATION
        # ─────────────────────────────────────────────
        samples = {}

        for row in rows:
            name = row.sample_name

            if name not in samples:
                samples[name] = {
                    "sample_name": name,
                    "status": row.status,
                    "approved_by": row.manager_name,
                    "total_tests": 0,
                    "creation_date": row.created_date,
                    "completed_date": row.test_completed_date
                }

            samples[name]["total_tests"] += 1

            # earliest creation date
            if row.created_date:
                if samples[name]["creation_date"] is None or row.created_date < samples[name]["creation_date"]:
                    samples[name]["creation_date"] = row.created_date

            # latest completed date
            if row.test_completed_date:
                if samples[name]["completed_date"] is None or row.test_completed_date > samples[name]["completed_date"]:
                    samples[name]["completed_date"] = row.test_completed_date

        sample_output = []
        for name, s in samples.items():
            total_days = None
            if s["creation_date"] and s["completed_date"]:
                total_days = (s["completed_date"] - s["creation_date"]).days

            sample_output.append({
                "sample_name": name,
                "status": s["status"],
                "performed_by": s["performed_by"],
                "total_tests": s["total_tests"],
                "creation_date": s["creation_date"].strftime("%d-%B-%Y") if s["creation_date"] else None,
                "completed_date": s["completed_date"].strftime("%d-%B-%Y") if s["completed_date"] else None,
                "total_days": total_days,
                "deviations": s["deviations"],
            })

        # ─────────────────────────────────────────────
        # TEST‑LEVEL LISTING
        # ─────────────────────────────────────────────
        test_output = [
            {
                "test_name": r.test_name,
                "performed_by": r.manager_name,
                "test_result": r.result,
                "upper_spec": r.spec_range_upper_limit,
                "lower_spec": r.spec_range_lower_limit,
                "unit": r.unit,
                "status": r.status,
                "approval_status": r.manager_approval,
            }
            for r in rows
        ]

        # ─────────────────────────────────────────────
        # RETURN BOTH IN ONE RESPONSE
        # ─────────────────────────────────────────────
        return {
            "samples": sample_output,
            "tests": test_output
        }
    
    except HTTPException:
        raise
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@display_tests_router.get("/historical")
async def historical_tests(session: AsyncSession = Depends(get_async_session)):
    try:
        query = (
            select(Samples)
            .where(Samples.QA_approval == True)
            .order_by(Samples.test_completed_date.desc())
        )
        rows = (await session.execute(query)).scalars().all()

        if not rows:
            return {"samples": [], "tests": []}

        samples = {}

        for r in rows:
            name = r.sample_name

            if name not in samples:
                samples[name] = {
                    "sample_name": name,
                    "total_tests": 0,
                    "creation_date": r.created_date,
                    "completed_date": r.test_completed_date
                }

            samples[name]["total_tests"] += 1

            if r.created_date and (samples[name]["creation_date"] is None or r.created_date < samples[name]["creation_date"]):
                samples[name]["creation_date"] = r.created_date

            if r.test_completed_date and (samples[name]["completed_date"] is None or r.test_completed_date > samples[name]["completed_date"]):
                samples[name]["completed_date"] = r.test_completed_date

        sample_output = []
        for name, s in samples.items():
            total_days = None
            if s["creation_date"] and s["completed_date"]:
                total_days = (s["completed_date"] - s["creation_date"]).days

            sample_output.append({
                "sample_name": name,
                "total_tests": s["total_tests"],
                "creation_date": s["creation_date"].strftime("%d-%B-%Y") if s["creation_date"] else None,
                "completed_date": s["completed_date"].strftime("%d-%B-%Y") if s["completed_date"] else None,
                "total_days": total_days,
            })

        test_output = [
            {
                "test_name": r.test_name,
                "performed_by": r.performed_by,
                "test_result": r.result,
                "upper_spec": r.spec_range_upper_limit,
                "lower_spec": r.spec_range_lower_limit,
                "unit": r.unit,
                "status": r.status,
                "reviewed_by": r.reviewed_by,
                "deviation": (r.status == "out_of_specification"),
                "approved_by": r.manager_name,
                "released_by": r.QA_name
            }
            for r in rows
        ]

        return {"samples": sample_output, "tests": test_output}

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
    
    except HTTPException:
        raise
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@display_tests_router.get("/")
async def display_tests(session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(Samples).where(Samples.manager_approval == False)
        rows = (await session.execute(query)).scalars().all()

        if not rows:
            return []

        samples = {}

        for row in rows:
            name = row.sample_name

            if name not in samples:
                samples[name] = {
                    "sample_name": name,
                    "creation_date": row.created_date,   # store datetime
                    "pending_tests": 0,
                    "completed_tests": 0,
                    "open_deviations": 0,
                    "status": row.status,
                }

            samples[name]["pending_tests"] += 1

            # keep earliest creation date
            if row.created_date and row.created_date < samples[name]["creation_date"]:
                samples[name]["creation_date"] = row.created_date

            if row.test_completed_date is not None:
                samples[name]["completed_tests"] += 1

            if row.status == "out_of_specification":
                samples[name]["open_deviations"] += 1

        # format dates AFTER grouping
        result = list(samples.values())
        for s in result:
            s["creation_date"] = s["creation_date"].strftime("%d-%B-%Y")

        return result
    
    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
