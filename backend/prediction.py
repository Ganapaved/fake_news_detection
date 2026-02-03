import torch
import shap
import numpy as np
from PIL import Image
from transformers import AutoTokenizer
from torchvision import transforms
from serpapi import GoogleSearch
from dotenv import load_dotenv
import os
from model import FakeNewsModel,VITAttentionrollout,GradCAMViT
import cv2
import google.generativeai as genai
import base64
import json
load_dotenv()

MODEL_PATH  = 'model_multimodal/best_model.pth'
TEXT_MODEL = "google/muril-base-cased"
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
genai.configure(api_key=os.getenv('gemini_api_key2'))



SERP_API_KEY =os.getenv('SERP_API_KEY')

CLAIM_TYPES = [
    "politics","crime","sports","business","health",
    "entertainment","international","social issues",
    "science","education","technology","religion","unknown"
]

CLAIM_LABELS = [
    'politics',
    'government policy',
    'elections'
    'crime',
    'sports',
    'business',
    'health',
    'entertainment',
    'technology',
    'international',
    'social issues',
]

ID2CLAIM = {i:c for i,c in enumerate(CLAIM_TYPES)}



img_transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485,0.456,0.406],
        std=[0.229,0.224,0.225]
    )
])


def serp_check(query):
    try:
        params ={
            'q':query,
            "engine" : 'google',
            'api_key':SERP_API_KEY,
            "num":5
        }

        search = GoogleSearch(params)
        results = search.get_dict()

        snippets = []
        for r in results.get('organic_results',[]):
            snippets.append({
                'title':r.get('title',''),
                'snippet':r.get('snippet',''),
                'link':r.get('link','')
            })
        return snippets[:3]
    except Exception as e:
        snippets =[]
        snippets.append({
            'title':'',
            'snippet':'',
            'link':''
        })
        return snippets
def prepare_shap_for_frontend(shap_insights,title,tokenizer,values):
    try:
        token_ids = tokenizer.encode(title,add_special_tokens = True)
        token_words = tokenizer.convert_ids_to_tokens(token_ids)

        highlighted_segments = []
        min_len = min(len(values),len(token_words))

        current_word = ''
        current_impact = 0

        for i in range(min_len):
            token = token_words[i]
            impact =float(values[i])

            if token in ['[CLS]', '[SEP]', '[PAD]']:
                continue
            if token.startswith('##'):
                # Continuation of previous word
                current_word += token.replace('##', '')
                current_impact += impact
            else:
                if current_word and abs(current_impact) > 1e-8:
                    highlighted_segments.append({
                        'text': current_word,
                        'impact': current_impact,
                        'color_intensity': min(abs(current_impact) * 10, 1.0),
                        'type': 'fake' if current_impact > 0 else 'real'
                    })
                current_word = token
                current_impact = impact
        
        if current_word and abs(current_impact) > 1e-8:
            highlighted_segments.append({
                'text': current_word,
                'impact': current_impact,
                'color_intensity': min(abs(current_impact) * 10, 1.0),
                'type': 'fake' if current_impact > 0 else 'real'
            })

        frontend_data = {
            'highlighted_text': highlighted_segments,
            'token_count': len([t for t in token_words if t not in ['[CLS]', '[SEP]', '[PAD]']])
            
        }
        return frontend_data
    
    except Exception as e:
        print(f"Frontend prep error: {e}")
        return {
            'highlighted_text': [],
            'token_count': 0,
            'overall_sentiment': 'neutral'
        }
    

def extract_shap_insights(shap_values,title,tokenizer,top_n=5):
    try:
        values = shap_values.values
        data = shap_values.data

        print(f"\nDEBUG SHAP:")
        print(f"Values shape: {values.shape if hasattr(values, 'shape') else type(values)}")
        print(f"Data shape: {data.shape if hasattr(data, 'shape') else type(data)}")

        tokens = tokenizer.tokenize(title)
        token_ids = tokenizer.encode(title,add_special_tokens = True)
        token_words = tokenizer.convert_ids_to_tokens(token_ids)

        insights = {
            'important_words' : [],
            'positive_contributors':[],
            'negative_contributors':[],
            'all_tokens': []
        }

        if len(values) == 0 or len(token_words) == 0:
            print("Warning: No SHAP values or tokens found")
            return insights
        
        min_len = min(len(values),len(token_words))

        token_impacts= []
        for i in range(min_len):
            token = token_words[i]
            impact = float(values[i])

            if token not in ['[CLS]', '[SEP]', '[PAD]'] and abs(impact) > 1e-8:
                token_impacts.append({
                    'token': token,
                    'impact': impact,
                    'abs_impact': abs(impact),
                    'position' : i
                })

        token_impacts.sort(key=lambda x:x['abs_impact'],reverse=True)

        top_tokens = token_impacts[:top_n]

        for token_info in top_tokens:
            token = token_info['token']
            impact = token_info['impact']

            clean_token = token.replace('##', '')

            insights['important_words'].append({
                'word':clean_token,
                "impact":impact
            })

            insights['all_tokens'].append(token_info)

            if impact  > 0:
                insights['positive_contributors'].append(clean_token)
            else:
                insights['negative_contributors'].append(clean_token)
        print(insights)

        reconstructed_words =[]
        current_word = ''
        current_impact = 0
        for token_info in top_tokens:
            token = token_info['token']
            impact = token_info['impact']

            if token.startswith('##'):
                current_word +=token.replace('##','')
                current_impact +=impact
            else:
                if current_word:
                    reconstructed_words.append({
                        'word':current_word,
                        'impact':current_impact
                    })
                current_word = token
                current_impact = impact
        
        if current_word:
            reconstructed_words.append({
                'word':current_word,
                'impact':current_impact
            })
        
        insights['reconstructed_words'] = reconstructed_words
        frontend_data = prepare_shap_for_frontend(insights, title, tokenizer, values)
        insights['frontend_display'] = frontend_data

        return insights
    
    except Exception as e:
        print(f"SHAP extraction error: {e}")
        return {
            'important_words': [],
            'positive_contributors': [],
            'negative_contributors': [],
            'frontend_display': {
                'highlighted_text': [],
                'token_count': 0
            }
        }

def encode_image_to_base64(image_path):
    with open(image_path,'rb') as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')
    
def create_comprehenseive_prompt(evidence):

    important_words_str = ""
    if evidence['shap_insights']['important_words']:
        for word_info in evidence['shap_insights']['important_words'][:5]:
            word = word_info['word']
            impact = word_info['impact']
            direction = "FAKE" if impact > 0 else "REAL"
            important_words_str += f"  - '{word}' (impact: {abs(impact):.4f}, suggests {direction})\n"
    else:
        important_words_str = "  - No significant terms identified\n"
    
    positive_words = ', '.join(evidence['shap_insights']['positive_contributors'][:5]) if evidence['shap_insights']['positive_contributors'] else 'None identified'
    negative_words = ', '.join(evidence['shap_insights']['negative_contributors'][:5]) if evidence['shap_insights']['negative_contributors'] else 'None identified'

    prompt = f"""You are an expert fact-checker and misinformation analyst. Analyze this news article for authenticity using the provided evidence.

        ## NEWS ARTICLE DETAILS
        **Title:** {evidence['title']}
        **Language:** Kannada (Indian language)

        ## MODEL PREDICTION
        - **Classification:** {evidence['prediction']} ({evidence['confidence']:.1%} confidence)
        - **Claim Category:** {evidence['claim_type']}

        ## TEXT ANALYSIS (SHAP Values)
        The following words/phrases had the strongest influence on the model's decision:

        **Words indicating FAKE:**
        {positive_words}

        **Words indicating REAL:**
        {negative_words}

        **Most impactful terms:**
        {important_words_str}
        ## IMAGE ANALYSIS (Grad-CAM)
        - **Attention Score:** {evidence['image_analysis']['attention_score']:.3f}
        - **Max Attention:** {evidence['image_analysis']['max_attention']:.3f}
        - **Interpretation:** {evidence['image_analysis']['interpretation']}

        The heatmap visualization shows which regions of the image the AI model focused on when making its decision.

        ## WEB VERIFICATION
        """
            
    if evidence['web_sources']:
        prompt += "Related sources found online:\n"
        for i, source in enumerate(evidence['web_sources'], 1):
            prompt += f"\n{i}. **{source['title']}**\n"
            prompt += f"   Snippet: {source['snippet']}\n"
            prompt += f"   URL: {source['link']}\n"
    else:
        prompt += "No verification sources found or API unavailable.\n"
    
    prompt += """

        ## YOUR TASK
        Provide a comprehensive, well-structured explanation in the following format:

        ### 1. EXECUTIVE SUMMARY
        - State whether the content is likely FAKE or REAL
        - Provide a confidence level (Low/Medium/High)
        - Give one-sentence key finding

        ### 2. DETAILED ANALYSIS

        **A. Text Content Analysis:**
        - What specific words or phrases suggest manipulation?
        - Are there linguistic red flags (sensationalism, emotional language, etc.)?
        - How do the key terms identified by SHAP contribute to the verdict?

        **B. Visual Evidence Analysis:**
        - What does the image attention pattern reveal?
        - Are there signs of image manipulation or context mismatch?
        - Does the image support or contradict the text claim?

        **C. External Verification:**
        - What do the web sources say about this claim?
        - Are there credible sources confirming or debunking this?
        - Is there a consensus among sources?

        ### 3. RED FLAGS IDENTIFIED
        List specific warning signs found (if any):
        - [ ] Sensational language
        - [ ] Lack of credible sources
        - [ ] Image-text mismatch
        - [ ] Contradicted by web sources
        - [ ] Other: (specify)

        ### 4. FINAL VERDICT
        Provide a clear conclusion with:
        - Overall authenticity assessment
        - Confidence level (0-100%)
        - Key reasoning points
        - Recommended actions (share/verify/report)

        ### 5. FACT-CHECKER'S NOTE
        Any important caveats, limitations, or additional context that readers should know.

        ---

        Please provide a thorough, evidence-based analysis that helps users understand why this content is classified as {evidence['prediction']}.
        """
    return prompt

def generate_explanation_with_gemini(evidence):

    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = create_comprehenseive_prompt(evidence)

    images_content = []
    # if os.path.exists(evidence['image_path']):
    #         original_img = Image.open(evidence['image_path'])
    #         images_content.append(original_img)
        
        # Add heatmap visualization
    if os.path.exists(evidence['image_analysis']['file']):
        heatmap_img = Image.open(evidence['image_analysis']['file'])
        images_content.append(heatmap_img)
    
    # Generate response with images
    if images_content:
        response = model.generate_content([prompt] + images_content)
    else:
        response = model.generate_content(prompt)
    return response.text

def classify_claim(title,classifier):
    if not isinstance(title, str) or len(title.strip()) < 3:
        return "unknown"
    try:
        result = classifier(
            title,
            CLAIM_LABELS,
            hypothesis_template="ಈ ಸುದ್ದಿ {} ಕುರಿತು ಇದೆ."
        )
        return result["labels"][0]
    except Exception as e:
        print(e)
        return "unknown"


def analyze(title,image_path,model,tokenizer,classifier):

    def text_predict(texts):
        cleaned_text =[]
        for t in texts:
            if isinstance(t,(list,tuple,np.ndarray)):
                cleaned_text.append(' '.join(map(str,t)))
            else:
                cleaned_text.append(str(t))
        enc = tokenizer(
            cleaned_text,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors='pt'
        ).to(DEVICE)
    
   

        dummy_img = torch.zeros(len(cleaned_text), 3, 224, 224).to(DEVICE)

        with torch.no_grad():
            fake_out, _ = model(
                enc['input_ids'],
                enc['attention_mask'],
                dummy_img
            )

        return fake_out.cpu().numpy()
    
    def vit_explain(image_path, attention_map, output_path='explanation.jpg', alpha=0.4, colormap=cv2.COLORMAP_JET):
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not load image from {image_path}")
        img = cv2.resize(img, (224, 224))
        
        # Resize attention map to match image
        heatmap = cv2.resize(attention_map, (224, 224))
        
        # Normalize to 0-255
        heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)
        heatmap = np.uint8(255 * heatmap)
        
        # Apply colormap
        heatmap_color = cv2.applyColorMap(heatmap, colormap)
        
        # Blend with original image
        overlay = cv2.addWeighted(img, 1-alpha, heatmap_color, alpha, 0)
        
        cv2.imwrite(output_path, overlay)
        
        return {
            "attention_score": float(attention_map.mean()),
            "max_attention": float(attention_map.max()),
            "std_attention": float(attention_map.std()),
            "file": output_path
        }
    

    
    def vit_explain_improved(image_tensor, image_path, model, method='gradcam'):
        vit = model.image_model
        vit.eval()
        
        if method == 'gradcam':
            print("Using Grad-CAM (input gradient method)...")
            explainer = GradCAMViT(vit)
            attention_map = explainer.generate_cam(image_tensor)
            output_file = f'{image_path}_gradcam_explanation.jpg'
            
        elif method == 'rollout':
            print("Using Attention Rollout...")
            
            # PyTorch MultiheadAttention needs special handling
            # We need to enable attention weights output
            original_need_weights = []
            for name, module in vit.named_modules():
                if isinstance(module, torch.nn.MultiheadAttention):
                    # Store original setting
                    original_need_weights.append(module.need_weights)
                    # Enable attention weight output
                    module.need_weights = True
            
            try:
                explainer = VITAttentionrollout(vit)
                attention_map = explainer.rollout(image_tensor)
                output_file = 'rollout_explanation.jpg'
            finally:
                # Restore original settings
                idx = 0
                for name, module in vit.named_modules():
                    if isinstance(module, torch.nn.MultiheadAttention):
                        module.need_weights = original_need_weights[idx]
                        idx += 1
        
        else:
            raise ValueError(f"Unknown method: {method}")
        
        # Create visualization
        result = vit_explain(image_path, attention_map, output_file)
        
        # Interpret the results
        score = result["attention_score"]
        max_attn = result["max_attention"]
        std_attn = result["std_attention"]

        if max_attn > 0.8 and std_attn > 0.15:
            interpretation = "Model strongly focuses on specific suspicious regions"
        elif max_attn > 0.7:
            interpretation = "Model identifies key regions with high confidence"
        elif std_attn > 0.12:
            interpretation = "Model attention concentrated on multiple areas"
        elif score > 0.4:
            interpretation = "Model moderately focuses on distributed features"
        else:
            interpretation = "Model attention broadly distributed (contextual)"
        
        result["interpretation"] = interpretation
        result['method'] = method
        return result

    img = Image.open(image_path).convert('RGB')
    img_tensor = img_transform(img).unsqueeze(0).to(DEVICE)

    enc = tokenizer(
        title,
        truncation=True,
        max_length = 128,
        return_tensors = 'pt'
    ).to(DEVICE)

    with torch.no_grad():
        fake_out,claim_out = model(
            enc['input_ids'],
            enc['attention_mask'],
            img_tensor
        )

    fake_prob = fake_out.item()
    fake_label = 'FAKE' if fake_prob > 0.5 else 'REAL'
    print("Title:", title)
    print("Fake Probability:", round(fake_prob,3))
    print("Prediction:", fake_label)

    claim_type = classify_claim(title,classifier)

    print("\n===== MODEL OUTPUT =====")
    print("Title:", title)
    print("Fake Probability:", round(fake_prob,3))
    print("Prediction:", fake_label)
    print("Claim Type:", claim_type)

    masker = shap.maskers.Text(tokenizer)
    explainer = shap.Explainer(text_predict,masker)
    shap_values = explainer([title])

    
        
    shap_insights = extract_shap_insights(shap_values[0], title,tokenizer)

    
    image_analysis = vit_explain_improved(img_tensor, image_path, model)
    print(f"Attention Score: {image_analysis['attention_score']:.3f}")
    print(f"Interpretation: {image_analysis['interpretation']}")
    print(f"Saved to: {image_analysis['file']}")
    print(image_analysis)


    print('\n===== GOOGLE CHECK ======')
    web_sources = serp_check(title)
    print(f"✓ Found {len(web_sources)} related sources")

    evidence = {
        'title': title,
        'image_path': image_path,
        'prediction': fake_label,
        'confidence': fake_prob if fake_label == 'FAKE' else (1 - fake_prob),
        'claim_type': claim_type,
        'shap_insights': shap_insights,
        'image_analysis': image_analysis,
        'web_sources': web_sources
    }

    print("\n===== MODEL OUTPUT =====")
    print("Title:", title)
    print("Fake Probability:", round(fake_prob,3))
    print("Prediction:", fake_label)
    print("Claim Type:", claim_type)

    return evidence

def main():
    model = FakeNewsModel(num_claims=len(CLAIM_TYPES))
    model.load_state_dict(torch.load(MODEL_PATH,map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    tokenizer =AutoTokenizer.from_pretrained(TEXT_MODEL)

    title = 'ರಾಹುಲ್ ಗಾಂಧಿ ಪ್ರಭು ಶ್ರೀರಾಮನಿದ್ದಂತೆ: ಶೋಷಿತರಿಗೆ ನ್ಯಾಯ ಒದಗಿಸುತ್ತಿದ್ದಾರೆ - ನಾನಾ ಪಟೋಲೆ'
    image_path = 'test_putin.jpg'
    evidence = analyze(title, image_path,model,tokenizer)
    print(evidence)
    # response = generate_explanation_with_gemini(evidence=evidence)
    # print('response:\n',response)
    
if __name__ == "__main__":
    main()