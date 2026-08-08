"""
Persistence layer.

Vercel's Python functions are stateless between invocations, so "memory"
(previously published posts + scheduling state) has to live somewhere
external. We use Upstash Redis over its REST API — this is exactly what
Vercel KV provisions under the hood, so `vercel env pull` on a project with
a KV store attached gives you these two env vars for free:

    KV_REST_API_URL
    KV_REST_API_TOKEN

If those aren't set (e.g. running locally without a KV store attached), we
fall back to a plain in-process dict. That's fine for local testing but will
NOT persist across separate serverless invocations — see README for setup.
"""
from __future__ import annotations
import json
import os
from typing import Optional

import httpx

_KV_URL = os.environ.get("KV_REST_API_URL")
_KV_TOKEN = os.environ.get("KV_REST_API_TOKEN")

_memory_store: dict = {}


def _kv_configured() -> bool:
    return bool(_KV_URL and _KV_TOKEN)


def get(key: str) -> Optional[dict]:
    if not _kv_configured():
        raw = _memory_store.get(key)
        return json.loads(raw) if raw else None
    resp = httpx.get(
        f"{_KV_URL}/get/{key}",
        headers={"Authorization": f"Bearer {_KV_TOKEN}"},
        timeout=8.0,
    )
    resp.raise_for_status()
    result = resp.json().get("result")
    return json.loads(result) if result else None


def set(key: str, value: dict) -> None:
    payload = json.dumps(value)
    if not _kv_configured():
        _memory_store[key] = payload
        return
    resp = httpx.post(
        f"{_KV_URL}/set/{key}",
        headers={"Authorization": f"Bearer {_KV_TOKEN}"},
        content=payload,
        timeout=8.0,
    )
    resp.raise_for_status()


def is_persistent() -> bool:
    return _kv_configured()
