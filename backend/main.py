USE_HF_API = True  # Always use Hugging Face Inference API

import os
from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient
import trello

load_dotenv()
app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_PATH = "HuggingFaceTB/SmolLM3-3B"

# Hugging Face Inference client
hf_client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN,
)


class Message(BaseModel):
    text: str


def query_hf_api(prompt: str) -> str:
    try:
        completion = hf_client.chat.completions.create(
            model=HF_MODEL_PATH,
            messages=[{"role": "user", "content": prompt}],
        )
        return completion.choices[0].message["content"].strip()
    except Exception as e:
        return f"HF API error: {str(e)}"


@app.get("/")
def root():
    return {"status": "Server is running"}


def clean_reply(text: str) -> str:
    """Remove hidden reasoning traces and extra whitespace."""
    if not text:
        return "I couldn’t generate a response."

    import re
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return " ".join(lines).strip()


@app.post("/chat")
def chat(message: Message):
    try:
        raw_reply = query_hf_api(message.text)
        reply = clean_reply(raw_reply)
    except Exception as e:
        reply = f"Model error: {str(e)}"

    try:
        supabase.table("ai_support").insert({
            "user_msg": message.text,
            "bot_reply": reply
        }).execute()
    except Exception as e:
        return {"reply": reply, "supabase_error": str(e)}

    try:
        card = trello.create_trello_card(
            title=message.text[:100],
            description=f"User: {message.text}\n\nBot: {reply}"
        )
        return {"reply": reply, "trello_card": card}
    except Exception as e:
        return {"reply": reply, "trello_error": str(e)}