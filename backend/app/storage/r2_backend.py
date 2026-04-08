from __future__ import annotations

import logging
from typing import BinaryIO

import boto3
from botocore.config import Config

from ..config import get_settings
from .base import StorageBackend

logger = logging.getLogger(__name__)


class R2StorageBackend(StorageBackend):
    """
    Cloudflare R2 storage backend.

    R2 is an S3-compatible object store, so we talk to it using boto3
    with a custom endpoint URL pointing at the account-specific R2 endpoint:
        https://<account_id>.r2.cloudflarestorage.com

    If ``r2_public_domain`` is configured (a Cloudflare custom domain or the
    R2 public bucket URL), public object URLs are built from that base instead
    of generating short-lived presigned URLs.
    """

    def __init__(self) -> None:
        settings = get_settings()

        self._client = boto3.client(
            "s3",
            endpoint_url=settings.storage_endpoint,
            aws_access_key_id=settings.storage_access_key,
            aws_secret_access_key=settings.storage_secret_key,
            # R2 treats region as "auto"; boto3 still needs *a* value here
            region_name="auto",
            config=Config(signature_version="s3v4"),
        )
        self._bucket = settings.storage_bucket
        self._public_domain: str | None = settings.r2_public_domain

        logger.info(
            "R2StorageBackend initialised",
            extra={
                "endpoint": settings.storage_endpoint,
                "bucket": self._bucket,
                "public_domain": self._public_domain,
            },
        )

    # ------------------------------------------------------------------
    # StorageBackend interface
    # ------------------------------------------------------------------

    def upload(self, file_obj: BinaryIO, key: str, content_type: str | None = None) -> str:
        """Stream *file_obj* to R2 under *key*.  Returns the key on success."""
        extra_args: dict = {}
        if content_type:
            extra_args["ContentType"] = content_type

        self._client.upload_fileobj(
            file_obj,
            self._bucket,
            key,
            ExtraArgs=extra_args or None,
        )
        logger.debug("Uploaded object to R2: bucket=%s key=%s", self._bucket, key)
        return key

    def get_url(self, key: str) -> str:
        """Return a publicly-accessible URL for *key*.

        - If ``r2_public_domain`` is set, returns a permanent URL via that
          custom domain (no expiry, no signing overhead).
        - Otherwise returns a presigned URL valid for 12 hours.
        """
        if self._public_domain:
            url = f"{self._public_domain.rstrip('/')}/{key}"
            logger.debug("Returning public domain URL: %s", url)
            return url

        url = self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=43_200,  # 12 hours
        )
        logger.debug("Generated presigned URL for key=%s", key)
        return url

    def open(self, key: str) -> bytes:
        """Download and return the full contents of *key* as bytes."""
        response = self._client.get_object(Bucket=self._bucket, Key=key)
        data: bytes = response["Body"].read()
        logger.debug("Read %d bytes from R2 key=%s", len(data), key)
        return data

    def delete(self, key: str) -> None:
        """Permanently delete *key* from the bucket."""
        self._client.delete_object(Bucket=self._bucket, Key=key)
        logger.debug("Deleted R2 object: key=%s", key)
