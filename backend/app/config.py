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

    # Object storage (MinIO or S3-compatible)
    storage_endpoint: str = Field("http://minio:9000", env="STORAGE_ENDPOINT")
    storage_access_key: str = Field("minioadmin", env="STORAGE_ACCESS_KEY")
    storage_secret_key: str = Field("minioadmin", env="STORAGE_SECRET_KEY")
    storage_bucket: str = Field("quickface-photos", env="STORAGE_BUCKET")
    storage_secure: bool = Field(False, env="STORAGE_SECURE")

    # CORS / frontend
    cors_origins: List[AnyHttpUrl] = Field(default_factory=list, env="CORS_ORIGINS")

    # Frontend base URL (optional, used mainly by Next.js)
    next_public_api_base: str | None = Field(None, env="NEXT_PUBLIC_API_BASE")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

