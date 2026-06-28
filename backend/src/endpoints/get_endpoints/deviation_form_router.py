from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func

from services.dependencies.model_dependency import get_async_session
from models.deviationformdb import DeviationForm
from models.trackerdb import Samples


deviation_form_router = APIRouter(prefix="/deviation_form", tags=["deviation_form"])

@deviation_form_router.get("/all_pending")
async def get_all_deviations(session: AsyncSession = Depends(get_async_session)):
    try:
        query = select(DeviationForm).where(
            func.lower(DeviationForm.form_status) == "submitted"
        )
        result = (await session.execute(query)).scalars().all()

        if not result:
            return []

        return [
            {
                "deviation_code": r.deviation_code,
                "sample_name": r.sample_name,
                "test_name": r.test_name,
                "deviation_date": (
                    r.deviation_date.strftime("%d %b %Y %I:%M %p")
                    if r.deviation_date else None
                ),
                "deviation_department": r.deviation_department
            }
            for r in result
        ]

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@deviation_form_router.get("/tests")
async def deviation_test(
    sample_name: str,
    test_name: str,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        # Fetch the sample test result
        sample_query = (
            select(Samples)
            .where(Samples.sample_name == sample_name)
            .where(Samples.test_name == test_name)
        )

        sample_result = await session.execute(sample_query)
        sample_row = sample_result.scalars().first()

        if sample_row is None:
            return []

        # Fetch the deviation form entry
        deviation_query = (
            select(DeviationForm)
            .where(DeviationForm.sample_name == sample_name)
            .where(DeviationForm.test_name == test_name)
        )

        deviation_result = await session.execute(deviation_query)
        deviation_row = deviation_result.scalars().first()

        return {
            "sample_name": sample_row.sample_name,
            "deviation_code": deviation_row.deviation_code if deviation_row else None,
            "test_name": sample_row.test_name,
            "old_result": sample_row.result,
            "spec_upper": sample_row.spec_range_upper_limit,
            "spec_lower": sample_row.spec_range_lower_limit,
            "unit": sample_row.unit,
            "status": sample_row.status,
            "previous_performer": sample_row.performed_by,
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@deviation_form_router.get("")
async def get_deviation(
    sample_name: str,
    test_name: str,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        query = (
            select(DeviationForm)
            .where(DeviationForm.sample_name == sample_name)
            .where(DeviationForm.test_name == test_name)
            # Python's `or` keyword evaluates eagerly and just returns
            # the first truthy clause object — the "approved" branch was silently
            # ignored. Use SQLAlchemy's or_() so both conditions reach the DB.
            .where(
                or_(
                    func.lower(DeviationForm.form_status) == "draft",
                    func.lower(DeviationForm.form_status) == "submitted",
                )
            )
        )

        result = await session.execute(query)
        row = result.scalars().first()

        if row is None:
            # Return null explicitly so the frontend can distinguish "no record"
            # from a serialization error.
            return None

        # FastAPI cannot serialize a raw SQLAlchemy ORM instance.
        # Returning `row` directly causes a 500 or an empty body, which the JS
        # then treats as null and exits before filling the form.
        # Convert to a plain dict so FastAPI's JSON encoder can handle it.
        return {
            "deviation_code": row.deviation_code,
            "deviation_date": row.deviation_date.isoformat() if row.deviation_date else None,
            "deviation_report_date": row.deviation_report_date.isoformat() if row.deviation_report_date else None,
            "deviation_department": row.deviation_department,
            "deviation_reported_at": row.deviation_reported_at,
            "deviation_type": row.deviation_type,
            "deviation_severity": row.deviation_severity,
            "deviation_short_description": row.deviation_short_description,
            "deviation_long_description": row.deviation_long_description,
            "deviation_location": row.deviation_location,
            "deviation_sop_number": row.deviation_sop_number,
            "deviation_instrument_id": row.deviation_instrument_id,
            "deviation_sample_type": row.deviation_sample_type,
            "deviation_quantity_impacted": row.deviation_quantity_impacted,
            "deviation_batch_released": row.deviation_batch_released,
            "potential_impact_to_product_quality": row.potential_impact_to_product_quality,
            "immediate_action_taken": row.immediate_action_taken,
            "date_action_taken": row.date_action_taken.isoformat() if row.date_action_taken else None,
            "deviation_test_performed_by": row.deviation_test_performed_by,
            "was_testing_repeated": row.was_testing_repeated,
            "reference_to_retest": row.reference_to_retest,
            "investigation_required": row.investigation_required,
            "investigation_assigned_to": row.investigation_assigned_to,
            "investigation_start_date": row.investigation_start_date.isoformat() if row.investigation_start_date else None,
            "investigation_end_date": row.investigation_end_date.isoformat() if row.investigation_end_date else None,
            "root_cause_category": row.root_cause_category,
            "root_cause_description": row.root_cause_description,
            "capa_required": row.capa_required,
            "correction_action": row.correction_action,
            "preventative_action": row.preventative_action,
            "responsible_person": row.responsible_person,
            "target_completion_date": row.target_completion_date.isoformat() if row.target_completion_date else None,
            "effectiveness_check_required": row.effectiveness_check_required,
            "batch_disposition": row.batch_disposition,
            "form_status": row.form_status,
            "submitted_by": row.submitted_by,
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))