#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  Rythu Mitra — Unified Startup Script (Linux / Render / Mac)
#  Starts: Redis → Celery Worker → Django (foreground)
#  Usage: bash backend/start.sh
# ─────────────────────────────────────────────────────────────────

set -e  # Exit immediately on any error

# ── Navigate to backend directory ─────────────────────────────────
cd "$(dirname "$0")"

echo "══════════════════════════════════════════════════"
echo "  🌾 Rythu Mitra — Starting all services"
echo "══════════════════════════════════════════════════"

# ── Activate virtual environment if it exists ─────────────────────
if [ -d "venv/bin" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
elif [ -d ".venv/bin" ]; then
    echo "🔧 Activating .venv virtual environment..."
    source .venv/bin/activate
else
    echo "⚠️  No venv found — using system Python"
fi

# ── Check Redis is installed ───────────────────────────────────────
if ! command -v redis-server &> /dev/null; then
    echo ""
    echo "❌ redis-server not found in PATH!"
    echo "   Install with: sudo apt install redis-server (Linux)"
    echo "                 brew install redis (Mac)"
    exit 1
fi

# ── Check Celery / Python is available ────────────────────────────
if ! python -c "import celery" &> /dev/null; then
    echo ""
    echo "❌ Celery not found! Run: pip install -r requirements.txt"
    exit 1
fi

# ── 1. Start Redis (background daemon) ────────────────────────────
echo ""
echo "🔴 [1/3] Starting Redis server..."
redis-server --daemonize yes --loglevel notice --port 6379
sleep 1

# Verify Redis actually started
if redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is running on port 6379"
else
    echo "❌ Redis failed to start. Check redis-server installation."
    exit 1
fi

# ── 2. Start Celery Worker (background) ───────────────────────────
echo ""
echo "🌿 [2/3] Starting Celery worker..."
celery -A rythu_mitra worker --loglevel=info --pool=solo &
CELERY_PID=$!
echo "✅ Celery worker started (PID: $CELERY_PID)"

# Give Celery time to connect to Redis
sleep 3

# ── 3. Start Django (foreground — keeps Render alive) ─────────────
echo ""
echo "🚀 [3/3] Starting Django on 0.0.0.0:8000..."
echo "──────────────────────────────────────────────────"
echo "   Redis  → running on port 6379 (daemon)"
echo "   Celery → PID $CELERY_PID (background)"
echo "   Django → starting in foreground now"
echo "──────────────────────────────────────────────────"
echo ""

python manage.py runserver 0.0.0.0:8000
