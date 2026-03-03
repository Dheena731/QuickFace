from datetime import datetime

from sqlalchemy.orm import Session

from .celery_app import celery_app
from .dependencies import SessionLocal
from .face.processor import extract_face_embeddings
from .models import FaceEmbedding, Photo, PhotoProcessingStatusEnum
from .storage.minio_backend import MinioStorageBackend


@celery_app.task(name="quickface.process_photo")
def process_photo(photo_id: int) -> None:
    db: Session = SessionLocal()
    storage = MinioStorageBackend()
    try:
        photo: Photo | None = db.query(Photo).filter(Photo.id == photo_id).first()
        if photo is None:
            return

        photo.processing_status = PhotoProcessingStatusEnum.PROCESSING.value
        db.commit()

        image_bytes = storage.open(photo.storage_key)
        faces = extract_face_embeddings(image_bytes)

        if not faces:
            photo.processing_status = PhotoProcessingStatusEnum.NO_FACES.value
            photo.processed_at = datetime.utcnow()
            db.commit()
            return

        for idx, face in enumerate(faces):
            embedding = FaceEmbedding(
                event_id=photo.event_id,
                photo_id=photo.id,
                face_index=idx,
                embedding=face.embedding,
                bbox=face.bbox,
            )
            db.add(embedding)

        photo.processing_status = PhotoProcessingStatusEnum.PROCESSED.value
        photo.processed_at = datetime.utcnow()
        db.commit()
    except Exception:
        db.rollback()
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if photo is not None:
            photo.processing_status = PhotoProcessingStatusEnum.FAILED.value
            db.commit()
    finally:
        db.close()

