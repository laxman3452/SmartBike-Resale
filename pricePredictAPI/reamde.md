
## Prerequisites

- Python 3.7 or higher
- Git (to clone the repo)

## Setup

***Navigate to this folder and then run these commands,***


1. **Create a virtual environment**:
    ```bash
    python -m venv venv
2. ***Activate the virtual environment***:
   ```bash
   venv\Scripts\activate
3. ***Install dependencies***:
   ```bash
   pip install -r requirements.txt
4. ***Run the FastAPI server***:
   ```bash
   uvicorn main:app --reload 
5. ***POST Request***
   ```bash
    /predict
    {
      "brand": "Honda",
      "bike_name": "CB Shine",
      "year_of_purchase": 2018,
      "cc": 125,
      "kms_driven": 23000,
      "owner": "First",
      "servicing": "Regular",
      "engine_condition": "Good",
      "physical_condition": "Good",
      "tyre_condition": "Average"
    }


   
   
   
    
