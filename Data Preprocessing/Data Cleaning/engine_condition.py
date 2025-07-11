import pandas as pd

def get_engine_open_km(cc):
    """Return the approximate km after which engine may need to be opened."""
    if cc <= 150:
        return 80000
    elif 150 < cc <= 300:
        return 70000
    elif 300 < cc <= 600:
        return 60000
    else:
        return 50000

def evaluate_engine_condition(cc, kms_driven):
    """Return 'seal' if engine likely untouched, else 'open'."""
    open_km = get_engine_open_km(cc)
    return "seal" if kms_driven < open_km else "open"

def add_engine_condition_column(file_path, output_path):
    # Load Excel file
    df = pd.read_excel(file_path)

    # Validate required columns
    if 'power' not in df.columns or 'kms_driven' not in df.columns:
        raise ValueError("Excel file must contain 'power' and 'kms_driven' columns.")

    # Add engine_condition column
    df['engine_condition'] = df.apply(
        lambda row: evaluate_engine_condition(row['power'], row['kms_driven']), axis=1
    )

    # Save updated Excel
    df.to_excel(output_path, index=False)
    print(f"File saved with engine condition column: {output_path}")

# Example usage
input_file = "bikes_updated.xlsx"         # Replace with your actual file path
output_file = "bikes_with_condition.xlsx"
add_engine_condition_column(input_file, output_file)
