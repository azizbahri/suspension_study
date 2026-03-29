from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.analysis import AnalysisResult
from app.storage import sessions as session_store

router = APIRouter(prefix="/compare", tags=["compare"])


class CompareRequest(BaseModel):
    session_ids: list[str]
    granularity: Literal["session", "segment"] = "session"
    segment_duration_s: float | None = None


class SessionComparison(BaseModel):
    session_id: str
    session_name: str
    result: AnalysisResult


class CompareResponse(BaseModel):
    sessions: list[SessionComparison]
    granularity: Literal["session", "segment"]


@router.post("", response_model=CompareResponse)
def compare_sessions(req: CompareRequest):
    if len(req.session_ids) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 sessions to compare")
    if len(req.session_ids) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 sessions can be compared")

    comparisons = []
    for sid in req.session_ids:
        session = session_store.load_session(sid)
        if session is None:
            raise HTTPException(status_code=404, detail=f"Session '{sid}' not found")
        result = session_store.load_result(sid)
        if result is None:
            raise HTTPException(
                status_code=400,
                detail=f"Session '{sid}' has not been analyzed yet. Run /analyze/{sid} first.",
            )
        comparisons.append(
            SessionComparison(
                session_id=sid,
                session_name=session.name,
                result=result,
            )
        )

    return CompareResponse(sessions=comparisons, granularity=req.granularity)
