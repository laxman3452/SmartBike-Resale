from pydantic import BaseModel

class BikeDetails(BaseModel):
    brand: str
    bike_name: str
    year_of_purchase: int
    cc: int
    kms_driven: int
    owner: str
    servicing: str
    engine_condition: str
    physical_condition: str
    tyre_condition: str
