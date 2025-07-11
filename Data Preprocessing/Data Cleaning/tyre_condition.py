import pandas as pd

TYRE_LIFE_KM = 30000  # You can adjust this if needed

def estimate_tyre_condition(kms_driven):
    """Estimate current tyre condition based on kms since last replacement."""
    kms_since_last_replacement = kms_driven % TYRE_LIFE_KM

    if kms_since_last_replacement <= 5000:
        return "new"
    elif kms_since_last_replacement <= 20000:
        return "good"
    elif kms_since_last_replacement <= 30000:
        return "worn"
    else:
        return "needs replacement"

def add_tyre_condition_column(file_path, output_path):
    # Read Excel file
    df = pd.read_excel(file_path)

    # Validate required column
    if 'kms_driven' not in df.columns:
        raise ValueError("Excel file must contain a 'kms_driven' column.")

    # Add tyre_condition column
    df['tyre_condition'] = df['kms_driven'].apply(estimate_tyre_condition)

    # Save updated Excel
    df.to_excel(output_path, index=False)
    print(f"Updated file saved with tyre condition: {output_path}")

# Example usage
input_file = "bikes_physical.xlsx"                # Replace with your Excel file
output_file = "bikes_with_tyre_condition.xlsx"
add_tyre_condition_column(input_file, output_file)
