import pandas as pd

def classify_physical_condition(kms):
    """Classify physical condition based on kms_driven."""
    if kms <= 5000:
        return "fresh"
    elif kms <= 20000:
        return "like new"
    elif kms <= 40000:
        return "old"
    else:
        return "very old"

def add_physical_condition_column(file_path, output_path):
    # Read the Excel file
    df = pd.read_excel(file_path)

    # Check for 'kms_driven' column
    if 'kms_driven' not in df.columns:
        raise ValueError("Excel file must contain a 'kms_driven' column.")

    # Create new column based on kms_driven
    df['physical_condition'] = df['kms_driven'].apply(classify_physical_condition)

    # Save the updated file
    df.to_excel(output_path, index=False)
    print(f"Updated file saved to {output_path}")

# Example usage
input_file = "bikes_with_condition.xlsx"             # Replace with your actual Excel file
output_file = "bikes_physical.xlsx"
add_physical_condition_column(input_file, output_file)
