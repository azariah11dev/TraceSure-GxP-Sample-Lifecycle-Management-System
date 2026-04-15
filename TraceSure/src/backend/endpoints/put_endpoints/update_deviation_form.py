from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from dependencies.dependency import get_async_session
from models.trackerdb import DeviationForm
from schemas.sample_schema import DeviationApprovalSchema

update_deviation_form_router = APIRouter(prefix="/update_deviation_form", tags=["update_deviation_form"])

@update_deviation_form_router.put("/validate")
async def approve_deviation_form(
    deviation_approval: DeviationApprovalSchema,
    session: AsyncSession = Depends(get_async_session)
):
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
