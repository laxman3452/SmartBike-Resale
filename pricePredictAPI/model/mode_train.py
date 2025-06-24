import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Load the Excel file
def load_data(file_path):
    df = pd.read_excel(file_path)
    return df

# Preprocess the data and encode categorical columns with separate encoders
def preprocess_data(df):
    encoders = {}
    categorical_cols = ['brand', 'bike_name', 'owner', 'engine_condition', 'physical_condition', 'tyre_condition', 'servicing']

    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))  # Convert to str to avoid errors if any NaN
        encoders[col] = le

    # Handle missing values by filling with column mean
    df = df.fillna(df.mean())

    # Select features and target
    features = df.drop(columns=['price'])
    target = df['price']

    return features, target, encoders

# Train the Random Forest model
def train_random_forest(features, target):
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    return rf_model, X_test, y_test

# Evaluate the model
def evaluate_model(model, X_test, y_test):
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    mse = mean_squared_error(y_test, predictions)
    rmse = mse ** 0.5
    r2 = r2_score(y_test, predictions)

    print(f"Mean Absolute Error (MAE): {mae}")
    print(f"Mean Squared Error (MSE): {mse}")
    print(f"Root Mean Squared Error (RMSE): {rmse}")
    print(f"R-squared (R2): {r2}")

# Main function to train and save the model and encoders
def main(file_path):
    df = load_data(file_path)
    features, target, encoders = preprocess_data(df)

    model, X_test, y_test = train_random_forest(features, target)
    evaluate_model(model, X_test, y_test)

    # Save model and encoders
    joblib.dump(model, 'used_bike_model.pkl')
    joblib.dump(encoders, 'encoders.pkl')
    print("Model saved as 'used_bike_model.pkl'")
    print("Encoders saved as 'encoders.pkl'")

# Example usage
main('used_bike_data.xlsx')
