from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "QuickFace API"
    environment: str = Field("development", env="ENVIRONMENT")

    # Database
    database_url: str = Field(
        "postgresql+psycopg2://quickface:quickface@db:5432/quickface",
        env="DATABASE_URL",
    )

    # Redis / Celery
    redis_url: str = Field("redis://redis:6379/0", env="REDIS_URL")

    # Object storage — Cloudflare R2 (S3-compatible)
    # Endpoint format: https://<account_id>.r2.cloudflarestorage.com
    storage_endpoint: str = Field(
        "https://<account_id>.r2.cloudflarestorage.com",
        env="STORAGE_ENDPOINT",
    )
    storage_access_key: str = Field(..., env="STORAGE_ACCESS_KEY")
    storage_secret_key: str = Field(..., env="STORAGE_SECRET_KEY")
    storage_bucket: str = Field("quickface-photos", env="STORAGE_BUCKET")

    # Optional: set this to your R2 custom domain or public bucket URL
    # so that photo URLs are permanent links instead of presigned URLs.
    # Example: https://photos.yourdomain.com
    r2_public_domain: str | None = Field(None, env="R2_PUBLIC_DOMAIN")

    # CORS / frontend
    cors_origins: List[AnyHttpUrl] = Field(default_factory=list, env="CORS_ORIGINS")

    # Frontend base URL (optional, used mainly by Next.js)
    next_public_api_base: str | None = Field(None, env="NEXT_PUBLIC_API_BASE")

    # Upload constraints
    max_file_size_mb: int = Field(50, env="MAX_FILE_SIZE_MB")  # Per file
    max_upload_batch_mb: int = Field(500, env="MAX_UPLOAD_BATCH_MB")  # Per request

    # Search constraints
    max_search_results: int = Field(500, env="MAX_SEARCH_RESULTS")

    # Database pool
    db_pool_size: int = Field(20, env="DB_POOL_SIZE")
    db_max_overflow: int = Field(10, env="DB_MAX_OVERFLOW")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


