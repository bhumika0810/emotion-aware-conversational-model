# 🧠 Emotion Aware Conversational Model (EACM)

> A personal AI-powered mental health companion that analyzes your mood, detects emotional distress, and provides compassionate support — built with React, FastAPI, and local LLMs.

---

## ✨ Features

- 💬 **AI Chat** — Talk to a supportive AI powered by Llama 3.2 (via Ollama) that responds empathetically based on your emotional state
- 📊 **Mood Analysis** — Visual weekly mood chart that tracks your emotional trends over time across sessions
- 🧠 **Mental Check (TAT Test)** — A 5-scene Thematic Apperception Test that generates a full psychological profile using AI
- 📝 **Journal** — A weekly planner with mood tracking, daily priorities, tasks, and meal planning
- ✨ **Crisis Support** — Auto-detects crisis keywords and routes users to breathing exercises, grounding techniques, and emergency helplines
- 🔍 **Session History** — Every chat session is saved with severity, mood score, and timestamps

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Custom CSS (glassmorphism) |
| Backend | FastAPI (Python) |
| ML Model | DistilBERT (fine-tuned for depression detection) |
| Local LLM | Llama 3.2 via Ollama |
| Database | SQLite via SQLAlchemy |

---

## 📁 Project Structure

```
mindspace/
├── frontend/
│   └── client/
│       └── src/
│           ├── App.jsx            # Main app, routing, chat logic
│           ├── App.css            # All styles
│           ├── MoodChart.jsx      # Mood analysis page
│           ├── moodConstants.js   # Severity → mood mapping
│           ├── JournalPage.jsx    # Weekly journal planner
│           ├── TATPage.jsx        # TAT psychological test
│           └── CrisisPage.jsx     # Crisis intervention page
└── backend/
    ├── main.py                    # FastAPI server + endpoints
    ├── models.py                  # SQLAlchemy DB models
    ├── database.py                # DB session setup
    └── model/
        └── depression_model/      # Fine-tuned DistilBERT model files
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- [Ollama](https://ollama.com) installed and running
- Llama 3.2 model pulled

```bash
ollama pull llama3.2:1b
```

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/mindspace-ai.git
cd mindspace-ai
```

### 2. Backend Setup

```bash
cd backend
pip install fastapi uvicorn transformers torch openai sqlalchemy pydantic
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`

### 3. Frontend Setup

```bash
cd frontend/client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Make sure Ollama is running

```bash
ollama serve
```

---

## 🔌 API Endpoints

### `POST /predict`
Analyzes user text for emotional state.

**Request:**
```json
{ "text": "I feel really anxious today" }
```

**Response:**
```json
{
  "risk_score": 0.823,
  "severity": "High",
  "mood": "Bad",
  "support_message": "I hear you...",
  "is_crisis": false
}
```

### `POST /tat-analyze`
Analyzes TAT stories and returns a psychological profile.

**Request:**
```json
{
  "scenes": [
    { "theme": "solitude & reflection", "story": "A person stands alone..." }
  ]
}
```

**Response:** Full JSON profile with traits, themes, emotional tone, and growth areas.

---

## 🧩 How It Works

1. User types a message in the chat
2. Frontend sends it to `/predict`
3. DistilBERT model computes a **risk score** (0.0 → 1.0)
4. Risk score maps to **severity** (Low / Moderate / High) and **mood** (Great → Awful)
5. If crisis keywords are detected (`"want to die"`, `"suicide"`, etc.), the crisis page opens automatically
6. Ollama (Llama 3.2) generates a warm, context-aware support message
7. Session is saved to SQLite with severity + timestamp
8. MoodChart visualizes sessions week by week

---

## 📸 Pages

| Page | Description |
|------|-------------|
| 🏠 Home | Chat interface with action pills |
| 📊 Mood Analysis | Weekly chart, session history, mood insights |
| 🧠 Mental Check | 5-scene TAT test with AI-generated psychological profile |
| 📝 Journal | Weekly planner with tasks, moods, meals |
| ✨ Crisis Support | Breathing exercise, 5-4-3-2-1 grounding, Indian helplines |

---

## 🆘 Crisis Resources (India)

| Helpline | Number |
|----------|--------|
| iCall | 9152987821 |
| Vandrevala Foundation | 1860-2662-345 |
| AASRA | 9820466627 |
| Snehi | 044-24640050 |
| Emergency | 112 |

---

## ⚠️ Disclaimer

MindSpace AI is **not a substitute for professional mental health care**. It is an educational and supportive tool only. If you or someone you know is in crisis, please contact a licensed mental health professional or emergency services immediately.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

> Built with 💜 by Bhumika 
