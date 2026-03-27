"""
Start the Django development server on port 8000.

This project uses Django (manage.py). A previous uvicorn-based startup
was left behind and breaks because there is no FastAPI `app` module.
"""

from __future__ import annotations

import subprocess
import sys


def main() -> int:
    cmd = [sys.executable, "manage.py", "runserver", "0.0.0.0:8000"]
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
