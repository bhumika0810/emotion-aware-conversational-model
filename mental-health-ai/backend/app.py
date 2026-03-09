import torch
import torch.nn.functional as F
from openai import OpenAI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import json

# Import your database tools
from database import SessionLocal, engine
from models import Base, Chat

# 1. SETUP OLLAMA (Local AI)
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)

app = FastAPI()

# Enable CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# 2. LOAD SENTIMENT MODEL (DistilBERT)
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
model_path = "model/depression_model"
tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)
model = DistilBertForSequenceClassification.from_pretrained(model_path)
model.to(device)
model.eval()

# 3. DATA MODELS
class TextInput(BaseModel):
    text: str

class TATScene(BaseModel):
    theme: str
    story: str

class TATRequest(BaseModel):
    scenes: List[TATScene]

# 4. HELPER FUNCTIONS
def generate_support_response(user_message, severity, history):
    try:
        messages = [
            {
                "content": f"""
                You are a supportive AI mental wellness companion.

                IMPORTANT RULES:

                1. If the user message is positive or neutral, respond normally and encourage wellbeing.
                2. Only mention crisis hotlines or suicide prevention if the user explicitly talks about:
                   - suicide
                   - self harm
                   - wanting to die
                   - killing themselves

                Do NOT show crisis resources for normal or positive messages.

                Detected severity: {severity}
                """
            }
        ]

        for chat in history:
            messages.append({"role": "user",      "content": chat.user_message})
            messages.append({"role": "assistant",  "content": chat.ai_response})

        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="llama3.2:1b",
            messages=messages,
            temperature=0.7
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"Ollama Error: {e}")
        return "I'm listening. Can you tell me more about that?"


def analyze_tat_stories(scenes: List[TATScene]) -> dict:
    """Send TAT stories to Ollama and get back a structured JSON analysis."""

    story_summary = "\n\n".join(
        f'Scene {i+1} (Theme: "{s.theme}"):\n"{s.story}"'
        for i, s in enumerate(scenes)
    )

    system_prompt = """You are a clinical psychologist trained in the Thematic Apperception Test (TAT).
Analyze the stories and produce a structured psychological profile.
You MUST respond with ONLY valid JSON — no markdown, no backticks, no explanation before or after.
Use exactly this structure:
{
  "summary": "2-3 warm, non-judgmental paragraph narrative summary",
  "headline": "One insightful sentence capturing this person's inner world",
  "emotionalTone": { "Positive": 30, "Neutral": 25, "Reflective": 30, "Tense": 15 },
  "traits": [
    { "name": "Introversion",     "score": 65, "color": "#6366f1" },
    { "name": "Anxiety Level",    "score": 45, "color": "#f59e0b" },
    { "name": "Optimism",         "score": 55, "color": "#10b981" },
    { "name": "Empathy",          "score": 70, "color": "#ec4899" },
    { "name": "Need for Control", "score": 40, "color": "#8b5cf6" },
    { "name": "Resilience",       "score": 60, "color": "#0ea5e9" }
  ],
  "themes": [
    { "name": "Theme name", "icon": "🌊", "color": "#6366f1", "description": "Brief description" }
  ],
  "growthAreas": [
    { "area": "Area name", "icon": "🌱", "suggestion": "Warm, specific, actionable suggestion" }
  ]
}
Rules:
- emotionalTone values MUST sum to exactly 100
- Include 3 to 5 themes
- Include 3 to 4 growthAreas
- Be insightful but never pathologizing or harsh
- Return ONLY the JSON object, nothing else"""

    user_prompt = f"Analyze these {len(scenes)} TAT stories and return the JSON profile:\n\n{story_summary}"

    response = client.chat.completions.create(
        model="llama3.2:1b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.4,   # lower = more consistent JSON output
    )

    raw = response.choices[0].message.content.strip()

    # Strip any accidental markdown fences
    clean = raw.replace("```json", "").replace("```", "").strip()

    # Find the JSON object in case there's stray text
    start = clean.find("{")
    end   = clean.rfind("}") + 1
    if start != -1 and end > start:
        clean = clean[start:end]

    return json.loads(clean)


# 5. API ENDPOINTS

@app.post("/predict")
def predict(input_data: TextInput):
    # A. Run DistilBERT for Score
    inputs = tokenizer(input_data.text, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = F.softmax(outputs.logits, dim=1)
    risk_score = probabilities[0][1].item()
    # Reduce false positives for clearly positive sentences
    positive_keywords = [
    "i feel good", "i am happy", "feeling great", "i feel great",
    "i am okay", "i feel okay", "feeling relaxed", "i feel relaxed",
    "feeling better", "i feel better", "i am fine", "feeling fine",
    "i am well", "feeling calm", "i feel calm", "i feel peaceful",
    "good today", "happy today", "doing well", "feeling positive"
    ]

    user_text = input_data.text.lower()

    if any(kw in user_text for kw in positive_keywords):
        risk_score = risk_score * 0.3
    
    crisis_keywords = [
    "kill myself",
    "want to die",
    "suicide",
    "end my life",
    "i dont want to live",
    "i want to die",
    "i feel hopeless"
    ]

    user_text = input_data.text.lower()
    is_crisis = any(word in user_text for word in crisis_keywords)

    if is_crisis:
        severity = "High"
    elif risk_score > 0.85:
        severity = "High"
    elif risk_score > 0.6:
        severity = "Moderate"
    else:
        severity = "Low"

    if risk_score > 0.85:
        mood = "Awful"
    elif risk_score > 0.65:
        mood = "Bad"
    elif risk_score > 0.45:
        mood = "Okay"
    elif risk_score > 0.25:
        mood = "Good"
    else:
        mood = "Great"

    print("Model probabilities:", probabilities)
    print("Risk score:", risk_score)

    # C. Fetch History
    db = SessionLocal()
    history = db.query(Chat).order_by(Chat.id.desc()).limit(5).all()
    history.reverse()

    # D. Get Local AI Response
    support_message = generate_support_response(input_data.text, severity, history)

    # E. Save and Return
    new_chat = Chat(user_message=input_data.text, ai_response=support_message, severity=severity)
    db.add(new_chat)
    db.commit()
    db.close()

    display_score = round((1 - risk_score) * 5, 2)

    return {
    "risk_score": display_score,
    "severity": severity,
    "mood": mood,
    "support_message": support_message,
    "is_crisis": is_crisis
    }


@app.post("/tat-analyze")
def tat_analyze(req: TATRequest):
    """
    Receives TAT scene stories from the React frontend,
    sends them to local Ollama for analysis,
    and returns a structured psychological profile.
    """
    try:
        result = analyze_tat_stories(req.scenes)
        return result
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        # Return a safe fallback so the frontend doesn't crash
        return {
            "summary": "We couldn't fully analyze your stories this time. Please try again.",
            "headline": "Your stories show depth and thoughtfulness.",
            "emotionalTone": {"Positive": 25, "Neutral": 25, "Reflective": 25, "Tense": 25},
            "traits": [
                {"name": "Introversion",     "score": 50, "color": "#6366f1"},
                {"name": "Anxiety Level",    "score": 50, "color": "#f59e0b"},
                {"name": "Optimism",         "score": 50, "color": "#10b981"},
                {"name": "Empathy",          "score": 50, "color": "#ec4899"},
                {"name": "Need for Control", "score": 50, "color": "#8b5cf6"},
                {"name": "Resilience",       "score": 50, "color": "#0ea5e9"},
            ],
            "themes": [
                {"name": "Self-reflection", "icon": "🪞", "color": "#6366f1", "description": "You tend to look inward."}
            ],
            "growthAreas": [
                {"area": "Self-compassion", "icon": "🌱", "suggestion": "Be as kind to yourself as you would be to a close friend."}
            ],
        }
    except Exception as e:
        print(f"TAT analysis error: {e}")
        raise
