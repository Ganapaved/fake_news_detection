from fastapi import FastAPI , UploadFile,File,Form,HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
import torch
from transformers import AutoTokenizer , AutoModelForSequenceClassification,pipeline
from pydantic import BaseModel

from model import FakeNewsModel
from prediction import (
    analyze,
    generate_explanation_with_gemini,
    CLAIM_TYPES,
    MODEL_PATH,
    TEXT_MODEL,
    DEVICE
)

MODEL_NAME ="joeddav/xlm-roberta-large-xnli"

app = FastAPI(title='Fake News Detection')


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = 'uploads'
os.makedirs(UPLOAD_DIR,exist_ok=True)

@app.on_event('startup')
def load_model():
    global model , tokenizer ,  classifier

    model = FakeNewsModel(num_claims=len(CLAIM_TYPES))
    model.load_state_dict(torch.load(MODEL_PATH,map_location=DEVICE))
    model.to(DEVICE)
    model.eval()

    tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL)

    tokenizer2 = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        use_fast = False
    )

    model2 = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME
    )

    classifier = pipeline(
    "zero-shot-classification",
    model=model2,
    tokenizer=tokenizer2
    )

    print("✅ Model & tokenizer loaded")

@app.get('/')
def home():
    return {'message':'server is running'}



@app.post('/analyze')
async def news_analyse(
    title :str = Form(...),
    image : UploadFile = File(...)
):
    try:
        image_path = os.path.join(UPLOAD_DIR,image.filename)
        with open(image_path,'wb') as buffer:
            shutil.copyfileobj(image.file,buffer)
        
        evidence = analyze(
            title=title,
            image_path=image_path,
            model=model,
            tokenizer=tokenizer,
            classifier = classifier
        )

        return JSONResponse(content=evidence)
    
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500,detail=str(e))
    

class EvidenceRequest(BaseModel):
    evidence :dict

@app.post('/ai_summrise')
def ai_summarise(data:EvidenceRequest):
    try:
        explanation = generate_explanation_with_gemini(
            evidence=data.evidence
        )

        return {
            'summary':explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    
app.mount('/uploads' , StaticFiles(directory = 'uploads'),name = 'uploads')
    
    
    
    