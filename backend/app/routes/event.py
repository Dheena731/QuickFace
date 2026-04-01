import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=schemas.EventOut, status_code=status.HTTP_201_CREATED)
def create_event(payload: schemas.EventCreate, db: Session = Depends(get_db)):
    """Create a new event."""
    
    logger.info(f"Creating event: {payload.name}")
    
    event = models.Event(
        name=payload.name,
        slug=payload.slug,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
    db.add(event)
    
    try:
        db.commit()
        db.refresh(event)
        logger.info(f"Event created successfully: id={event.id}, name={event.name}")
        return event
    except Exception as exc:
        logger.exception(f"Error creating event: {payload.name}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create event"
        )


@router.get("/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: str, db: Session = Depends(get_db)):
    """Get event details by ID."""
    
    logger.debug(f"Fetching event: {event_id}")
    
    try:
        # Try to parse as UUID for better validation
        UUID(event_id)
    except ValueError:
        logger.warning(f"Invalid event ID format: {event_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID format (must be valid UUID)"
        )
    
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        logger.warning(f"Event not found: {event_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    logger.debug(f"Event found: {event.id}")
    return event


