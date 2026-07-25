from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func

from services.dependencies.model_dependency import get_async_session
from models.trackerdb import Samples
from models.deviationformdb import DeviationForm
from schemas.sample_schema import ReviewTestResults, ApproveTestResults, ReleaseTestResults


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
            .where(Samples.reviewed_status == False)
        )

        result = await session.execute(query)
        test_sample = result.scalars().first()

        if not test_sample:
            raise HTTPException(status_code=404, detail="Test not found or already reviewed")
        
        if test_sample.performed_by == data.reviewed_by:
            raise HTTPException(status_code=400, detail=f"Performer cannot review their own test")

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
    
    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@review_test_router.put("/management_approval")
async def management_approval_status(
    data: ApproveTestResults,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        # Fetch sample awaiting manager approval
        query = (
            select(Samples)
            .where(Samples.sample_name == data.sample_name)
            .where(Samples.test_name == data.test_name)
            .where(Samples.manager_approval == False)
        )
        result = await session.execute(query)
        approval_sample = result.scalars().first()

        if not approval_sample:
            raise HTTPException(status_code=404, detail="Test not found or already approved")

        # Prevent performer from approving their own test
        if approval_sample.performed_by == data.approved_by:
            raise HTTPException(status_code=400, detail="Performer cannot approve their own test")

        # Prevent technician reviewer from approving
        if approval_sample.reviewed_by == data.approved_by:
            raise HTTPException(status_code=400, detail="Technician reviewer cannot approve the test")

        # Fetch deviation form once
        deviation_query = (
            select(DeviationForm)
            .where(DeviationForm.sample_name == data.sample_name)
            .where(DeviationForm.test_name == data.test_name)
        )
        form_result = await session.execute(deviation_query)
        approval_deviation_form = form_result.scalars().first()

        if not approval_deviation_form:
            raise HTTPException(status_code=404, detail="Deviation form not found for this test")

        # Manager rejects test → update deviation form
        if data.approval_status is False:
            approval_deviation_form.form_status = "draft"
            approval_deviation_form.approval_status = False

        # Update manager approval fields
        approval_sample.manager_name = data.approved_by
        approval_sample.manager_approval = data.approval_status

        # Update deviation form approval fields
        approval_deviation_form.form_approver_name = data.approver_name
        approval_deviation_form.form_approver_role = data.approver_role
        approval_deviation_form.approval_status = data.approval_status

        # Commit once
        await session.commit()
        await session.refresh(approval_sample)
        await session.refresh(approval_deviation_form)

        return {
            "sample_name": approval_sample.sample_name,
            "test_name": approval_sample.test_name,
            "approved_by": approval_sample.manager_name,
            "approval_status": approval_sample.manager_approval,
        }

    except HTTPException:
        raise

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@review_test_router.put("/qa_approval")
async def qa_approval(
    data: ReleaseTestResults,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        query = (
            select(Samples)
            .where(Samples.sample_name == data.sample_name)
            .where(Samples.test_name == data.test_name)
            .where(Samples.QA_approval == False)
        )
        result = await session.execute(query)
        release_sample = result.scalars().first()

        if not release_sample:
            raise HTTPException(status_code=404, detail="Test not found")

        # Ensure proper workflow order
        if not release_sample.reviewed_status:
            raise HTTPException(status_code=400, detail="Test must be reviewed before QA approval")

        if not release_sample.manager_approval:
            raise HTTPException(status_code=400, detail="Manager must approve test before QA release")

        # Prevent QA from approving their own test
        if release_sample.manager_name == data.released_by:
            raise HTTPException(status_code=400, detail="Approver cannot release their own test")

        # QA rejection logic (optional)
        if data.release_status is False:
            release_sample.manager_approval = False

        # Update QA approval fields
        release_sample.QA_name = data.released_by
        release_sample.QA_approval = data.release_status

        await session.commit()
        await session.refresh(release_sample)

        return {
            "sample_name": release_sample.sample_name,
            "test_name": release_sample.test_name,
            "approved_by": release_sample.QA_name,
            "approval_status": release_sample.QA_approval,
        }
    
    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
