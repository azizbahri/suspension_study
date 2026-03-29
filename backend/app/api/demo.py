"""
Demo status endpoint.

GET /api/v1/demo → DemoStatus
Returns session/bike/analyzed counts and the ID of the seeded demo session (if any).
The frontend uses this data to populate the welcome dashboard.
"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.storage import bikes as bike_store
from app.storage import sessions as session_store
from app.storage.demo import DEMO_SESSION_NAME

router = APIRouter(prefix="/demo", tags=["demo"])


class DemoStatus(BaseModel):
    session_count: int
    bike_count: int
    analyzed_count: int
    demo_session_id: str | None


@router.get("", response_model=DemoStatus)
def get_demo_status():
    sessions = session_store.list_sessions()
    bikes = bike_store.load_bikes()
    analyzed = sum(1 for s in sessions if s.analyzed)
    demo_id = next(
        (s.id for s in sessions if s.name == DEMO_SESSION_NAME),
        None,
    )
    return DemoStatus(
        session_count=len(sessions),
        bike_count=len(bikes),
        analyzed_count=analyzed,
        demo_session_id=demo_id,
    )
