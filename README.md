# 📌 Anvin Chatbot Project

### 🚀 Overview
An AI-powered chatbot built using **Next.js (Frontend)** and **FastAPI (Backend)**, leveraging **Ollama** for LLM-based responses. This project allows real-time conversations with AI via a simple and interactive UI.

---

## 📂 Project Structure
```
/anvin-project
│── frontend/          # Next.js frontend (React + TypeScript)
│── backend/           # FastAPI server (Python)
│   ├── server.py      # FastAPI application connecting to Ollama
│   ├── venv/          # Python virtual environment
│   ├── requirements.txt # Python dependencies
│── README.md          # Documentation
│── .env.local         # Environment variables for API
```

---

## 🔧 Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/anvin-chatbot.git
cd anvin-chatbot
```

### 2️⃣ Backend Setup (FastAPI)
#### **Create a Virtual Environment & Install Dependencies**
```bash
cd backend
python3 -m venv Aviant
source Aviant/bin/activate  # For Linux/macOS
Aviant\Scripts\activate     # For Windows
pip install -r requirements.txt
```

#### **Start the Ollama Server**
```bash
ollama serve
ollama pull llama3.2  # Ensure the model is available
```

#### **Run FastAPI Server**
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

✅ FastAPI should now be running at **http://localhost:8000/docs**.

---

### 3️⃣ Frontend Setup (Next.js)
```bash
cd frontend
npm install  # Install dependencies
npm run dev  # Start Next.js frontend
```

✅ Frontend should now be accessible at **http://localhost:3000**.

---

## 🔗 API Endpoint
| Endpoint  | Method | Description |
|-----------|--------|-------------|
| `/chat`   | POST   | Sends user input to Ollama and returns AI-generated response |

---

## 📜 Environment Variables
Create a `.env.local` file inside `frontend/` with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🛠 Tech Stack
- **Frontend**: Next.js (React, TailwindCSS, TypeScript)
- **Backend**: FastAPI (Python, Pydantic, HTTPX)
- **AI Engine**: Ollama (LLM integration)

---

## 📌 To-Do & Future Improvements
- ✅ Improve UI with chat bubbles and animations
- ✅ Add persistent chat history storage
- 🔲 Expand AI models (support for different LLMs)
- 🔲 Deploy on cloud platforms (AWS/GCP/Vercel)

---

## 🤝 Contributing
1. **Fork** the repo
2. **Create a new branch** (`feature-xyz`)
3. **Commit changes**
4. **Push to your fork & create a PR**

---

## 📄 License
This project is licensed under the **MIT License**.

---

💡 **Created by Anvin** | 🚀 Happy Coding! 🎯

