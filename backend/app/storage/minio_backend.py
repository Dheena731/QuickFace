from __future__ import annotations

from datetime import timedelta
from typing import BinaryIO

from minio import Minio

from ..config import get_settings
from .base import StorageBackend


class MinioStorageBackend(StorageBackend):
    def __init__(self) -> None:
        settings = get_settings()
        endpoint = settings.storage_endpoint.replace("http://", "").replace("https://", "")
        self._client = Minio(
            endpoint=endpoint,
            access_key=settings.storage_access_key,
            secret_key=settings.storage_secret_key,
            secure=settings.storage_secure,
        )
        self._bucket = settings.storage_bucket

    def upload(self, file_obj: BinaryIO, key: str, content_type: str | None = None) -> str:
        length = -1  # stream unknown length
        self._client.put_object(
            self._bucket,
            key,
            data=file_obj,
            length=length,
            part_size=10 * 1024 * 1024,
            content_type=content_type,
        )
        return key

    def get_url(self, key: str) -> str:
        # Use presigned URL for flexibility; MinIO can be exposed via reverse proxy.
        return self._client.presigned_get_object(
            self._bucket,
            key,
            expires=timedelta(hours=12),
        )

    def delete(self, key: str) -> None:
        self._client.remove_object(self._bucket, key)

