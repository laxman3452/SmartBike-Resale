import pickle
import numpy as np

# Load the model
# with open("model/bike_price_model.pkl", "rb") as f:
#     model = pickle.load(f)

def predict_price(data: dict) -> float:
   

    # Example features order
    input_features = np.array([[data["year"], data["present_price"],
                                data["kms_driven"], data["owner"],
                                ]])
    prediction = model.predict(input_features)
    return round(prediction[0], 2)
