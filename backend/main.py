import os
import anthropic
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# --- CORS Middleware ---
# This allows your frontend (running on a different URL) to communicate with this backend.
origins = [
    "http://localhost:5173",  # The default for Vite
    "http://127.0.0.1:5173",
    # Add the URL of your deployed frontend here if you have one
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Anthropic Client ---
# It's best practice to initialize the client once and reuse it.
try:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not found in .env file")
    client = anthropic.Anthropic(api_key=api_key)
except ValueError as e:
    print(f"Error: {e}")
    client = None

# --- Pydantic Models ---
# These models define the expected request and response structures.
class AskRequest(BaseModel):
    question: str
    conversation_id: str  # To maintain context in a chat

class AskResponse(BaseModel):
    answer: str

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Portfolio Backend"}

@app.post("/ask", response_model=AskResponse)
async def ask_ai(request: AskRequest):
    if not client:
        return AskResponse(answer="Sorry, the AI service is not configured correctly.")

    # --- Basic Prompt Engineering ---
    # You can expand this with a persona, instructions, and few-shot examples.
    # For a portfolio, you might load your resume or project details here.
    with open("portfolio_stories.txt", "r") as f:
        portfolio_context = f.read()

    prompt = f"""{anthropic.HUMAN_PROMPT} You are a helpful AI assistant representing Viditi Vartak.
    Your goal is to answer questions about her skills, projects, and experience based on the following context.
    Keep your answers concise and professional.

    Context:
    {portfolio_context}

    Question: {request.question}

    {anthropic.AI_PROMPT}"""

    try:
        response = client.completions.create(
            model="claude-2.1",  # Or whichever model you prefer
            prompt=prompt,
            max_tokens_to_sample=300,
            temperature=0.7,
        )
        return AskResponse(answer=response.completion)
    except Exception as e:
        print(f"An error occurred: {e}")
        return AskResponse(answer="Sorry, I encountered an error while processing your request.")

# --- To run this server ---
# 1. Make sure you have a .env file with your ANTHROPIC_API_KEY.
# 2. Open your terminal in this directory.
# 3. Run the command: uvicorn main:app --reload
