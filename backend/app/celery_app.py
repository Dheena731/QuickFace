from celery import Celery
from celery.schedules import crontab

from .config import get_settings


settings = get_settings()

celery_app = Celery(
    "quickface",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_default_queue="quickface",
    beat_schedule={
        # Mark photos stuck in PENDING for >24 h as FAILED — runs every hour
        "cleanup-stale-photos-hourly": {
            "task": "quickface.cleanup_stale_photos",
            "schedule": crontab(minute=0),  # top of every hour
            "kwargs": {"hours": 24},
        },
        # Delete FAILED photos older than 30 days — runs daily at 03:00 UTC
        "cleanup-failed-photos-daily": {
            "task": "quickface.cleanup_failed_photos",
            "schedule": crontab(hour=3, minute=0),
            "kwargs": {"days": 30},
        },
    },
    beat_scheduler="celery.beat:PersistentScheduler",
)

