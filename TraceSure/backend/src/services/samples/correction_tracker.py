from sqlalchemy.ext.asyncio import AsyncSession

from models.correctiondb import CorrectionLog

class CorrectionTracker:
    def __init__(self, data, session: AsyncSession):
        self.session = session
        self.data = data

    async def log_correction(self):
        row = CorrectionLog(
                sample_name=self.data.sample_name,
                performed_by=self.data.performed_by,
                test_name=self.data.test_name,
                old_result=self.data.old_result,
                new_result=self.data.new_result,
                explanation=self.data.explanation,
                modified_by=self.data.modified_by
        )
        
        self.session.add(row)
        await self.session.commit()
        await self.session.refresh(row) 
        
        return {
            "sample_name": self.data.sample_name,
            "test_name": self.data.test_name,
            "old_result": self.data.old_result,
            "new_result": self.data.new_result,
            "explanation": self.data.explanation,
            "modified_by": self.data.modified_by
        }
