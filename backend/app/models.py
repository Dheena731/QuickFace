import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from pgvector.sqlalchemy import Vector


Base = declarative_base()


class EventStatusEnum(str, Enum):  # type: ignore[misc]
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=True)
    starts_at = Column(DateTime, nullable=True)
    ends_at = Column(DateTime, nullable=True)
    status = Column(String(32), nullable=False, default=EventStatusEnum.ACTIVE.value)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    photos = relationship("Photo", back_populates="event")


class PhotoProcessingStatusEnum(str, Enum):  # type: ignore[misc]
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    NO_FACES = "no_faces"
    FAILED = "failed"


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    storage_key = Column(String(512), nullable=False, unique=True)
    public_url = Column(String(1024), nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    processing_status = Column(
        String(32), nullable=False, default=PhotoProcessingStatusEnum.PENDING.value
    )
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    event = relationship("Event", back_populates="photos")
    faces = relationship("FaceEmbedding", back_populates="photo")


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False)
    face_index = Column(Integer, nullable=False)
    embedding = Column(Vector(128), nullable=False)
    bbox = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    photo = relationship("Photo", back_populates="faces")

