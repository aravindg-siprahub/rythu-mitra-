"""
Rythu Mitra — Core AppConfig

When `python manage.py runserver` is run, this automatically starts
Redis and Celery in the background before Django serves requests.
No extra commands needed.
"""

import os
import sys
import time
import platform
import subprocess

from django.apps import AppConfig


IS_WINDOWS = platform.system() == "Windows"

# Track launched processes so we don't double-start
_services_started = False


def _is_running_runserver():
    """Check if this process was started with `manage.py runserver`."""
    return len(sys.argv) >= 2 and sys.argv[1] == "runserver"


def _start_redis():
    """
    Start Redis if not already running.
    If Redis is already up (e.g. Docker), skip launching redis-server binary.
    Returns subprocess.Popen or None.
    """
    print("\n🔴 [1/2] Checking Redis...")

    # ── First: ping to see if Redis is already running (Docker etc.) ──
    try:
        check = subprocess.run(
            ["redis-cli", "-h", "127.0.0.1", "-p", "6379", "ping"],
            capture_output=True, text=True, timeout=3,
        )
        if "PONG" in check.stdout:
            print("✅ Redis already running on port 6379 (Docker detected)")
            return None  # Already up — nothing to manage
    except FileNotFoundError:
        pass  # redis-cli not in PATH — try socket check below
    except Exception:
        pass

    # ── Fallback: try TCP socket check if redis-cli not available ─────
    try:
        import socket
        s = socket.create_connection(("127.0.0.1", 6379), timeout=2)
        s.close()
        print("✅ Redis already running on port 6379 (Docker detected)")
        return None
    except (ConnectionRefusedError, OSError):
        pass  # Not running — try to start it

    # ── Redis not running — try to launch redis-server binary ─────────
    print("   Redis not detected. Trying to start redis-server...")
    try:
        if IS_WINDOWS:
            proc = subprocess.Popen(
                ["redis-server", "--port", "6379"],
                creationflags=subprocess.CREATE_NEW_CONSOLE,
            )
        else:
            proc = subprocess.Popen(
                ["redis-server", "--port", "6379", "--daemonize", "yes"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        time.sleep(1.5)
        print(f"✅ Redis started (PID: {proc.pid})")
        return proc

    except FileNotFoundError:
        print("❌ redis-server not found in PATH and Docker Redis not detected!")
        print("   → Start Redis Docker container: docker start redis")
        print("   → Or install Redis: https://github.com/microsoftarchive/redis/releases")
        print("   ⚠️  Celery tasks will fail without Redis.\n")
        return None
    except Exception as exc:
        print(f"⚠️  Redis start error: {exc}\n")
        return None


def _start_celery():
    """Start Celery worker in background. Returns subprocess.Popen or None."""
    print("\n🌿 [2/2] Starting Celery worker...")
    python = sys.executable

    try:
        if IS_WINDOWS:
            proc = subprocess.Popen(
                [
                    python, "-m", "celery",
                    "-A", "rythu_mitra", "worker",
                    "--loglevel=info", "--pool=solo",
                ],
                creationflags=subprocess.CREATE_NEW_CONSOLE,
            )
        else:
            log_path = os.path.join(os.path.dirname(__file__), "..", "..", "celery.log")
            log_file = open(os.path.abspath(log_path), "a")
            proc = subprocess.Popen(
                [
                    python, "-m", "celery",
                    "-A", "rythu_mitra", "worker",
                    "--loglevel=info", "--pool=solo",
                ],
                stdout=log_file,
                stderr=subprocess.STDOUT,
            )

        time.sleep(2)
        print(f"✅ Celery worker started (PID: {proc.pid})")
        if not IS_WINDOWS:
            print("   Logs → backend/celery.log")
        return proc

    except Exception as exc:
        print(f"⚠️  Celery start error: {exc}\n")
        return None


class CoreConfig(AppConfig):
    name = "apps.core"
    verbose_name = "Core"

    def ready(self):
        global _services_started

        # Only start services when:
        # 1. Running `manage.py runserver`
        # 2. In the OUTER reloader process (RUN_MAIN not set)
        #    OR in --noreload mode
        # This prevents double-starting when autoreloader restarts the child.
        if not _is_running_runserver():
            return

        if os.environ.get("RUN_MAIN") == "true":
            return  # Child/reloaded process — services already running

        if _services_started:
            return  # Safety guard against double calls

        _services_started = True

        print("\n══════════════════════════════════════════════════")
        print("  🌾 Rythu Mitra — Auto-starting background services")
        print("══════════════════════════════════════════════════")

        _start_redis()
        _start_celery()

        print("\n🚀 Django is starting...")
        print("──────────────────────────────────────────────────\n")
