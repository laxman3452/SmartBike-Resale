from pydantic import BaseModel

class BikeFeatures(BaseModel):
    year: int
    present_price: float
    kms_driven: int
    owner: int
    fuel_type: str
    seller_type: str
    transmission: str
