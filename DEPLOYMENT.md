# 🚀 Rythu Mitra — Deployment Guide

## Architecture Overview

| Layer     | Service       | Host        |
|-----------|--------------|-------------|
| Frontend  | React (Vite) | Vercel      |
| Backend   | Django + DRF | Render      |
| Task Queue| Celery       | Render (same instance) |
| Broker    | Redis        | Render (local, same instance) |
| Database  | Supabase     | Supabase cloud |

---

## ▶️ Running Locally (All-in-One)

### Prerequisites
- Python 3.10+
- Redis installed (`redis-server` available in PATH)
- `venv` created and dependencies installed

### Setup
```bash
# 1. Clone and install backend deps
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt

# 2. Copy env file
cp ../.env.example .env
# → Edit backend/.env with your real keys

# 3. Start everything in ONE command (Mac/Linux)
bash backend/start.sh

# Windows — run each in a separate terminal:
redis-server
celery -A rythu_mitra worker --loglevel=info --pool=solo
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm install
npm start        # Runs on http://localhost:3000
```

---

## ☁️ Deploying to Render (Backend)

### Step 1 — Push to GitHub
Make sure your `render.yaml` is committed at the project root.

### Step 2 — Create Render Account
Go to [render.com](https://render.com) → Sign up with GitHub.

### Step 3 — New Web Service
1. Click **New → Web Service**
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` → click **Apply**

### Step 4 — Set Secret Environment Variables
In Render Dashboard → your service → **Environment**:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | Generate a long random string |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret |
| `OPENROUTER_API_KEY` | Your OpenRouter key |
| `GROQ_API_KEY` | Your Groq key |
| `OPENWEATHER_API_KEY` | OpenWeatherMap key |

### Step 5 — Deploy
Click **Manual Deploy → Deploy Latest Commit**

Your backend will be live at: `https://rythu-mitra-backend.onrender.com`

---

## ☁️ Deploying to Vercel (Frontend)

### Step 1 — Vercel Account
Go to [vercel.com](https://vercel.com) → sign up with GitHub.

### Step 2 — Import Project
1. Click **Add New → Project**
2. Select your GitHub repo
3. Set **Root Directory** to `frontend`

### Step 3 — Set Environment Variables
| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://rythu-mitra-backend.onrender.com` |

### Step 4 — Deploy
Click **Deploy** — Vercel handles everything automatically.

---

## 🔄 How start.sh Works

```
start.sh
  ├── [1] redis-server --daemonize yes     ← Redis starts in background
  ├── [2] celery -A rythu_mitra worker &   ← Celery starts in background
  └── [3] python manage.py runserver       ← Django runs in FOREGROUND (keeps Render alive)
```

> [!NOTE]
> Render keeps your service alive as long as the foreground process (Django) is running. Redis and Celery run quietly in the background on the same instance — no extra services or paid add-ons needed for MVP.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `redis-server: command not found` | Install Redis: `sudo apt install redis-server` (Linux) or `brew install redis` (Mac) |
| `celery: command not found` | Activate your venv first: `source venv/bin/activate` |
| CORS errors from frontend | Add your Vercel URL to `CORS_ALLOWED_ORIGINS` in Render env vars |
| 500 errors on Render | Check logs in Render Dashboard → your service → **Logs** tab |
