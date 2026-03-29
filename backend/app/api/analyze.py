from __future__ import annotations

import pandas as pd
from fastapi import APIRouter, HTTPException

from app.models.analysis import AnalysisResult
from app.processing.pipeline import process_session
from app.storage import bikes as bike_store
from app.storage import sessions as session_store

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("/{session_id}", response_model=AnalysisResult)
def analyze_session(session_id: str):
    session = session_store.load_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    bike = bike_store.get_bike(session.bike_slug)
    if bike is None:
        raise HTTPException(status_code=404, detail=f"Bike profile '{session.bike_slug}' not found")

    try:
        df = pd.read_csv(session.csv_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot read CSV: {e}")

    result = process_session(df, bike, session.column_map, session.velocity_quantity)
    result.session_id = session_id

    session.analyzed = True
    session_store.save_session(session)
    session_store.save_result(session_id, result)

    return result


@router.get("/{session_id}/result", response_model=AnalysisResult)
def get_result(session_id: str):
    result = session_store.load_result(session_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"No result for session '{session_id}'")
    return result
