import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .logging_config import setup_logging
from .routes import event, upload, search

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(title="QuickFace API", version="0.1.0")
    settings = get_settings()

    # Add CORS middleware
    allowed_origins = [
        "http://localhost:3000",       # Local dev frontend
        "http://localhost:8000",       # Local dev API
        "http://localhost:9001",       # MinIO console
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
    
    # Add configured origins from env
    if settings.cors_origins:
        allowed_origins.extend([str(o) for o in settings.cors_origins])
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    logger.info(f"CORS enabled for origins: {allowed_origins}")

    @app.get("/health", tags=["health"])
    async def health() -> dict:
        return {"status": "ok"}

    app.include_router(event.router, prefix="/api/v1/events", tags=["events"])
    app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])
    app.include_router(search.router, prefix="/api/v1/search", tags=["search"])

    logger.info("QuickFace API initialized successfully")
    return app


app = create_app()

