from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from dependencies.dependency import get_async_session
from models.trackerdb import Samples

add_test_router = APIRouter(prefix="/add_test", tags=["add_test"])

@add_test_router.get("/{sample_name}")
async def get_sample(sample_name: str, session: AsyncSession = Depends(get_async_session)):
    query = select(Samples).where(func.lower(func.trim(Samples.sample_name)) == sample_name.lower().strip())
    rows = (await session.execute(query)).scalars().all()

    if not rows:
        raise HTTPException(status_code=404, detail="Sample not found")

    tests = [row.test_name for row in rows]

    return {
        "sample_name": sample_name,
        "tests": tests
    }