from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Annotated, Literal

from fastapi import APIRouter, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.models.session import ColumnMap, Session
from app.storage import sessions as session_store
from app.config import UPLOADS_DIR

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


@router.post("/upload", response_model=Session, status_code=201)
async def upload_session(
    file: UploadFile,
    name: Annotated[str, Form()],
    bike_slug: Annotated[str, Form()],
    velocity_quantity: Annotated[Literal["wheel", "shaft"], Form()] = "wheel",
    column_map: Annotated[str, Form()] = "{}",
):
    """Accept a CSV file from the client's local filesystem, save it server-side, and create a session."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")

    session_id = str(uuid.uuid4())
    dest = UPLOADS_DIR / f"{session_id}.csv"
    contents = await file.read()
    dest.write_bytes(contents)

    try:
        col_map = ColumnMap(**json.loads(column_map))
    except (json.JSONDecodeError, TypeError, ValueError):
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail="Invalid column_map: expected a JSON object")

    session = Session(
        id=session_id,
        name=name,
        bike_slug=bike_slug,
        csv_path=str(dest),
        column_map=col_map,
        velocity_quantity=velocity_quantity,
        created_at=datetime.now(timezone.utc),
        analyzed=False,
    )
    session_store.save_session(session)
    return session


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str):
    if not session_store.delete_session(session_id):
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
