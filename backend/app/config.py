from pathlib import Path

DATA_DIR = Path.home() / ".suspension_study"
BIKES_DIR = DATA_DIR / "bikes"
SESSIONS_DIR = DATA_DIR / "sessions"
DEMOS_DIR = DATA_DIR / "demos"

DATA_DIR.mkdir(exist_ok=True)
BIKES_DIR.mkdir(exist_ok=True)
SESSIONS_DIR.mkdir(exist_ok=True)
DEMOS_DIR.mkdir(exist_ok=True)
