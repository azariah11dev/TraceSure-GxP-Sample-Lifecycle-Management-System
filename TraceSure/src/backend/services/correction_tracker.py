from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from models.trackerdb import CorrectionLog
from schemas.sample_schema import CorrectionLogEntry

class CorrectionTracker:
    def __init__(self, data: CorrectionLogEntry, session: AsyncSession):
        self.session = session
        self.data = data

    async def log_correction(self):
        row = CorrectionLog(
                sample_name=self.data.sample_name,
                test_name=self.data.test_name,
                result=self.data.result,
                explanation=self.data.explanation,
                modified_by=self.data.modified_by
        )
        self.session.add(row)
        await self.session.commit()
        await self.session.refresh(row) 
        
        return {
            "sample_name": self.data.sample_name,
            "test_name": self.data.test_name,
            "result": self.data.result,
            "explanation": self.data.explanation,
            "modified_by": self.data.modified_by
        }
