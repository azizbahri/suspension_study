from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import bikes, sessions, calibrate, analyze, compare, demo
from app.storage.bikes import seed_defaults
from app.storage.demo import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_defaults()
    seed_demo_data()
    yield


app = FastAPI(
    title="Suspension Study",
    version="1.0.0",
    description="Motorcycle suspension DAQ post-processing API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_PREFIX = "/api/v1"
app.include_router(bikes.router, prefix=_PREFIX)
app.include_router(sessions.router, prefix=_PREFIX)
app.include_router(calibrate.router, prefix=_PREFIX)
app.include_router(analyze.router, prefix=_PREFIX)
app.include_router(compare.router, prefix=_PREFIX)
app.include_router(demo.router, prefix=_PREFIX)


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}
