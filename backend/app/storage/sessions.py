"""File-system storage for Session and AnalysisResult objects."""

from __future__ import annotations

import shutil

from app.config import SESSIONS_DIR
from app.models.analysis import AnalysisResult
from app.models.session import Session


def _session_dir(session_id: str):
    return SESSIONS_DIR / session_id


def list_sessions() -> list[Session]:
    sessions = []
    for d in sorted(SESSIONS_DIR.iterdir()):
        p = d / "session.json"
        if p.exists():
            try:
                sessions.append(Session.model_validate_json(p.read_text("utf-8")))
            except Exception:
                pass
    return sessions


def save_session(session: Session) -> None:
    d = _session_dir(session.id)
    d.mkdir(parents=True, exist_ok=True)
    (d / "session.json").write_text(session.model_dump_json(indent=2), encoding="utf-8")


def load_session(session_id: str) -> Session | None:
    p = _session_dir(session_id) / "session.json"
    if p.exists():
        return Session.model_validate_json(p.read_text("utf-8"))
    return None


def delete_session(session_id: str) -> bool:
    d = _session_dir(session_id)
    if d.exists():
        shutil.rmtree(d)
        return True
    return False


def save_result(session_id: str, result: AnalysisResult) -> None:
    d = _session_dir(session_id)
    d.mkdir(parents=True, exist_ok=True)
    (d / "result.json").write_text(result.model_dump_json(indent=2), encoding="utf-8")


def load_result(session_id: str) -> AnalysisResult | None:
    p = _session_dir(session_id) / "result.json"
    if p.exists():
        return AnalysisResult.model_validate_json(p.read_text("utf-8"))
    return None
