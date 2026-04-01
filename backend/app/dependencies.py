from typing import Generator

from sqlalchemy import create_engine, pool
from sqlalchemy.orm import Session, sessionmaker

from .config import get_settings


settings = get_settings()

engine = create_engine(
    settings.database_url,
    future=True,
    poolclass=pool.QueuePool,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_pre_ping=True,        # Verify connections before use
    pool_recycle=3600,         # Recycle connections every hour
    echo=False,                # Set to True for SQL debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


