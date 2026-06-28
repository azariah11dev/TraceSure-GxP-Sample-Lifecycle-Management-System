from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from services.dependencies.model_dependency import get_async_session
from models.trackerdb import Samples
from schemas.sample_schema import SampleResults, CorrectionLogEntry
from services.samples.samples import SampleAnalyzer
from services.samples.correction_tracker import CorrectionTracker


update_sample_test_router = APIRouter(prefix="/update_test_result", tags=["update_sample_test"])

@update_sample_test_router.put("/log_results")
async def log_results(data: SampleResults, session: AsyncSession = Depends(get_async_session)):
    try:
        # 1. Find the specific test row for this sample
        query = select(Samples).where(
            Samples.sample_name == data.sample_name,
            Samples.test_name == data.test_name
        )
        row = (await session.execute(query)).scalars().first()
        date = datetime.now(timezone.utc)

        if not row:
            raise HTTPException(status_code=404, detail="Test row not found for this sample")
    
        if row.test_completed_date is not None:
            if not data.explanation:
                raise HTTPException(400, detail="Modification requires justification.")
            else:
                correction_entry = CorrectionLogEntry(
                    sample_name=row.sample_name,
                    performed_by= row.performed_by,
                    test_name=row.test_name,
                    old_result=row.result,
                    new_result=data.result_value,
                    explanation=data.explanation,
                    modified_by=data.performed_by
                )

                correction_tracker = CorrectionTracker(data=correction_entry, session=session)
                await correction_tracker.log_correction()

        # 2. Run analyzer for this test
        analyzer = SampleAnalyzer(session=session, test_name=data.test_name)
        status = await analyzer.evaluate(data.result_value)

        # 3. Update the row
        row.result = data.result_value
        row.status = status
        row.performed_by = data.performed_by
        row.test_completed_date= date

        await session.commit()
        await session.refresh(row)

        return {
            "test_name": row.test_name,
            "result": row.result,
            "spec_upper": row.spec_range_upper_limit,
            "spec_lower": row.spec_range_lower_limit,
            "unit": row.unit,
            "status": row.status,
            "open_deviation": (True if (row.status == "out_of_specification") else False)
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))