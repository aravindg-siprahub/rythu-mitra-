"""
Custom runserver command for Rythu Mitra.

Automatically starts Redis and Celery worker BEFORE Django server starts,
so that `python manage.py runserver` starts everything in one command.

Usage:
    python manage.py runserver           → starts on 127.0.0.1:8000
    python manage.py runserver 0.0.0.0:8000

NOTE: Inherits from staticfiles runserver (not core) because
      django.contrib.staticfiles overrides runserver and comes before
      apps.core in INSTALLED_APPS — so we must extend staticfiles' version.
"""

import os
import sys
import time
import signal
import subprocess
import platform

# IMPORTANT: Must inherit from staticfiles' runserver, not core's.
# staticfiles is listed before apps.core in INSTALLED_APPS so it
# would silently override our command if we extended core's version.
from django.contrib.staticfiles.management.commands.runserver import (
    Command as BaseRunserverCommand,
)


IS_WINDOWS = platform.system() == "Windows"

# PIDs we started — so we can clean them up on exit
_background_processes = []


def _find_python():
    """Return the same Python executable that is running this process."""
    return sys.executable


def _start_redis():
    """Start Redis server in the background. Returns process or None."""
    print("\n🔴 [1/3] Starting Redis...")

    try:
        if IS_WINDOWS:
            # On Windows, open in a new window so it stays visible
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

        time.sleep(1)

        # Verify Redis responds
        check = subprocess.run(
            ["redis-cli", "ping"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        if "PONG" in check.stdout:
            print(f"✅ Redis is running on port 6379 (PID: {proc.pid})")
            return proc
        else:
            print("⚠️  Redis started but not responding — continuing anyway")
            return proc

    except FileNotFoundError:
        print("❌ redis-server not found in PATH.")
        if IS_WINDOWS:
            print("   Download: https://github.com/microsoftarchive/redis/releases")
        else:
            print("   Install:  sudo apt install redis-server  (or brew install redis)")
        print("   ⚠️  Continuing without Redis — Celery tasks will fail!\n")
        return None

    except Exception as e:
        print(f"⚠️  Redis start error: {e} — continuing anyway\n")
        return None


def _start_celery():
    """Start Celery worker in the background. Returns process or None."""
    print("\n🌿 [2/3] Starting Celery worker...")

    python = _find_python()

    try:
        if IS_WINDOWS:
            proc = subprocess.Popen(
                [
                    python, "-m", "celery",
                    "-A", "rythu_mitra",
                    "worker",
                    "--loglevel=info",
                    "--pool=solo",
                ],
                creationflags=subprocess.CREATE_NEW_CONSOLE,
            )
        else:
            proc = subprocess.Popen(
                [
                    python, "-m", "celery",
                    "-A", "rythu_mitra",
                    "worker",
                    "--loglevel=info",
                    "--pool=solo",
                ],
                stdout=open("celery.log", "a"),
                stderr=subprocess.STDOUT,
            )

        time.sleep(2)
        print(f"✅ Celery worker started (PID: {proc.pid})")
        if not IS_WINDOWS:
            print("   Logs → backend/celery.log")
        return proc

    except Exception as e:
        print(f"⚠️  Celery start error: {e} — continuing anyway\n")
        return None


def _cleanup(signum=None, frame=None):
    """Kill Redis + Celery when Django exits."""
    print("\n🛑 Shutting down Redis and Celery...")
    for proc in _background_processes:
        if proc and proc.poll() is None:
            try:
                if IS_WINDOWS:
                    proc.terminate()
                else:
                    proc.send_signal(signal.SIGTERM)
                proc.wait(timeout=5)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass
    print("👋 All services stopped. Goodbye.")
    sys.exit(0)


class Command(BaseRunserverCommand):
    help = (
        "Starts Redis + Celery worker + Django development server "
        "in a single command."
    )

    def handle(self, *args, **options):
        # Only start Redis/Celery on the MAIN process (not the reloader child)
        # Django's autoreloader sets RUN_MAIN=true in the child process
        if os.environ.get("RUN_MAIN") != "true":
            print("\n══════════════════════════════════════════════════")
            print("  🌾 Rythu Mitra — Starting all services")
            print("══════════════════════════════════════════════════")

            redis_proc = _start_redis()
            celery_proc = _start_celery()

            if redis_proc:
                _background_processes.append(redis_proc)
            if celery_proc:
                _background_processes.append(celery_proc)

            # Register cleanup on Ctrl+C / SIGTERM
            signal.signal(signal.SIGINT, _cleanup)
            signal.signal(signal.SIGTERM, _cleanup)

            print("\n🚀 [3/3] Starting Django development server...")
            print("──────────────────────────────────────────────────")

        # Call the original runserver logic
        super().handle(*args, **options)
