
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
        "year": 2018,
        "present_price": 3.5,
        "kms_driven": 40000,
        "owner": 0,
        "fuel_type": "Petrol",
        "seller_type": "Individual",
        "transmission": "Manual"
     }


   
   
   
    
