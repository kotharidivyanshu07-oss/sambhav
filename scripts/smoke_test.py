"""
Smoke test for the ABTalks Autonomous Persona Agent API.

Run this against a locally running server (uvicorn api.index:app --reload)
to sanity-check that both required endpoints behave per the spec:

    python scripts/smoke_test.py
    python scripts/smoke_test.py --base-url https://your-project.vercel.app

It does NOT wait for a real publish cycle (that takes 5+ minutes) — it
checks structural correctness: status codes, required fields, correct
types, and that an unknown agentId is rejected. For an end-to-end check
that a real post gets published, poll /api/agent/feed manually a few
minutes after /api/agent/init.
"""
from __future__ import annotations
import argparse
import sys
import uuid

import httpx


def check(label: str, condition: bool, detail: str = "") -> bool:
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f" — {detail}" if detail and not condition else ""))
    return condition


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    args = parser.parse_args()

    base = args.base_url.rstrip("/")
    all_ok = True

    # 1. init with a valid persona
    resp = httpx.post(
        f"{base}/api/agent/init",
        json={"persona": {"name": "Ada", "domain": "AI Security"}},
        timeout=10.0,
    )
    all_ok &= check("POST /api/agent/init returns 200", resp.status_code == 200, str(resp.status_code))
    body = resp.json()
    all_ok &= check("init response has agentId", "agentId" in body, str(body))
    agent_id = body.get("agentId", "")
    all_ok &= check("agentId looks like a UUID", len(agent_id) >= 32, agent_id)

    # 2. feed for a fresh agent — should be empty, not an instant dump
    resp = httpx.get(f"{base}/api/agent/feed", params={"agentId": agent_id}, timeout=10.0)
    all_ok &= check("GET /api/agent/feed returns 200", resp.status_code == 200, str(resp.status_code))
    body = resp.json()
    all_ok &= check("feed response has 'posts' key", "posts" in body, str(body))
    all_ok &= check(
        "fresh agent's feed starts empty (no instant dump)",
        body.get("posts") == [],
        str(body.get("posts")),
    )

    # 3. unknown agentId should be rejected, not silently return an empty feed
    fake_id = str(uuid.uuid4())
    resp = httpx.get(f"{base}/api/agent/feed", params={"agentId": fake_id}, timeout=10.0)
    all_ok &= check(
        "unknown agentId is rejected (404)",
        resp.status_code == 404,
        f"got {resp.status_code}: {resp.text}",
    )

    # 4. malformed init request should be rejected, not silently accepted
    resp = httpx.post(f"{base}/api/agent/init", json={"persona": {"name": "Ada"}}, timeout=10.0)
    all_ok &= check(
        "init without a domain is rejected (422)",
        resp.status_code == 422,
        f"got {resp.status_code}",
    )

    print()
    print("ALL CHECKS PASSED" if all_ok else "SOME CHECKS FAILED — see above")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
