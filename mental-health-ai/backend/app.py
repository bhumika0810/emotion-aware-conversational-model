import os
import traceback
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json

# Import your database tools
from database import SessionLocal, engine
from models import Base, Chat

# 1. SETUP GEMINI
# Load the backend .env regardless of the directory used to start Uvicorn.
load_dotenv(Path(__file__).with_name(".env"))
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
GEMINI_MODEL = "gemini-3.6-flash"

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

# 2. DATA MODELS
class TextInput(BaseModel):
    text: str

class TATScene(BaseModel):
    theme: str
    story: str

class TATRequest(BaseModel):
    scenes: List[TATScene]

# Add to your Data Models section (section 3)
class ChatInput(BaseModel):
    message: str
    session_id: str = "default"    

class AnalyticsSession(BaseModel):
    timestamp: int
    user_message: str
    mood: str
    severity: str

class WeeklySummaryRequest(BaseModel):
    sessions: List[AnalyticsSession]

# 4. HELPER FUNCTIONS
def generate_gemini_response(system_instruction: str, messages: list, temperature: float) -> str:
    """Generate a response while preserving the existing conversation history."""
    try:
        contents = [
            types.Content(
                role="model" if message["role"] == "assistant" else "user",
                parts=[types.Part.from_text(text=message["content"])],
            )
            for message in messages
        ]
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=temperature,
            ),
        )
        if not response.text:
            raise ValueError("Gemini returned an empty response")
        return response.text
    except Exception as error:
        print(f"Gemini model: {GEMINI_MODEL}")
        error_response = getattr(error, "response", None)
        print(f"Gemini response: {getattr(error_response, 'text', error_response)}")
        traceback.print_exc()
        raise


POSITIVE_KEYWORDS = [
    "i feel good", "i am happy", "feeling great", "i feel great",
    "i am okay", "i feel okay", "feeling relaxed", "i feel relaxed",
    "feeling better", "i feel better", "i am fine", "feeling fine",
    "i am well", "feeling calm", "i feel calm", "i feel peaceful",
    "good today", "happy today", "doing well", "feeling positive",
]

CRISIS_KEYWORDS = [
    "kill myself", "want to die", "suicide", "end my life",
    "i dont want to live", "i want to die", "i feel hopeless",
]


def analyze_message_risk(user_message: str):
    """Use Gemini for the risk score previously produced by the local model."""
    system_prompt = """Assess the emotional risk expressed in the user's message.
Return ONLY valid JSON in this exact format: {"risk_score": 0.0}.
`risk_score` must be a number from 0.0 (positive or stable) to 1.0 (acute emotional distress).
Base the score only on the user's message; do not provide advice or extra fields."""
    try:
        raw = generate_gemini_response(
            system_prompt,
            [{"role": "user", "content": user_message}],
            temperature=0.0,
        )
        clean = raw.replace("```json", "").replace("```", "").strip()
        start, end = clean.find("{"), clean.rfind("}") + 1
        payload = json.loads(clean[start:end] if start != -1 and end > start else clean)
        risk_score = max(0.0, min(1.0, float(payload["risk_score"])))
    except Exception as error:
        print(f"Gemini prediction error: {error}")
        risk_score = 0.5

    user_text = user_message.lower()
    if any(keyword in user_text for keyword in POSITIVE_KEYWORDS):
        risk_score *= 0.3
    is_crisis = any(keyword in user_text for keyword in CRISIS_KEYWORDS)

    if is_crisis or risk_score > 0.85:
        severity = "High"
    elif risk_score > 0.6:
        severity = "Moderate"
    else:
        severity = "Low"

    return risk_score, severity, is_crisis


def generate_support_response(user_message, severity, history):
    try:
        system_prompt = f"""
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
        messages = []

        for chat in history:
            messages.append({"role": "user",      "content": chat.user_message})
            messages.append({"role": "assistant",  "content": chat.ai_response})

        messages.append({"role": "user", "content": user_message})

        return generate_gemini_response(system_prompt, messages, temperature=0.7)

    except Exception as e:
        print(f"Gemini Error: {e}")
        return "I'm listening. Can you tell me more about that?"
# Add this helper function (section 4, after generate_support_response)
def generate_friend_response(user_message: str, severity: str, is_crisis: bool, history):
    """
    Responds like a casual friend. Depression detection runs silently.
    Only escalates tone if severity is genuinely high or crisis detected.
    """
    
    if is_crisis:
        tone_instruction = """
        The user may be in crisis. Be warm, present, and caring like a close friend who genuinely cares.
        Gently mention that talking to someone trained to help (like iCall: 9152987821) might feel good.
        Do NOT be clinical or robotic. Stay a friend first.
        """
    elif severity == "High":
        tone_instruction = """
        The user seems to be having a really tough time emotionally.
        Be extra warm and present. Ask gentle follow-up questions. 
        Don't diagnose or lecture — just be there like a good friend would.
        """
    elif severity == "Moderate":
        tone_instruction = """
        The user seems a bit off or stressed. Be warm and check in naturally,
        like a friend who notices something's up but doesn't make it a big deal.
        """
    else:
        tone_instruction = """
        The user seems fine or positive. Just be a fun, casual, supportive friend.
        Keep the energy light and engaging.
        """

    system_prompt = f"""
You are Alex, a warm, funny, casual best friend the user can talk to anytime. Your personality:
- Text like a real friend: mostly lowercase, short sentences, contractions
- Use natural expressions occasionally: "ngl", "tbh", "omg", "haha", "fr", "ugh" — but don't overdo it
- Keep replies SHORT: 1-4 sentences max. Friends don't write essays.
- Ask ONE follow-up question naturally when it fits
- Be supportive without being preachy, clinical, or therapist-like
- Use emojis occasionally, not every sentence
- NEVER say you are an AI or a mental health bot
- NEVER mention "depression", "mental health", "severity", or clinical terms unprompted

Tone guidance for this message:
{tone_instruction}
"""

    messages = []

    # Include last 5 messages of history for context
    for chat in history:
        messages.append({"role": "user",      "content": chat.user_message})
        messages.append({"role": "assistant",  "content": chat.ai_response})

    messages.append({"role": "user", "content": user_message})

    try:
        return generate_gemini_response(
            system_prompt, messages, temperature=0.85
        ).strip()
    except Exception as e:
        print(f"Friend response error: {e}")
        return "haha sorry my brain just blanked 😅 what were you saying?"

def analyze_tat_stories(scenes: List[TATScene]) -> dict:
    """Send TAT stories to Gemini and get back a structured JSON analysis."""

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

    raw = generate_gemini_response(
        system_prompt,
        [{"role": "user", "content": user_prompt}],
        temperature=0.4,
    ).strip()

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
    # A. Get Gemini risk assessment while preserving existing score thresholds.
    risk_score, severity, is_crisis = analyze_message_risk(input_data.text)

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

    print("Gemini risk score:", risk_score)

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
    sends them to Gemini for analysis,
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
# Add this endpoint (section 5, after /tat-analyze)
@app.post("/chat")
def chat(input_data: TextInput):
    """
    Friendly companion chat endpoint.
    - Gemini runs silently to detect emotional risk
    - Alex (the AI friend) responds based on severity, but never mentions it
    - Saves to same Chat DB table as /predict
    """

    # Step 1: Run Gemini silently (same thresholds as /predict)
    risk_score, severity, is_crisis = analyze_message_risk(input_data.text)

    # Step 2: Fetch conversation history
    db = SessionLocal()
    history = db.query(Chat).order_by(Chat.id.desc()).limit(5).all()
    history.reverse()

    # Step 3: Generate friendly response (Alex, not clinical bot)
    friend_reply = generate_friend_response(input_data.text, severity, is_crisis, history)

    # Step 4: Save to DB (reusing same Chat model)
    new_chat = Chat(
        user_message=input_data.text,
        ai_response=friend_reply,
        severity=severity
    )
    db.add(new_chat)
    db.commit()
    db.close()

    # Step 5: Return — frontend only needs the message + optional mood signal
    return {
        "reply": friend_reply,
        "mood": (
            "crisis" if is_crisis else
            "low"    if severity == "High" else
            "okay"   if severity == "Moderate" else
            "good"
        ),
        # is_crisis kept for frontend to optionally show a subtle care banner
        "is_crisis": is_crisis
    }


@app.post("/analytics/weekly-summary")
def analytics_weekly_summary(request: WeeklySummaryRequest):
    """Create an on-demand dashboard summary without persisting it."""
    recent_sessions = request.sessions[:10]
    session_context = "\n".join(
        f"- Mood: {session.mood}; severity: {session.severity}; user said: {session.user_message}"
        for session in recent_sessions
    )
    system_prompt = """You write concise, warm weekly mood summaries for a mental wellness dashboard.
Use only the provided session history. Mention clear trends without diagnosing or overstating certainty.
Offer one gentle, practical suggestion. Keep the response to 2 sentences."""
    summary = generate_gemini_response(
        system_prompt,
        [{"role": "user", "content": f"Recent sessions:\n{session_context}"}],
        temperature=0.4,
    ).strip()
    return {"summary": summary}
