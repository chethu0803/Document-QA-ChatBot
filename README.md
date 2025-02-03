Technology Stack:

Backend: Built with FastAPI (Python)

Frontend: React.js (with Vite as the build tool)

Follow the instructions to run locally:

->Open Document QA ChatBot directory

->Enter your Gemini API Key in main.py file in Backend Directory

->Run 2 terminals, one for Frontend and other for Backend

To run frontend:

->Terminal 1:

    cd Frontend
    
    npm install
    
    npm run dev

To run backtend:

->Terminal 2:

    cd Backend
    
    python -m venv env
    
    env/Scripts/activate
    
    pip install -r requirements.txt
    
    uvicorn main:app
