from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    text: str
    format: str

def create_prompt(text: str, format: str) -> str:
    formats = {
        "Bullet Notes": "Convert the following chapter into clear and concise bullet points.",
        "Q&A": "Generate a list of questions and answers from the chapter.",
        "Mind Map": "Summarize this chapter in the form of a mind map.",
        "Flashcards": "Create flashcards with key concepts from the chapter."
    }
    instruction = formats.get(format, "Summarize the following content.")
    return f"{instruction}\n\n{text}"

@app.post("/generate")
def generate_notes(request: GenerateRequest):
    if not TOGETHER_API_KEY:
        return {"notes": "❌ TOGETHER_API_KEY is missing in .env file."}

    prompt = create_prompt(request.text, request.format)

    try:
        response = requests.post(
            "https://api.together.xyz/v1/completions",
            headers={
                "Authorization": f"Bearer {TOGETHER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
                "prompt": prompt,
                "max_tokens": 1024,
                "temperature": 0.7,
                "top_p": 0.9
            }
        )

        if response.status_code == 200:
            data = response.json()
            return {"notes": data["choices"][0]["text"].strip()}
        else:
            return {"notes": f"❌ API Error {response.status_code}: {response.text}"}

    except Exception as e:
        return {"notes": f"❌ Request failed: {str(e)}"}

@app.get("/")
def home():
    return {"message": "🚀 NoteNerd backend is running with Mixtral 8x7B!"}
