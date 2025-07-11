import pandas as pd

def reorder_columns(input_file, output_file):
    # Read the Excel file
    df = pd.read_excel(input_file)

    # Define the desired column order
    column_order = [
        'brand', 'bike_name', 'year_of_purchase', 'power', 'kms_driven', 'owner',
        'total_servicing', 'engine_condition', 'physical_condition', 'tyre_condition', 'price'
    ]

       
    # Reorder columns according to the specified order
    df = df[column_order]

    # Save the updated file with the new column order
    df.to_excel(output_file, index=False)
    print(f"File processed and saved as: {output_file}")

# Example usage
input_file = "bikes_with_tyre_condition.xlsx"             # Replace with your input Excel file
output_file = "bikes_reordered.xlsx"  # Output file with reordered columns
reorder_columns(input_file, output_file)
