from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.dependencies.model_dependency import get_async_session
from models.deviationformdb import DeviationForm
from schemas.sample_schema import DeviationSchema


sample_deviation_router = APIRouter(prefix="/deviation", tags=["deviation"])

@sample_deviation_router.post("", response_model=DeviationSchema)
async def create_deviation(
    payload: DeviationSchema,
    session: AsyncSession = Depends(get_async_session)
):
    try:
        # Check if deviation already exists
        result = await session.execute(
            select(DeviationForm).where(
                DeviationForm.sample_name == payload.sample_name,
                DeviationForm.test_name == payload.test_name,
            )
        )
        existing_deviation = result.scalars().first()

        if existing_deviation:
            # Update only the fields you want to allow updating
            update_data = payload.model_dump()

            for field, value in update_data.items():
                setattr(existing_deviation, field, value)

            deviation = existing_deviation

        else:
            # Create new deviation
            deviation = DeviationForm(**payload.model_dump())
            session.add(deviation)

        await session.commit()
        await session.refresh(deviation)

        return deviation
    
    except HTTPException:
        raise
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException (status_code=500, detail=str(e))