
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('gemini_api_key2')
genai.configure(api_key=api_key)

try:
    with open('log.txt', 'w', encoding='utf-8') as f:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
    print("Done")
except Exception as e:
    print(f"Error: {e}")
