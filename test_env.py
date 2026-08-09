import os
from dotenv import load_dotenv

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

if groq_api_key:
    print("✅ GROQ_API_KEY loaded successfully!")
else:
    print("❌ GROQ_API_KEY was not found.")