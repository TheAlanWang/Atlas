import os
import threading
import time
from dataclasses import dataclass
from typing import Iterable
from urllib.parse import urlparse

from fastapi import Request

DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:3000",
    "https://thealanwang.xyz",
    "https://www.thealanwang.xyz",
)
DEFAULT_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000
DEFAULT_RATE_LIMIT_MAX_REQUESTS = 10


@dataclass(frozen=True)
class RequestGuardFailure:
    error: str
    status_code: int
    headers: dict[str, str] | None = None


_rate_limit_buckets: dict[str, list[float]] = {}
_rate_limit_lock = threading.Lock()


def _parse_positive_int(raw_value: str | None, fallback: int) -> int:
    if not raw_value:
        return fallback

    try:
        parsed = int(raw_value)
    except ValueError:
        return fallback

    return parsed if parsed > 0 else fallback


def _allowed_origins() -> set[str]:
    configured = [
        origin.strip()
        for origin in os.getenv("CHAT_ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    ]
    return set(configured or DEFAULT_ALLOWED_ORIGINS)


def _rate_limit_window_ms() -> int:
    return _parse_positive_int(
        os.getenv("CHAT_RATE_LIMIT_WINDOW_MS"),
        DEFAULT_RATE_LIMIT_WINDOW_MS,
    )


def _rate_limit_max_requests() -> int:
    return _parse_positive_int(
        os.getenv("CHAT_RATE_LIMIT_MAX_REQUESTS"),
        DEFAULT_RATE_LIMIT_MAX_REQUESTS,
    )


def _request_origin(request: Request) -> str | None:
    origin = request.headers.get("origin")
    if origin:
        return origin.strip()

    referer = request.headers.get("referer")
    if not referer:
        return None

    parsed = urlparse(referer)
    if not parsed.scheme or not parsed.netloc:
        return None

    return f"{parsed.scheme}://{parsed.netloc}"


def _forwarded_ip_candidates(request: Request) -> Iterable[str]:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        for candidate in forwarded_for.split(","):
            stripped = candidate.strip()
            if stripped:
                yield stripped

    for header_name in ("x-real-ip", "cf-connecting-ip"):
        header_value = request.headers.get(header_name, "").strip()
        if header_value:
            yield header_value


def _client_ip(request: Request) -> str:
    forwarded_ip = next(iter(_forwarded_ip_candidates(request)), None)
    if forwarded_ip:
        return forwarded_ip

    if request.client and request.client.host:
        return request.client.host

    return "unknown"


def _cleanup_expired_buckets(now_ms: float, window_ms: int) -> None:
    cutoff = now_ms - window_ms
    expired_keys: list[str] = []

    for key, timestamps in _rate_limit_buckets.items():
        active = [timestamp for timestamp in timestamps if timestamp > cutoff]
        if active:
            _rate_limit_buckets[key] = active
        else:
            expired_keys.append(key)

    for key in expired_keys:
        _rate_limit_buckets.pop(key, None)


def _consume_rate_limit(ip: str, now_ms: float) -> tuple[bool, int]:
    window_ms = _rate_limit_window_ms()
    max_requests = _rate_limit_max_requests()
    cutoff = now_ms - window_ms

    with _rate_limit_lock:
        if len(_rate_limit_buckets) > 2000:
            _cleanup_expired_buckets(now_ms, window_ms)

        timestamps = [
            timestamp
            for timestamp in _rate_limit_buckets.get(ip, [])
            if timestamp > cutoff
        ]

        if len(timestamps) >= max_requests:
            retry_after_ms = max(0, int(timestamps[0] + window_ms - now_ms))
            _rate_limit_buckets[ip] = timestamps
            return False, retry_after_ms

        timestamps.append(now_ms)
        _rate_limit_buckets[ip] = timestamps
        return True, 0


def guard_chat_request(request: Request) -> RequestGuardFailure | None:
    # origin = _request_origin(request)
    # if not origin or origin not in _allowed_origins():
    #     return RequestGuardFailure(
    #         status_code=403,
    #         error="Chat requests are only allowed from approved Atlas origins.",
    #     )

    allowed, retry_after_ms = _consume_rate_limit(
        _client_ip(request), time.time() * 1000
    )
    if allowed:
        return None

    return RequestGuardFailure(
        status_code=429,
        error="Chat rate limit exceeded. Please try again in a few minutes.",
        headers={
            "Retry-After": str(max(1, (retry_after_ms + 999) // 1000)),
        },
    )


def reset_rate_limit_state() -> None:
    with _rate_limit_lock:
        _rate_limit_buckets.clear()
