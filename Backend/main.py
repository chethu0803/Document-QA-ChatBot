from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF for PDF text extraction
import os
import shutil
import google.generativeai as genai

GEMINI_API_KEY= 'Yout'
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text_from_pdf(file_path):
    text = ""
    doc = fitz.open(file_path)
    for page in doc:
        text += page.get_text("text") + "\n"
    return text.strip()

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    
    if file.content_type not in ["application/pdf", "text/plain"]:
        return {"error": "Only PDF and TXT files are allowed."}
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text
    if file.content_type == "application/pdf":
        extracted_text = extract_text_from_pdf(file_path)
    else:
        with open(file_path, "r", encoding="utf-8") as f:
            extracted_text = f.read()
    
    return {"message": "File uploaded successfully", "text": extracted_text}

@app.post("/ask/")
async def ask_question(text: str = Form(...), question: str = Form(...)):
    try:
        prompt = f"Document Content: {text}\n\nUser Question: {question}"
        raw_response= model.generate_content(prompt)
        answer=raw_response.text.strip()
        return {"question": question, "answer": answer}
    except Exception as e:
        return {"error": str(e)}