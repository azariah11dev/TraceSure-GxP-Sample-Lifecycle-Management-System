from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from services.dependencies.model_dependency import get_async_session
from models.deviationformdb import DeviationForm
from models.trackerdb import Samples
from models.deviationsamplesdb import DeviationSamples
from schemas.sample_schema import DeviationApprovalSchema, DeviationTesting
from services.samples.samples import SampleAnalyzer

update_deviation_form_router = APIRouter(prefix="/update_deviation_form", tags=["update_deviation_form"])

@update_deviation_form_router.put("/validate")
async def approve_deviation_form(
    deviation_approval: DeviationApprovalSchema,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        query = select(DeviationForm).where(
            DeviationForm.deviation_code == deviation_approval.deviation_code
        )
        deviation_form = (await session.execute(query)).scalars().first()

        if not deviation_form:
            raise HTTPException(
                status_code=404,
                detail="Deviation form not found for this deviation code"
            )

        # Update approval fields
        deviation_form.approver_name = deviation_approval.approver_name
        deviation_form.approver_role = deviation_approval.approver_role
        deviation_form.approval_status = deviation_approval.approval_status
        deviation_form.form_status = deviation_approval.form_status

        await session.commit()
        await session.refresh(deviation_form)

        return {
            "sample_name": deviation_form.sample_name,
            "test_name": deviation_form.test_name,
            "approver_name": deviation_form.approver_name,
            "approver_role": deviation_form.approver_role
        }
    
    except HTTPException:
        raise
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@update_deviation_form_router.put("/final_test")
async def final_test(
    data: DeviationTesting, 
    session: AsyncSession = Depends(get_async_session)
):
    try:
        # 1. Check if deviation already exists
        check_deviation = select(DeviationSamples).where(
            DeviationSamples.sample_name == data.sample_name,
            DeviationSamples.test_name == data.test_name
        )
        deviation_exist = (await session.execute(check_deviation)).scalars().first()

        if deviation_exist:
            raise HTTPException(status_code=409, detail="Deviation already exists")

        # 2. Fetch the main sample test row
        test_query = select(Samples).where(
            Samples.sample_name == data.sample_name,
            Samples.test_name == data.test_name
        )
        performed_test = (await session.execute(test_query)).scalars().first()

        if performed_test is None:
            raise HTTPException(404, "Sample test not found")

        # 3. Run analyzer
        analyzer = SampleAnalyzer(session=session, test_name=data.test_name)
        status = await analyzer.evaluate(data.new_result)

        # 4. Insert deviation record (audit trail)
        deviation_db = DeviationSamples(
            sample_name=data.sample_name,
            test_name=data.test_name,
            deviation_code=data.deviation_code,
            test_performer=data.test_performer,
            previous_performer=data.previous_performer,
            old_result=data.old_result,
            new_result=data.new_result,
            spec_range_upper_limit=data.spec_range_upper_limit,
            spec_range_lower_limit=data.spec_range_lower_limit,
            unit=data.unit
        )
        session.add(deviation_db)

        # 5. Update main sample test
        performed_test.result = data.new_result
        performed_test.performed_by = data.test_performer
        performed_test.status = status
        performed_test.test_completed_date = datetime.now(timezone.utc)

        # 6. Commit once
        await session.commit()

        return {
            "sample_name": data.sample_name,
            "test_name": data.test_name,
            "test_result": data.new_result,
            "performed_by": data.test_performer,
            "status": status
        }
    
    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
