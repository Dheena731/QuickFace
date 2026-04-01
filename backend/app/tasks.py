import logging
from datetime import datetime

from sqlalchemy.orm import Session

from .celery_app import celery_app
from .dependencies import SessionLocal
from .face.processor import extract_face_embeddings
from .models import FaceEmbedding, Photo, PhotoProcessingStatusEnum
from .storage.minio_backend import MinioStorageBackend

logger = logging.getLogger(__name__)


@celery_app.task(name="quickface.process_photo", bind=True, max_retries=3)
def process_photo(self, photo_id: int) -> None:
    """Process a photo: extract faces and store embeddings."""
    db: Session = SessionLocal()
    storage = MinioStorageBackend()
    try:
        logger.info(f"Starting photo processing: photo_id={photo_id}")
        
        photo: Photo | None = db.query(Photo).filter(Photo.id == photo_id).first()
        if photo is None:
            logger.warning(f"Photo not found for processing: photo_id={photo_id}")
            return

        photo.processing_status = PhotoProcessingStatusEnum.PROCESSING.value
        db.commit()
        logger.debug(f"Photo marked as PROCESSING: photo_id={photo_id}")

        # Retrieve photo from storage
        image_bytes = storage.open(photo.storage_key)
        logger.debug(f"Retrieved photo from storage: {photo.storage_key}, size={len(image_bytes)} bytes")

        # Extract face embeddings
        faces = extract_face_embeddings(image_bytes)
        logger.info(f"Extracted {len(faces)} faces from photo_id={photo_id}")

        if not faces:
            photo.processing_status = PhotoProcessingStatusEnum.NO_FACES.value
            photo.processed_at = datetime.utcnow()
            db.commit()
            logger.info(f"No faces found in photo_id={photo_id}")
            return

        # Store embeddings
        for idx, face in enumerate(faces):
            embedding = FaceEmbedding(
                event_id=photo.event_id,
                photo_id=photo.id,
                face_index=idx,
                embedding=face.embedding,
                bbox=face.bbox,
            )
            db.add(embedding)
            logger.debug(f"Added embedding for face {idx} in photo_id={photo_id}")

        photo.processing_status = PhotoProcessingStatusEnum.PROCESSED.value
        photo.processed_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Successfully processed photo_id={photo_id} with {len(faces)} faces")
        
    except Exception as exc:
        logger.exception(
            f"Error processing photo_id={photo_id}, attempt {self.request.retries + 1}/{self.max_retries}",
            extra={"task_id": self.request.id, "photo_id": photo_id}
        )
        
        try:
            db.rollback()
            photo = db.query(Photo).filter(Photo.id == photo_id).first()
            if photo is not None:
                photo.processing_status = PhotoProcessingStatusEnum.FAILED.value
                db.commit()
                logger.info(f"Photo marked as FAILED: photo_id={photo_id}")
        except Exception as cleanup_exc:
            logger.exception(f"Error updating photo status during cleanup: photo_id={photo_id}")
            db.rollback()
        
        # Retry with exponential backoff
        if self.request.retries < self.max_retries:
            countdown = 2 ** self.request.retries  # 1s, 2s, 4s
            logger.info(f"Retrying photo_id={photo_id} in {countdown}s")
            raise self.retry(exc=exc, countdown=countdown)
        else:
            logger.error(f"Max retries exceeded for photo_id={photo_id}")
    
    finally:
        db.close()


