from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class EventCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class EventOut(BaseModel):
    id: UUID
    name: str
    slug: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        orm_mode = True


class PhotoOut(BaseModel):
    id: int
    event_id: UUID
    public_url: Optional[HttpUrl] = None

    class Config:
        orm_mode = True


class SearchResultPhoto(BaseModel):
    photo: PhotoOut
    similarity: float


class SearchResponse(BaseModel):
    results: List[SearchResultPhoto]

