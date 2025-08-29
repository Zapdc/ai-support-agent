from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

TRELLO_API_KEY = os.getenv("TRELLO_API_KEY")
TRELLO_TOKEN = os.getenv("TRELLO_TOKEN")
TRELLO_LIST_ID = os.getenv("TRELLO_LIST_ID")  # list where cards should be created

print("TRELLO_API_KEY:", TRELLO_API_KEY)
print("TRELLO_TOKEN:", TRELLO_TOKEN)
print("TRELLO_LIST_ID:", TRELLO_LIST_ID)

class Card(BaseModel):
    title: str
    description: str = ""

def create_trello_card(title: str, description: str = ""):
    url = "https://api.trello.com/1/cards"
    query = {
        "idList": TRELLO_LIST_ID,
        "key": TRELLO_API_KEY,
        "token": TRELLO_TOKEN,
        "name": title,
        "desc": description
    }
    print("Sending to Trello:", query)
    response = requests.post(url, params=query)
    print("Response:", response.status_code, response.text)
    if response.status_code != 200:
        raise Exception(f"Trello error: {response.text}")
    return response.json()

@app.post("/test_trello")
def test_trello(card: Card):
    try:
        result = create_trello_card(card.title, card.description)
        return {"success": True, "card": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
