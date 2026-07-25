1. Install Dependencies
Open your terminal in the aiService directory and install the required Python packages from the updated requirements.txt:

bash
pip install -r requirements.txt

2. Start the FastAPI Server
Run the main application script:

bash
python app.py
Alternatively, you can run it directly using Uvicorn:

bash
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
The service will start running at http://localhost:5000. You can visit the interactive API documentation (Swagger UI) at http://localhost:5000/docs in your browser.


in the admin pannel found items page if i click verify owner then will show me the ai similarity percentage and data in a modal, do this feature according to my client, server, aiService code sync