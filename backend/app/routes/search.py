from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_db
from ..face.processor import extract_single_embedding


router = APIRouter()


@router.post("/{event_id}", response_model=schemas.SearchResponse)
async def search_by_selfie(
    event_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    top_k: int = 50,
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    image_bytes = await file.read()
    embedding = extract_single_embedding(image_bytes)
    if embedding is None:
        return schemas.SearchResponse(results=[])

    distance_col = models.FaceEmbedding.embedding.cosine_distance(embedding).label("distance")
    stmt = (
        select(models.FaceEmbedding, distance_col)
        .where(models.FaceEmbedding.event_id == event.id)
        .order_by(distance_col)
        .limit(top_k)
    )

    rows = db.execute(stmt).all()
    if not rows:
        return schemas.SearchResponse(results=[])

    # Collect unique photos, keeping best (lowest) distance per photo
    best_by_photo: dict[int, float] = {}
    for face, distance in rows:
        current = best_by_photo.get(face.photo_id)
        if current is None or distance < current:
            best_by_photo[face.photo_id] = float(distance)

    photos: List[models.Photo] = (
        db.query(models.Photo)
        .filter(models.Photo.id.in_(list(best_by_photo.keys())))
        .all()
    )

    photo_map = {p.id: p for p in photos}
    results: List[schemas.SearchResultPhoto] = []
    for photo_id, distance in sorted(best_by_photo.items(), key=lambda x: x[1]):
        photo = photo_map.get(photo_id)
        if not photo:
            continue
        results.append(
            schemas.SearchResultPhoto(
                photo=schemas.PhotoOut.from_orm(photo),
                similarity=1.0 - distance,
            )
        )

    return schemas.SearchResponse(results=results)


