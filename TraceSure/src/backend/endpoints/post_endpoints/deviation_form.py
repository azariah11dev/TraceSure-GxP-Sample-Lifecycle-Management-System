from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies.dependency import get_async_session
from models.trackerdb import DeviationForm
from schemas.sample_schema import DeviationSchema

sample_deviation_router = APIRouter(prefix="/deviation", tags=["deviation"])

@sample_deviation_router.post("", response_model=DeviationSchema)
async def create_deviation(payload: DeviationSchema, session: AsyncSession = Depends(get_async_session)):
    deviation = DeviationForm(**payload.model_dump())

    if deviation.manager_name is None:
        deviation.manager_approval = False

    session.add(deviation)
    await session.commit()
    await session.refresh(deviation)

    return deviation