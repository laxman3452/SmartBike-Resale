import pandas as pd
import os

# Step 1: Load CSV
csv_path = "Used_Bikes.csv"  # Replace with your actual CSV filename
df = pd.read_csv(csv_path)

# Step 2: Convert and save to Excel
excel_path = os.path.splitext(csv_path)[0] + ".xlsx"
df.to_excel(excel_path, index=False)

# Step 3: Process data
if 'city' in df.columns:
    df.drop(columns=['city'], inplace=True)

# Step 4: Convert 'age' (based on 2022) to 'year_of_purchase'
if 'age' in df.columns:
    df['year_of_purchase'] = 2022 - df['age']
    df.drop(columns=['age'], inplace=True)

# Step 5: Save processed data to optimized Excel file
optimized_excel_path = os.path.splitext(csv_path)[0] + "_processed.xlsx"
df.to_excel(optimized_excel_path, index=False)

print(f"✅ Processed Excel file saved as: {optimized_excel_path}")
