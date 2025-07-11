import pandas as pd

def update_servicing_column(file_path, output_file=None):
    # Read the Excel file
    df = pd.read_excel(file_path)

    # Check if 'servicing' column exists
    if 'servicing' not in df.columns:
        raise ValueError("The column 'servicing' was not found in the Excel file.")

    # Set all values in 'servicing' column to 'regular'
    df['servicing'] = 'regular'

    # Define output file name if not provided
    if output_file is None:
        output_file = file_path  # Overwrite original file

    # Save the updated DataFrame
    df.to_excel(output_file, index=False)
    print(f"'servicing' column updated to 'regular' for all rows and saved to {output_file}")

# Example usage
update_servicing_column('used_bike_data.xlsx')
