# 🧠 Emotion Aware Conversational Model (EACM)

> An AI-powered mental health companion that helps users analyze emotions, monitor mood trends, maintain a wellness journal, and receive supportive conversations using Google Gemini AI.

---

## ✨ Features

* 💬 **AI Chat** – Emotion-aware conversations powered by **Google Gemini AI**
* 📊 **Mood Analysis** – Tracks emotional trends with an interactive weekly mood chart
* 🧠 **Mental Health Check** – AI-assisted Thematic Apperception Test (TAT) for reflective psychological insights
* 📝 **Journal** – Weekly planner with mood tracking, goals, meals, and daily notes
* 🚨 **Crisis Detection** – Detects high-risk emotional messages and provides immediate support resources
* 📚 **Session History** – Stores conversations and mood analysis for progress tracking

---

## 🚀 Live Demo

**Frontend (Vercel)**

`https://emotion-aware-conversational-model-iota.vercel.app`

**Backend API (Render)**

`https://emotion-aware-conversational-model.onrender.com`

---

## 🛠 Tech Stack

| Layer           | Technology             |
| --------------- | ---------------------- |
| Frontend        | React + Vite           |
| Styling         | CSS (Glassmorphism UI) |
| Backend         | FastAPI                |
| AI              | Google Gemini API      |
| Database        | SQLite + SQLAlchemy    |
| Deployment      | Vercel + Render        |
| Version Control | Git & GitHub           |

---

## 📂 Project Structure

```text
mental-health-ai/
│
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── mental_health.db
│
├── frontend/
│   └── client/
│       ├── src/
│       │   ├── App.jsx
│       │   ├── MoodChart.jsx
│       │   ├── MoodConstants.js
│       │   ├── JournalPage.jsx
│       │   ├── TATPage.jsx
│       │   ├── CrisisPage.jsx
│       │   └── assets/
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

---

## 🚀 Running Locally

### Clone

```bash
git clone https://github.com/bhumika0810/emotion-aware-conversational-model.git

cd emotion-aware-conversational-model
```

---

### Backend

```bash
cd mental-health-ai/backend

pip install -r ../requirements.txt

uvicorn app:app --reload
```

Runs on

```
http://127.0.0.1:8000
```

---

### Frontend

```bash
cd mental-health-ai/frontend/client

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

## API Endpoints

### POST `/predict`

Analyzes the user's emotional state.

```json
{
  "text":"I feel anxious today"
}
```

---

### POST `/chat`

Generates an empathetic AI response.

---

### POST `/tat-analyze`

Generates a psychological summary from TAT responses.

---

## How It Works

1. User submits a message.
2. FastAPI processes the request.
3. Gemini analyzes emotional severity.
4. The backend classifies mood and detects crisis situations.
5. AI generates a supportive response.
6. Sessions are stored in SQLite.
7. Mood trends are visualized in the dashboard.

---

## Screenshots
* Home Page
<img width="1202" height="801" alt="Screenshot 2026-07-25 at 7 15 31 PM" src="https://github.com/user-attachments/assets/8b64cf2d-f97d-4e23-9299-14b1815d19d3" />

* AI Chat
<img width="987" height="799" alt="Screenshot 2026-07-25 at 7 16 13 PM" src="https://github.com/user-attachments/assets/74932668-d7f5-44ec-8bd4-618540f11eb9" />

* Mood Analysis
<img width="1301" height="801" alt="Screenshot 2026-07-25 at 7 16 51 PM" src="https://github.com/user-attachments/assets/947716b2-b0d8-43d8-bf84-203a7f8aa0c4" />

* Mental Health Check
<img width="1214" height="800" alt="Screenshot 2026-07-25 at 7 17 24 PM" src="https://github.com/user-attachments/assets/aea9e8d3-6371-4d26-8e02-e09a3455c2b7" />

* Journal
<img width="1391" height="802" alt="Screenshot 2026-07-25 at 7 17 49 PM" src="https://github.com/user-attachments/assets/e1a86ae1-4adf-4d85-97f5-2a416e3972f8" />

* Crisis Support
<img width="1140" height="800" alt="Screenshot 2026-07-25 at 7 18 28 PM" src="https://github.com/user-attachments/assets/92055482-2415-4239-98c3-9819c37f4c90" />
<img width="1054" height="801" alt="Screenshot 2026-07-25 at 7 18 47 PM" src="https://github.com/user-attachments/assets/eed6aaa4-7924-435c-8fb2-a9c3d709e504" />


---

## Future Improvements

* User authentication
* Cloud database (PostgreSQL)
* Voice conversations
* Multi-language support
* Emotion analytics dashboard
* Therapist dashboard
* Mobile application

---

## Disclaimer

This application is intended for educational and supportive purposes only. It is **not** a substitute for professional mental health care. If someone is experiencing a mental health emergency, they should contact local emergency services or a licensed mental health professional.

---

## License

MIT License

---

# 👩‍💻 Author

**Bhumika Singh**

GitHub: [https://github.com/bhumika0810](https://github.com/bhumika0810)

