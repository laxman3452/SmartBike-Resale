import pandas as pd

# Function to update price column by multiplying with 2.5
def update_bike_prices(file_path):
    # Read the Excel file
    df = pd.read_excel(file_path)

    # Check if 'price' column exists in the DataFrame
    if 'price' in df.columns:
        # Multiply the 'price' column by 2.5
        df['price'] = df['price'] * 2.5

        # Save the updated DataFrame back to a new Excel file
        df.to_excel("used_bike_data.xlsx", index=False)
        print("Price column updated successfully and saved to 'updated_bike_prices.xlsx'.")
    else:
        print("The required 'price' column is not found in the Excel file.")

# Example usage:
# Replace 'your_file.xlsx' with the path to your Excel file
update_bike_prices("bikes_reordered.xlsx")
