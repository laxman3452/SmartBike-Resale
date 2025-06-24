from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

# Allow CORS for your frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or "*" to allow all
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)

# Load the saved model and encoders once
model = joblib.load('model/used_bike_model.pkl')
encoders = joblib.load('model/encoders.pkl')

# Define the expected input JSON format exactly matching your features
class PredictRequest(BaseModel):
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

# The exact order of features your model expects (same as training)
FEATURE_ORDER = [
    'brand', 'bike_name', 'year_of_purchase', 'cc', 'kms_driven',
    'owner', 'servicing', 'engine_condition', 'physical_condition', 'tyre_condition'
]


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}

@app.post("/predict")
def predict_price(data: PredictRequest):
    input_data = data.dict()

    # Encode categorical columns using saved encoders
    for col in encoders:
        if col in input_data:
            encoder = encoders[col]
            try:
                input_data[col] = encoder.transform([input_data[col]])[0]
            except ValueError:
                return {"error": f"Value '{input_data[col]}' not recognized for feature '{col}'."}

    # Create a DataFrame with one row, columns in the right order
    input_df = pd.DataFrame([[input_data[col] for col in FEATURE_ORDER]], columns=FEATURE_ORDER)

    # Predict price
    prediction = model.predict(input_df)
    print(float(prediction[0]))

    return {"predicted_price": float(prediction[0])}
