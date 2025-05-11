from fastapi import FastAPI
from schemas import BikeDetails
from typing import Any
import numpy as np
import pickle

# Load model once when app starts
with open("model/used_bike_model.pkl", "rb") as f:
    model = pickle.load(f)

app = FastAPI()

# Define schema (you can also import this from schemas.py)

@app.post("/predict")
def predict_price(data: BikeDetails) -> Any:
    input_features = np.array([[data.brand,
                                 data.bike_name,
                                 data.year_of_purchase,
                                 data.cc,
                                 data.kms_driven,
                                 data.owner,
                                 data.servicing,
                                 data.engine_condition,
                                 data.physical_condition,
                                 data.tyre_condition]],
                               dtype=object)

    prediction = model.predict(input_features)
    return {"predicted_price": round(prediction[0], 2)}
