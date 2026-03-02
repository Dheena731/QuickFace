import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import models
from ..dependencies import get_db
from ..storage.minio_backend import MinioStorageBackend

router = APIRouter()


@router.post("/{event_id}")
async def upload_photos(
    event_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    storage = MinioStorageBackend()
    created = []

    for upload in files:
        key = f"events/{event_id}/{uuid.uuid4()}"
        storage.upload(upload.file, key, content_type=upload.content_type)

        photo = models.Photo(
            event_id=event.id,
            storage_key=key,
        )
        db.add(photo)
        created.append(photo)

    db.commit()
    for photo in created:
        db.refresh(photo)

    return {
        "event_id": event_id,
        "uploaded": len(created),
        "photo_ids": [p.id for p in created],
    }


