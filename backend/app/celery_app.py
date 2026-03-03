from celery import Celery

from .config import get_settings


settings = get_settings()

celery_app = Celery(
    "quickface",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_default_queue="quickface",
)

