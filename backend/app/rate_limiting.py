"""Rate limiting middleware using slowapi."""

import logging
from typing import Optional

from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)


def setup_rate_limiting(app: FastAPI) -> Limiter:
    """Setup rate limiting for the FastAPI app."""
    
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    logger.info("Rate limiting configured with slowapi")
    
    return limiter
