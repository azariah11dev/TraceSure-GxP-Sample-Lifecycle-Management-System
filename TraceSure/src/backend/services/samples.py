import pandas as pd
from sqlalchemy import select
from models.trackerdb import Samples

class SampleAnalyzer:
    def __init__(self, session, test_name):
        self.session = session
        self.test_name = test_name

    async def check_oot(self, new_value: float):
        query = select(Samples).where(Samples.test_name == self.test_name)
        rows = (await self.session.execute(query)).scalars().all()

        df = pd.DataFrame([{"result": r.result} for r in rows if r.result is not None])

        if df.empty:
            return "no_data"

        mean = df["result"].mean()
        std = df["result"].std()

        upper = mean + 3 * std
        lower = mean - 3 * std

        if new_value > upper or new_value < lower:
            return "out_of_trend"

        return "within_trend"

    # -------------------------
    # TEST-SPECIFIC LOGIC
    # -------------------------

    async def test_identification(self, value):
        oot = await self.check_oot(value)

        if 0.995 <= value <= 1.0:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"

    async def test_assay(self, value):
        oot = await self.check_oot(value)

        if 95.0 <= value <= 105.0:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"

    async def test_dissolution(self, value):
        oot = await self.check_oot(value)

        if value >= 80:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"

    async def test_content_uniformity(self, value):
        oot = await self.check_oot(value)

        if 0 <= value <= 15:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"

    async def test_individual_impurity(self, value):
        oot = await self.check_oot(value)

        if 0 <= value <= 0.2:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"

    async def test_total_impurities(self, value):
        oot = await self.check_oot(value)

        if 0 <= value <= 1.0:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"

    async def test_microbial_limit_TAMC(self, value):
        oot = await self.check_oot(value)

        if 0 <= value <= 1000:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"

    async def test_microbial_limit_TYMC(self, value):
        oot = await self.check_oot(value)

        if 0 <= value <= 100:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"

    async def test_water_content(self, value):
        oot = await self.check_oot(value)

        if 0 <= value <= 3.0:
            return "out_of_trend" if oot == "out_of_trend" else "pass"
        else:
            return "out_of_specification"
        
    async def evaluate(self, value: float):
        # dispatcher based on self.test_name
        if self.test_name == "identification":
            return await self.test_identification(value)
        if self.test_name == "assay":
            return await self.test_assay(value)
        if self.test_name == "dissolution":
            return await self.test_dissolution(value)
        if self.test_name == "content_uniformity":
            return await self.test_content_uniformity(value)
        if self.test_name == "individual_impurity":
            return await self.test_individual_impurity(value)
        if self.test_name == "total_impurities":
            return await self.test_total_impurities(value)
        if self.test_name == "microbial_limit_TAMC":
            return await self.test_microbial_limit_TAMC(value)
        if self.test_name == "microbial_limit_TYMC":
            return await self.test_microbial_limit_TYMC(value)
        if self.test_name == "water_content":
            return await self.test_water_content(value)
        return "unknown_test"
