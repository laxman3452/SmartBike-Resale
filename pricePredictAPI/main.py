from fastapi import FastAPI
from schemas import BikeDetails
from model import predict_price

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Bike Price Prediction API"}

@app.post("/predict/")
def predict(data: BikeFeatures):
    prediction = predict_price(data.dict())
    return {"predicted_price": prediction}
