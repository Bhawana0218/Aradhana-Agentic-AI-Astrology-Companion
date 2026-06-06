import time
import hashlib
import json

_CACHE: dict[str, tuple[float, object]] = {}
_MAX_SIZE = 200


def _make_key(prefix: str, *args) -> str:
    raw = prefix + "|" + "|".join(str(a) for a in args)
    return hashlib.md5(raw.encode()).hexdigest()


def get(key: str) -> object | None:
    entry = _CACHE.get(key)
    if entry is None:
        return None
    _ts, value = entry
    return value


def set(key: str, value: object, ttl_seconds: int = 0) -> None:
    if len(_CACHE) >= _MAX_SIZE:
        evict_count = _MAX_SIZE // 4
        for k in list(_CACHE.keys())[:evict_count]:
            _CACHE.pop(k, None)
    expires = (time.time() + ttl_seconds) if ttl_seconds > 0 else 0.0
    _CACHE[key] = (expires, value)


def is_expired(key: str) -> bool:
    entry = _CACHE.get(key)
    if entry is None:
        return True
    ts, _ = entry
    if ts == 0.0:
        return False
    return time.time() > ts


def cached(prefix: str, ttl_seconds: int = 0):
    def decorator(func):
        def wrapper(*args, **kwargs):
            key = _make_key(prefix, args, sorted(kwargs.items()))
            if not is_expired(key):
                val = get(key)
                if val is not None:
                    return val
            result = func(*args, **kwargs)
            set(key, result, ttl_seconds)
            return result
        return wrapper
    return decorator
