import logging
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import models
from ..config import get_settings
from ..dependencies import get_db
from ..storage.minio_backend import MinioStorageBackend
from ..tasks import process_photo

logger = logging.getLogger(__name__)
router = APIRouter()

settings = get_settings()

# Upload size limits
MAX_FILE_SIZE = settings.max_file_size_mb * 1024 * 1024  # Convert MB to bytes
MAX_BATCH_SIZE = settings.max_upload_batch_mb * 1024 * 1024


@router.post("/{event_id}")
async def upload_photos(
    event_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload photos to an event.
    
    - Max file size per photo: 50MB (configurable via MAX_FILE_SIZE_MB)
    - Max total batch: 500MB (configurable via MAX_UPLOAD_BATCH_MB)
    """
    
    # Verify event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        logger.warning(f"Upload attempt to non-existent event: {event_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    storage = MinioStorageBackend()
    created = []
    uploaded_keys = []

    try:
        # Validate file sizes before uploading
        logger.info(f"Validating {len(files)} files for event {event_id}")
        total_size = 0
        
        for i, upload in enumerate(files):
            # Read file to check size
            file_content = await upload.read()
            file_size = len(file_content)
            
            # Validate individual file size
            if file_size > MAX_FILE_SIZE:
                logger.warning(
                    f"File too large: {upload.filename} ({file_size / (1024*1024):.1f}MB, "
                    f"max: {MAX_FILE_SIZE / (1024*1024):.1f}MB)"
                )
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File '{upload.filename}' exceeds {MAX_FILE_SIZE / (1024*1024):.0f}MB limit"
                )
            
            total_size += file_size
        
        # Validate batch size
        if total_size > MAX_BATCH_SIZE:
            logger.warning(
                f"Batch too large: {total_size / (1024*1024):.1f}MB "
                f"(max: {MAX_BATCH_SIZE / (1024*1024):.1f}MB)"
            )
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Total upload size {total_size / (1024*1024):.1f}MB exceeds {MAX_BATCH_SIZE / (1024*1024):.0f}MB limit"
            )
        
        # Reset file pointers for actual upload
        for upload in files:
            await upload.seek(0)
        
        # Upload all files first, before creating DB records
        logger.info(f"Uploading {len(files)} files to event {event_id}")
        
        for upload in files:
            key = f"events/{event_id}/{uuid.uuid4()}"
            
            try:
                file_content = await upload.read()
                await upload.seek(0)
                
                # Upload to storage
                storage.upload(upload.file, key, content_type=upload.content_type)
                uploaded_keys.append(key)
                logger.debug(f"Uploaded file to storage: {key}")
                
            except Exception as e:
                logger.error(f"Storage upload failed for {key}: {str(e)}")
                
                # Cleanup already uploaded files
                for uploaded_key in uploaded_keys:
                    try:
                        storage.delete(uploaded_key)
                        logger.debug(f"Cleaned up orphaned file: {uploaded_key}")
                    except Exception as cleanup_err:
                        logger.error(f"Failed to cleanup {uploaded_key}: {cleanup_err}")
                
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Storage upload failed: {str(e)}"
                )
        
        # Only create DB records AFTER all uploads succeed
        logger.info(f"Creating {len(files)} photo records in database")
        
        for key in uploaded_keys:
            photo = models.Photo(
                event_id=event.id,
                storage_key=key,
            )
            db.add(photo)
            created.append(photo)
        
        # Commit all DB records together
        db.commit()
        logger.info(f"Committed {len(created)} photo records to database")
        
        # Enqueue processing tasks AFTER DB commit
        logger.info(f"Enqueueing {len(created)} photo processing tasks")
        
        for photo in created:
            db.refresh(photo)
            process_photo.delay(photo.id)
            logger.debug(f"Enqueued processing task for photo {photo.id}")
        
        logger.info(f"Successfully uploaded {len(created)} photos to event {event_id}")
        
        return {
            "event_id": event_id,
            "uploaded": len(created),
            "photo_ids": [p.id for p in created],
        }
    
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    
    except Exception as exc:
        # Cleanup on unexpected errors
        logger.exception(f"Unexpected error during upload to event {event_id}")
        db.rollback()
        
        for key in uploaded_keys:
            try:
                storage.delete(key)
                logger.debug(f"Cleaned up orphaned file after error: {key}")
            except Exception as cleanup_err:
                logger.error(f"Failed cleanup of {key}: {cleanup_err}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Upload failed due to server error"
        )



