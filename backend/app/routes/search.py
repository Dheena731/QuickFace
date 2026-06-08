import logging
from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import get_settings
from ..dependencies import get_db
from ..face.processor import extract_single_embedding
from ..rate_limiting import limiter

logger = logging.getLogger(__name__)
router = APIRouter()

settings = get_settings()

# Minimum cosine similarity (0–1) for a result to be included.
# Cosine distance from pgvector is in [0, 2]; similarity = 1 - distance.
_MIN_SIMILARITY = 0.40


@router.post("/{event_id}", response_model=schemas.SearchResponse)
@limiter.limit("30/minute")
async def search_by_selfie(
    request: Request,
    event_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    top_k: Annotated[int, Query(ge=1, le=settings.max_search_results)] = 50,
    min_similarity: Annotated[float, Query(ge=0.0, le=1.0)] = _MIN_SIMILARITY,
):
    """
    Search for matching photos using a selfie.

    - Extracts face embedding from selfie
    - Searches using cosine distance in pgvector
    - Filters results below min_similarity threshold (default 40%)
    - Returns top_k most similar photos, isolated to the event
    """
    
    logger.info(f"Search request for event_id={event_id}, top_k={top_k}, min_similarity={min_similarity}")
    
    # Verify event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        logger.warning(f"Search on non-existent event: {event_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    try:
        # Read and validate selfie
        image_bytes = await file.read()
        logger.debug(f"Received selfie for event {event_id}, size={len(image_bytes)} bytes")
        
        # Extract embedding from selfie
        embedding = extract_single_embedding(image_bytes)
        if embedding is None:
            logger.warning(f"No face detected in selfie for event {event_id}")
            return schemas.SearchResponse(results=[])
        
        logger.debug(f"Extracted embedding from selfie, dim={len(embedding)}")
        
        # Query pgvector for similar faces
        distance_col = models.FaceEmbedding.embedding.cosine_distance(embedding).label("distance")
        stmt = (
            select(models.FaceEmbedding, distance_col)
            .where(models.FaceEmbedding.event_id == event.id)
            .order_by(distance_col)
            .limit(top_k)
        )
        
        rows = db.execute(stmt).all()
        logger.info(f"Found {len(rows)} matching faces for event {event_id}")
        
        if not rows:
            return schemas.SearchResponse(results=[])
        
        # Aggregate by photo: keep best (lowest) distance per photo
        best_by_photo: dict[int, float] = {}
        for face, distance in rows:
            current = best_by_photo.get(face.photo_id)
            if current is None or distance < current:
                best_by_photo[face.photo_id] = float(distance)
        
        logger.debug(f"Aggregated to {len(best_by_photo)} unique photos")
        
        # Hydrate photo objects
        photos: List[models.Photo] = (
            db.query(models.Photo)
            .filter(models.Photo.id.in_(list(best_by_photo.keys())))
            .all()
        )
        
        photo_map = {p.id: p for p in photos}
        results: List[schemas.SearchResultPhoto] = []
        
        # Build results sorted by similarity, dropping low-confidence matches
        for photo_id, distance in sorted(best_by_photo.items(), key=lambda x: x[1]):
            photo = photo_map.get(photo_id)
            if not photo:
                logger.warning(f"Photo {photo_id} not found in hydration")
                continue

            similarity = 1.0 - distance
            if similarity < min_similarity:
                continue

            results.append(
                schemas.SearchResultPhoto(
                    photo=schemas.PhotoOut.from_orm(photo),
                    similarity=similarity,
                )
            )

        logger.info(f"Returning {len(results)} results for event {event_id} (threshold={min_similarity})")
        return schemas.SearchResponse(results=results)
    
    except Exception as exc:
        logger.exception(f"Error during search for event {event_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed due to server error"
        )



