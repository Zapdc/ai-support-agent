
# USE_HF_API = False  # True = Hugging Face Inference API, False = Local model

# import os
# from fastapi import FastAPI
# from pydantic import BaseModel
# from supabase import create_client
# from transformers import AutoTokenizer, AutoModelForCausalLM
# import torch
# from dotenv import load_dotenv
# from fastapi.middleware.cors import CORSMiddleware
# from huggingface_hub import InferenceClient
# import trello

# load_dotenv()
# app = FastAPI()

# origins = ["http://localhost:3000"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Supabase setup
# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# HF_TOKEN = os.getenv("HF_TOKEN")  # keep naming consistent

# # Models
# LOCAL_MODEL_PATH = "stabilityai/stablecode-instruct-alpha-3b"
# HF_MODEL_PATH = "HuggingFaceTB/SmolLM3-3B"

# # Hugging Face Inference client
# hf_client = None
# if USE_HF_API:
#     hf_client = InferenceClient(
#         provider="hf-inference",
#         api_key=HF_TOKEN,
#     )
# else:
#     tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_PATH, token=HF_TOKEN)
#     model = AutoModelForCausalLM.from_pretrained(
#         LOCAL_MODEL_PATH,
#         trust_remote_code=True,
#         torch_dtype="auto"
#     )
#     model.cuda()  # move model to GPU


# class Message(BaseModel):
#     text: str


# def query_hf_api(prompt: str) -> str:
#     try:
#         completion = hf_client.chat.completions.create(
#             model=HF_MODEL_PATH,
#             messages=[
#                 {"role": "user", "content": prompt}
#             ],
#         )
#         return completion.choices[0].message["content"].strip()
#     except Exception as e:
#         return f"HF API error: {str(e)}"


# @app.get("/")
# def root():
#     return {"status": "Server is running"}

# def clean_reply(text: str) -> str:
#     """Remove hidden reasoning traces and extra whitespace."""
#     if not text:
#         return "I couldn’t generate a response."

#     # Strip out <think>...</think> blocks
#     import re
#     text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)

#     # Collapse extra whitespace/newlines
#     lines = [line.strip() for line in text.splitlines() if line.strip()]
#     return " ".join(lines).strip()


# @app.post("/chat")
# def chat(message: Message):
#     try:
#         if USE_HF_API:
#             raw_reply = query_hf_api(message.text)
#         else:
#             inputs = tokenizer(
#                 f"###Instruction:\n{message.text}\n###Response:\n",
#                 return_tensors="pt"
#             ).to("cuda")

#             if "token_type_ids" in inputs:
#                 del inputs["token_type_ids"]

#             tokens = model.generate(
#                 **inputs,
#                 max_new_tokens=200,
#                 temperature=0.2,
#                 do_sample=True
#             )
#             raw_reply = tokenizer.decode(tokens[0], skip_special_tokens=True)
#             raw_reply = raw_reply.split("###Response:")[-1]
#             if "###Instruction:" in raw_reply:
#                 raw_reply = raw_reply.split("###Instruction:")[0]

#         # ✅ clean no matter what
#         reply = clean_reply(raw_reply)

#     except Exception as e:
#         reply = f"Model error: {str(e)}"

#     try:
#         supabase.table("ai_support").insert({
#             "user_msg": message.text,
#             "bot_reply": reply
#         }).execute()
#     except Exception as e:
#         return {"reply": reply, "supabase_error": str(e)}
    
#     # after saving to supabase
#     try:
#         card = trello.create_trello_card(
#             title=message.text[:100],  # first 100 chars of user msg
#             description=f"User: {message.text}\n\nBot: {reply}"
#         )
#         return {"reply": reply, "trello_card": card}
#     except Exception as e:
#         return {"reply": reply, "trello_error": str(e)}


#     return {"reply": reply}


