import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.db.init_db import init_database
from backend.app.seed.canonical_seed import seed_canonical_data

# Import API Routers
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.projects import router as projects_router
from backend.app.api.v1.schedules import router as schedules_router
from backend.app.api.v1.events import router as events_router
from backend.app.api.v1.matching import router as matching_router
from backend.app.api.v1.voice import router as voice_router
from backend.app.api.v1.extraction import router as extraction_router
from backend.app.api.v1.ingest import router as ingest_router
from backend.app.api.v1.export import router as export_router
from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.audit import router as audit_router
from backend.app.api.v1.notifications import router as notifications_router
from backend.app.api.v1.admin import router as admin_router
from backend.app.api.v1.time_agent import router as time_agent_router
from backend.app.api.v1.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed on startup if needed
    await init_database()
    await seed_canonical_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-SchedBridge-Mode", "X-Request-Id"]
)

# D22 Demo-Mode Disclosure & Request Tracing Middleware
@app.middleware("http")
async def demo_mode_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    response = await call_next(request)
    
    # Enforce D22 Server-side Demo-mode Header
    if settings.DEMO_MODE:
        response.headers["X-SchedBridge-Mode"] = "demo"
    response.headers["X-Request-Id"] = request_id
    return response

# Mount API Routers
api_v1 = settings.API_V1_STR
app.include_router(health_router)
app.include_router(auth_router, prefix=api_v1)
app.include_router(projects_router, prefix=api_v1)
app.include_router(schedules_router, prefix=api_v1)
app.include_router(events_router, prefix=api_v1)
app.include_router(matching_router, prefix=api_v1)
app.include_router(voice_router, prefix=api_v1)
app.include_router(extraction_router, prefix=api_v1)
app.include_router(ingest_router, prefix=api_v1)
app.include_router(export_router, prefix=api_v1)
app.include_router(analytics_router, prefix=api_v1)
app.include_router(audit_router, prefix=api_v1)
app.include_router(notifications_router, prefix=api_v1)
app.include_router(admin_router, prefix=api_v1)
app.include_router(time_agent_router, prefix=api_v1)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
