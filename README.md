# 🌾 Rythu Mitra — AI-Powered Farmer Assistant

An intelligent agriculture platform for Indian farmers, providing AI-driven crop recommendations, disease detection, market price intelligence, and weather advisories.

## Tech Stack

- **Frontend:** React (Create React App), Framer Motion, React Router v6
- **Backend:** Django 4.2 + Django REST Framework, Celery, Redis
- **Database:** Supabase (PostgreSQL)
- **AI/ML:** OpenRouter / Groq API (crop, disease, market, weather)
- **Auth:** Supabase JWT Authentication

## Project Structure

```
rythu-mitra/
├── backend/           # Django backend
│   ├── apps/          # Django apps (crop, disease, weather, market, work, auth_app, core)
│   ├── rythu_mitra/   # Django settings & URL config
│   └── manage.py
└── frontend/          # React frontend
    └── src/
        ├── modules/   # AI modules (crop, disease, market, weather, work)
        ├── pages/     # App pages
        ├── components/# UI components
        └── services/  # API service layer
```

## Features

- 🌱 **Crop Recommendation** — AI-powered soil-based crop suggestions
- 🔬 **Disease Lab** — Image-based crop disease detection
- 📈 **Market Intelligence** — Live mandi prices & 7-day predictions
- 🌤️ **Weather Advisory** — Hyperlocal farming weather guidance
- 👷 **Work Board** — Agricultural job listings
- 🌐 **Multilingual** — Telugu, Hindi, English support

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm start
```
