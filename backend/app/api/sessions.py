from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.session import ColumnMap, Session
from app.storage import sessions as session_store

router = APIRouter(prefix="/sessions", tags=["sessions"])


class ImportRequest(BaseModel):
    csv_path: str
    name: str
    bike_slug: str
    column_map: ColumnMap = ColumnMap()
    velocity_quantity: Literal["wheel", "shaft"] = "shaft"


@router.get("", response_model=list[Session])
def list_sessions():
    return session_store.list_sessions()


@router.post("/import", response_model=Session, status_code=201)
def import_session(req: ImportRequest):
    from pathlib import Path
    if not Path(req.csv_path).exists():
        raise HTTPException(status_code=400, detail=f"File not found: {req.csv_path}")

    session = Session(
        id=str(uuid.uuid4()),
        name=req.name,
        bike_slug=req.bike_slug,
        csv_path=req.csv_path,
        column_map=req.column_map,
        velocity_quantity=req.velocity_quantity,
        created_at=datetime.now(timezone.utc),
        analyzed=False,
    )
    session_store.save_session(session)
    return session


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str):
    if not session_store.delete_session(session_id):
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
