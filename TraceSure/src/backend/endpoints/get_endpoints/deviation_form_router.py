from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from dependencies.dependency import get_async_session
from models.trackerdb import DeviationForm

deviation_form_router = APIRouter(prefix="/deviation_form", tags=["deviation_form"])

@deviation_form_router.get("/deviations")
async def get_deviations(
    sample_name: str,
    test_name: str,
    session: AsyncSession = Depends(get_async_session)
    ):
    
    query = select(DeviationForm).where(DeviationForm.sample_name == sample_name, DeviationForm.test_name == test_name)
    result = (await session.execute(query)).scalars().all()
    row = result.scalars().first()

    if not row:
        raise HTTPException(status_code=404, detail="No deviations found")

    return row