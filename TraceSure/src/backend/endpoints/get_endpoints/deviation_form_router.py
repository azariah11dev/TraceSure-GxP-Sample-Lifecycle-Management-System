from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from dependencies.dependency import get_async_session
from models.trackerdb import DeviationForm
from datetime import datetime

deviation_form_router = APIRouter(prefix="/deviation_form", tags=["deviation_form"])

@deviation_form_router.get("/all_pending")
async def get_all_deviations(session: AsyncSession = Depends(get_async_session)):
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

@deviation_form_router.get("")
async def get_deviation(
    sample_name: str,
    test_name: str,
    session: AsyncSession = Depends(get_async_session)
):
    query = (
        select(DeviationForm)
        .where(DeviationForm.sample_name == sample_name)
        .where(DeviationForm.test_name == test_name)
        .where(func.lower(DeviationForm.form_status) == "submitted")
    )

    result = await session.execute(query)
    row = result.scalars().first()

    return row