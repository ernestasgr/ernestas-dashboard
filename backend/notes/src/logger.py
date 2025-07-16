"""Logging configuration for the notes service.

This module provides a centralized logging solution that outputs to both console
and Logstash (when configured), following the same pattern as the gateway service.
"""

import json
import logging
import os
import socket
import sys
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import structlog


class LogstashTCPHandler(logging.Handler):
    """Custom handler to send logs to Logstash over TCP."""

    def __init__(self, host: str, port: int):
        super().__init__()
        self.host = host
        self.port = port
        self.sock: Optional[socket.socket] = None

    def _connect(self) -> bool:
        """Establish connection to Logstash."""
        try:
            if self.sock:
                self.sock.close()
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.settimeout(5.0)
            self.sock.connect((self.host, self.port))
            return True
        except (socket.error, OSError) as e:
            print(f"Failed to connect to Logstash at {self.host}:{self.port}: {e}")
            return False

    def emit(self, record: logging.LogRecord) -> None:
        """Send log record to Logstash."""
        try:
            if not self.sock:
                if not self._connect():
                    return

            log_entry = {
                "@timestamp": datetime.now(timezone.utc).isoformat(),
                "level": record.levelname.lower(),
                "message": record.getMessage(),
                "application": "notes",
                "service": "notes",
                "environment": os.getenv("NODE_ENV", "development"),
                "logger": record.name,
            }

            if hasattr(record, "__dict__"):
                for key, value in record.__dict__.items():
                    if key not in [
                        "name",
                        "msg",
                        "args",
                        "levelname",
                        "levelno",
                        "pathname",
                        "filename",
                        "module",
                        "lineno",
                        "funcName",
                        "created",
                        "msecs",
                        "relativeCreated",
                        "thread",
                        "threadName",
                        "processName",
                        "process",
                        "getMessage",
                        "exc_info",
                        "exc_text",
                        "stack_info",
                    ]:
                        log_entry[key] = value

            if record.exc_info:
                log_entry["exception"] = self.format(record)

            message = json.dumps(log_entry) + "\n"
            if self.sock:
                self.sock.sendall(message.encode("utf-8"))

        except (socket.error, OSError, ValueError) as e:
            print(f"Failed to send log to Logstash: {e}")
            if self.sock:
                self.sock.close()
                self.sock = None

    def close(self) -> None:
        """Close the socket connection."""
        if self.sock:
            self.sock.close()
            self.sock = None
        super().close()


def setup_logging() -> structlog.BoundLogger:
    """Set up structured logging for the notes service."""

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

    def console_processor(
        logger: Any, method_name: str, event_dict: Dict[str, Any]
    ) -> str:
        """Format logs for console output."""
        timestamp = datetime.now(timezone.utc).isoformat()
        level = event_dict.pop("level", method_name).upper()
        message = event_dict.pop("event", "")
        service = event_dict.pop("service", "notes")

        extra_fields = ""
        if event_dict:
            extra_fields = " " + json.dumps(event_dict)

        return f"{timestamp} [{service}] {level}: {message}{extra_fields}"

    processors: list[Any] = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if os.getenv("ENABLE_LOGSTASH", "false").lower() == "true":
        logstash_host = os.getenv("LOGSTASH_HOST", "logstash")
        logstash_port = int(os.getenv("LOGSTASH_PORT", "5044"))

        try:
            logstash_handler = LogstashTCPHandler(logstash_host, logstash_port)
            logstash_handler.setLevel(logging.INFO)

            root_logger = logging.getLogger()
            root_logger.addHandler(logstash_handler)

            print(f"Logstash logging enabled: {logstash_host}:{logstash_port}")
        except Exception as e:
            print(f"Failed to set up Logstash logging: {e}")

    structlog.configure(
        processors=processors
        + [
            console_processor,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        context_class=dict,
        cache_logger_on_first_use=True,
    )

    logger = structlog.get_logger("notes")

    return logger


class LogContext:
    """Context manager for adding structured logging context."""

    def __init__(self, logger: structlog.BoundLogger, **kwargs: Any):
        self.logger = logger
        self.context = kwargs
        self.bound_logger: Optional[structlog.BoundLogger] = None

    def __enter__(self) -> structlog.BoundLogger:
        self.bound_logger = self.logger.bind(**self.context)
        return self.bound_logger

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        pass


def create_context_logger(
    logger: structlog.BoundLogger, **context: Any
) -> structlog.BoundLogger:
    """Create a logger with additional context."""
    return logger.bind(**context)


def generate_request_id() -> str:
    """Generate a unique request ID."""
    import random
    import string
    import time

    timestamp = int(time.time() * 1000)
    random_suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=7))
    return f"req_{timestamp}_{random_suffix}"


logger = setup_logging()

__all__ = [
    "logger",
    "create_context_logger",
    "generate_request_id",
    "LogContext",
    "setup_logging",
]
