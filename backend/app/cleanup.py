"""Cleanup tasks for stale or orphaned photos."""

import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .celery_app import celery_app
from .dependencies import SessionLocal
from .models import Photo, PhotoProcessingStatusEnum

logger = logging.getLogger(__name__)


@celery_app.task(name="quickface.cleanup_stale_photos")
def cleanup_stale_photos(hours: int = 24) -> dict:
    """
    Mark photos as FAILED if they've been PENDING for more than the specified hours.
    
    This prevents orphaned photos from staying in a pending state indefinitely
    if their processing task crashed or was lost.
    
    Args:
        hours: Number of hours after which to mark pending photos as failed (default: 24)
    
    Returns:
        Dictionary with cleanup statistics
    """
    
    db: Session = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        logger.info(f"Starting cleanup of stale photos (pending for >{hours} hours)")
        
        stale = db.query(Photo).filter(
            Photo.processing_status == PhotoProcessingStatusEnum.PENDING.value,
            Photo.created_at < cutoff,
        ).all()
        
        logger.info(f"Found {len(stale)} stale photos to cleanup")
        
        for photo in stale:
            logger.warning(
                f"Marking stale photo as FAILED: photo_id={photo.id}, "
                f"created_at={photo.created_at}, event_id={photo.event_id}"
            )
            photo.processing_status = PhotoProcessingStatusEnum.FAILED.value
            db.add(photo)
        
        db.commit()
        logger.info(f"Cleanup complete: marked {len(stale)} photos as FAILED")
        
        return {
            "cleaned": len(stale),
            "cutoff_hours": hours,
            "cutoff_datetime": cutoff.isoformat(),
        }
    
    except Exception as exc:
        logger.exception("Error during stale photo cleanup")
        db.rollback()
        raise
    
    finally:
        db.close()


@celery_app.task(name="quickface.cleanup_failed_photos")
def cleanup_failed_photos(days: int = 30) -> dict:
    """
    Delete photos marked as FAILED if they're older than the specified days.
    
    This helps manage disk space by removing permanently failed uploads.
    
    Args:
        days: Number of days after which to delete failed photos (default: 30)
    
    Returns:
        Dictionary with cleanup statistics
    """
    
    db: Session = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        logger.info(f"Starting cleanup of old failed photos (>{days} days old)")
        
        failed = db.query(Photo).filter(
            Photo.processing_status == PhotoProcessingStatusEnum.FAILED.value,
            Photo.created_at < cutoff,
        ).all()
        
        logger.info(f"Found {len(failed)} old failed photos to delete")
        
        for photo in failed:
            logger.warning(
                f"Deleting old failed photo: photo_id={photo.id}, "
                f"created_at={photo.created_at}, event_id={photo.event_id}"
            )
            db.delete(photo)
        
        db.commit()
        logger.info(f"Cleanup complete: deleted {len(failed)} old failed photos")
        
        return {
            "deleted": len(failed),
            "cutoff_days": days,
            "cutoff_datetime": cutoff.isoformat(),
        }
    
    except Exception as exc:
        logger.exception("Error during failed photo cleanup")
        db.rollback()
        raise
    
    finally:
        db.close()
