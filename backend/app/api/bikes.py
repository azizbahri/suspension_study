from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.bike import BikeProfile
from app.storage import bikes as bike_store

router = APIRouter(prefix="/bikes", tags=["bikes"])


@router.get("", response_model=list[BikeProfile])
def list_bikes():
    return bike_store.load_bikes()


@router.post("", response_model=BikeProfile, status_code=201)
def create_bike(bike: BikeProfile):
    if bike_store.get_bike(bike.slug) is not None:
        raise HTTPException(status_code=409, detail=f"Bike '{bike.slug}' already exists")
    bike_store.save_bike(bike)
    return bike


@router.put("/{slug}", response_model=BikeProfile)
def update_bike(slug: str, bike: BikeProfile):
    bike.slug = slug
    bike_store.save_bike(bike)
    return bike


@router.delete("/{slug}", status_code=204)
def delete_bike(slug: str):
    if not bike_store.delete_bike(slug):
        raise HTTPException(status_code=404, detail=f"Bike '{slug}' not found")
