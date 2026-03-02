from fastapi import FastAPI

from .routes import event, upload, search


def create_app() -> FastAPI:
    app = FastAPI(title="QuickFace API", version="0.1.0")

    @app.get("/health", tags=["health"])
    async def health() -> dict:
        return {"status": "ok"}

    app.include_router(event.router, prefix="/api/v1/events", tags=["events"])
    app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])
    app.include_router(search.router, prefix="/api/v1/search", tags=["search"])

    return app


app = create_app()

