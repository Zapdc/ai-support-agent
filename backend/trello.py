import requests
import os

def create_trello_card(title: str, description: str = ""):  
    TRELLO_API_KEY = os.getenv("TRELLO_API_KEY")
    TRELLO_TOKEN = os.getenv("TRELLO_TOKEN")
    TRELLO_LIST_ID = os.getenv("TRELLO_LIST_ID")  # the list where cards should be created
    url = "https://api.trello.com/1/cards"
    query = {
        "idList": TRELLO_LIST_ID,
        "key": TRELLO_API_KEY,
        "token": TRELLO_TOKEN,
        "name": title,           # card title
        "desc": description      # card description
    }
    response = requests.post(url, params=query)
    if response.status_code != 200:
        raise Exception(f"Trello error: {response.text}")
    return response.json()
