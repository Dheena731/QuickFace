from fastapi import APIRouter, UploadFile


router = APIRouter()


@router.post("/{event_id}")
async def search_by_selfie(event_id: str, file: UploadFile):
    # Placeholder implementation for MVP skeleton; real logic will be added later.
    return {"event_id": event_id, "matches": []}

