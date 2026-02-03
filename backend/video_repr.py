import whisper
import json
import requests
from pydub import AudioSegment
from moviepy import VideoFileClip
import os
from dotenv import load_dotenv
load_dotenv()
file_name = 'result_video.json'

def create_json(result):
    with open(file_name,'w',encoding='utf-8') as f:
        json.dump(result,f,indent=4,ensure_ascii=False)
    print(f"✅ Data saved to {file_name}")

def open_json():
    with open(file_name,'r',encoding='utf-8') as f:
        loaded_data = json.load(f)
    return loaded_data

def get_transcript(video_path):
    print('transcribing....')
    try:
        api_key = os.getenv('sarvam_api_key')
        video = VideoFileClip(video_path)
        audio_path = 'temp_audio.wav'
        video.audio.write_audiofile(audio_path,logger = None)

        audio = AudioSegment.from_file('temp_audio.wav')
        
        chukn_length = 30000
        chunks = range(0,len(audio),chukn_length)

        full_transcript = []
        url = "https://api.sarvam.ai/speech-to-text"
        headers = {'api-subscription-key': api_key}

        print(f"✂️ Audio is {len(audio)/1000:.2f}s long. Splitting into {len(chunks)} parts...")

        for i ,start_time in enumerate(chunks):
            end_time = start_time + chukn_length
            chunk = audio[start_time:end_time]

            chunk_filename = f'chunk_{i}.wav'
            chunk.export(chunk_filename,format='wav')

            with open(chunk_filename,'rb') as audio_file:
                files = {'file': (chunk_filename, audio_file, 'audio/wav')}
                payload = {
                    'language_code': 'kn-IN',
                    'model': 'saarika:v2.5'
                }

                print(f"📡 Transcribing Part {i+1}...")
                response = requests.post(url, data=payload, files=files, headers=headers)

                if response.status_code == 200:
                    text = response.json().get('transcript', '')
                    full_transcript.append(text)
                else:
                    print(f"⚠️ Error in part {i+1}: {response.text}")
            os.remove(chunk_filename)
        final_text = " ".join(full_transcript)
        print("\n✅ Full Transcription Complete!")
        return final_text
    except Exception as e:
        print('error :\n',e)
        return ''
            


def wait_until_active(file):
    while file.state.name != "ACTIVE":
        print("⏳ Waiting for video to become ACTIVE...")
        time.sleep(1)
        file = genai.get_file(file.name)
    return file


import google.generativeai as genai
import json
import hashlib
import time
from pathlib import Path
from datetime import datetime,timedelta
from typing import Dict,List,Optional
from dotenv import load_dotenv


genai.configure(api_key = os.getenv('gemini_api_key'))

class VideoVerifier:
    def __init__(self,model_name = 'gemini-2.5-flash'):
        self.model = genai.GenerativeModel(model_name)
        self.cache = {}
        
    def _cache_key(self,video_path, transcript):
        return hashlib.md5(f'{video_path}{transcript}'.encode()).hexdigest()
    
    def _exrtact_json(self,text):
        start = text.find('{')
        end = text.rfind('}') + 1
        return json.loads(text[start:end])
    
    def verify(self,video_path,transcript):
        print('\n' + '=' * 60)
        print('VIDEO VERIFICATION')

        key = self._cache_key(video_path,transcript)
        if key in self.cache:
            print("✓ Using cached result")
            return self.cache[key]
        
        print('[1/2] Generating questions....')
        questions = None
        video = None
        try:
            questions,video = self._generate_questions(video_path,transcript)
            
            questions = [q["questions"] if isinstance(q, dict) else q for q in questions]
            questions  = list(dict.fromkeys(questions))

            print('questions :\n',questions)
        except Exception as e:
            print(e)
            questions =["SKEPTIC", "DEFENDER", "NEUTRAL"]

        print("[2/2] Analyzing and generating verdict...")
        anlyze_result = self._analyze(video,transcript,questions)

        result = {
            'questions' : questions,
            'analysis' : anlyze_result
        }
        
        
        self.cache[key] = result
        

        return result

    def _generate_questions(self,video_path,transcript):
        promot = f"""
                You are a comprehensive fact-checker analyzing a video for authenticity.

                transcript : {transcript}
                if transcript is null or empty dont take its consideration for the question generation

                Generate verification questions from THREE perspectives:

                1. SKEPTIC (5 critical questions looking for manipulation signs):
                - Visual inconsistencies, deepfake indicators
                - Audio-visual mismatches
                - Sensationalized or unverifiable claims
                - Source credibility issues

                2. DEFENDER (5 questions looking for authenticity markers):
                - Consistency indicators (lighting, physics, behavior)
                - Verifiable details (locations, dates, names)
                - Production quality of legitimate news
                - Context supporting authenticity

                3. NEUTRAL (5 objective factual questions):
                - Specific claims that can be fact-checked
                - Identifiable people, places, organizations
                - Timeline and sequence verification
                - Statistical or numerical claims

                RULES (MANDATORY):
                1. Output MUST be valid JSON (no markdown, no backticks).
                2. Output MUST contain ONLY ONE top-level key: "questions".
                3. "questions" MUST be a LIST of STRINGS.
                4. Each string MUST start with its perspective label:
                - "SKEPTIC:"
                - "DEFENDER:"
                - "NEUTRAL:"
                5. Generate EXACTLY:
                - 5 SKEPTIC questions
                - 5 DEFENDER questions
                - 5 NEUTRAL questions
                6. DO NOT nest objects.
                7. DO NOT include perspective as a separate field.
                8. DO NOT include explanations or extra text.
                9. DO NOT repeat questions.

                OUTPUT FORMAT (EXACT EXAMPLE):

                {{
                "questions": [
                    "SKEPTIC: question text here",
                    "SKEPTIC: question text here",
                    "DEFENDER: question text here",
                    "NEUTRAL: question text here"
                ]
                }}
            """
        try:
            video = genai.upload_file(video_path)
            video = wait_until_active(video)
            response = self.model.generate_content([promot,video])
            print(f"Reponse questions:\n {response.text}")
            data = self._exrtact_json(response.text)
            return data['questions'] , video
        except Exception as e:
            print('question generation error;\n',e)
            question = open_json()
            return question['questions'] , None
    

    def _analyze(self,video,transcript,questions):
        q_text = '\n'.join(f"{i+1}.{q}" for i , q in enumerate(questions))

        prompt = f"""
                You are analyzing a video for authenticity and fake news detection.

                transcript : {transcript}
                if transcript is null or empty dont take its consideration for the answer generation

                VERIFICATION QUESTIONS:
                {q_text}

                Provide a comprehensive analysis in JSON format with:

                1. Answer each question with evidence
                2. Identify contradictions between answers
                3. Provide final verdict

                Return only json:
                {{
                    'answers' : [
                        {{
                            "question": "...",
                            "answer": "...",#detailed
                            "confidence": 0-100,
                            "supports_fake": true/false
                        }}
                    ],
                    'verdict':{{
                        "classification": "FAKE | REAL | UNCERTAIN",
                        "confidence": 0-100,
                        "key_reasons": ["..."],
                        "recommendation": "..."
                    }}

                }}
                Be thorough but concise. Focus on evidence-based analysis.
            """
        # video = genai.upload_file(video_path)
        # video = wait_until_active(video)
        try:
            response = self.model.generate_content([prompt,video])
            print('Response :\n ',response)
            result_text = self._exrtact_json(response.text)
            print('response after extract json :\n',result_text)
            return (result_text)
        except Exception as e:
            print('Analysis error:\n',e)
            load = open_json()
            return load['analysis']
            
    

    def _print_summary(self, result):
        v = result["verdict"]
        print("\nRESULT")
        print(f"Verdict      : {v['classification']}")
        print(f"Confidence   : {v['confidence']}%")
        print(f"Recommendation: {v['recommendation']}")
        print("=" * 60)
        
if __name__ == "__main__":

    verifier = VideoVerifier()
    transcript = get_transcript('DEMO Video.mp4')
    result = verifier.verify(
        video_path="DEMO Video.mp4",
        transcript=transcript
    )

    print(result)

