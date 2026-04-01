import logging
import logging.handlers
from pathlib import Path


def setup_logging(log_dir: str = "logs", log_level: str = "INFO") -> None:
    """Configure logging with file and console handlers."""
    
    # Create logs directory
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        log_path / "quickface.log",
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setLevel(log_level)
    file_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s"
    )
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)
    
    # Task-specific logger
    task_handler = logging.handlers.RotatingFileHandler(
        log_path / "tasks.log",
        maxBytes=10485760,
        backupCount=10
    )
    task_handler.setLevel(log_level)
    task_handler.setFormatter(file_formatter)
    
    task_logger = logging.getLogger("quickface.tasks")
    task_logger.addHandler(task_handler)
