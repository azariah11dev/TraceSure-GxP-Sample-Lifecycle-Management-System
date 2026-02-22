
class SpecificationAppender:
    def __init__(self):
        self.specs = {
            "identification": {
                "lower": 0.995,
                "upper": 1.0,
                "unit": None
            },
            "assay": {
                "lower": 95.0,
                "upper": 105.0,
                "unit": "%"
            },
            "dissolution": {
                "lower": 80.0,
                "upper": None,
                "unit": "%"
            },
            "content_uniformity": {
                "lower": 0.0,
                "upper": 15.0,
                "unit": "AV"
            },
            "individual_impurity": {
                "lower": 0.0,
                "upper": 0.2,
                "unit": "%"
            },
            "total_impurities": {
                "lower": 0.0,
                "upper": 1.0,
                "unit": "%"
            },
            "microbial_limit_TAMC": {
                "lower": 0,
                "upper": 1000,
                "unit": "CFU/g"
            },
            "microbial_limit_TYMC": {
                "lower": 0,
                "upper": 100,
                "unit": "CFU/g"
            },
            "water_content": {
                "lower": 0.0,
                "upper": 3.0,
                "unit": "%"
            }
        }

    def get_spec(self, test_name: str):
        return self.specs.get(test_name.lower())