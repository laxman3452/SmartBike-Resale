import pickle
import numpy as np

# Load the model
# with open("model/bike_price_model.pkl", "rb") as f:
#     model = pickle.load(f)

def predict_price(data: dict) -> float:
    # Sample feature encoding (adjust based on your model's training pipeline)
    fuel_type = 1 if data["fuel_type"] == "Petrol" else 0
    seller_type = 1 if data["seller_type"] == "Individual" else 0
    transmission = 1 if data["transmission"] == "Manual" else 0

    # Example features order
    input_features = np.array([[data["year"], data["present_price"],
                                data["kms_driven"], data["owner"],
                                fuel_type, seller_type, transmission]])
    prediction = model.predict(input_features)
    return round(prediction[0], 2)
