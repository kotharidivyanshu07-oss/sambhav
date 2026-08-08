from __future__ import annotations
import sys
from pathlib import Path

# Allow `from lib import ...` when Vercel invokes this file directly.
sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from lib import agent as agent_module
from lib.models import InitRequest, InitResponse, FeedResponse

app = FastAPI(title="ABTalks Autonomous Persona Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/agent/init", response_model=InitResponse)
def init_agent(body: InitRequest) -> InitResponse:
    agent_id = agent_module.create_agent(body.persona.name, body.persona.domain)
    return InitResponse(agentId=agent_id)


@app.get("/api/agent/feed", response_model=FeedResponse)
def get_feed(agentId: str = Query(...)) -> FeedResponse:
    state = agent_module.get_agent(agentId)
    if state is None:
        raise HTTPException(status_code=404, detail="unknown agentId")

    state = agent_module.maybe_publish(state)
    return FeedResponse(posts=agent_module.public_posts(state))


@app.get("/api/agent/tick")
def tick(agentId: str | None = Query(default=None)):
    """Optional push-style endpoint for an external scheduler (Vercel Pro Cron,
    cron-job.org, GitHub Actions schedule, etc.) to hit periodically so
    publishing can happen even if nobody is polling the feed. Not required by
    the challenge spec, but keeps the agent genuinely autonomous end-to-end.
    With no agentId, ticks every agent that has been initialized so far."""
    ids = [agentId] if agentId else agent_module.list_agent_ids()
    results = {}
    for aid in ids:
        state = agent_module.get_agent(aid)
        if state is None:
            continue
        state = agent_module.maybe_publish(state)
        results[aid] = len(state["posts"])
    return {"ok": True, "postCounts": results}


@app.get("/api/agent/debug")
def debug(agentId: str = Query(...)):
    """Internal diagnostic endpoint — not part of the required spec, but
    useful for seeing exactly why the agent did or didn't publish on its
    last few cycles (recent rejections, next scheduled slot, etc.)."""
    state = agent_module.get_agent(agentId)
    if state is None:
        raise HTTPException(status_code=404, detail="unknown agentId")
    import datetime as _dt
    now = _dt.datetime.now(_dt.timezone.utc)
    next_at = _dt.datetime.fromisoformat(state["nextPublishAt"])
    return {
        "now": now.isoformat(),
        "nextPublishAt": state["nextPublishAt"],
        "secondsUntilDue": (next_at - now).total_seconds(),
        "publishedCount": len(state["posts"]),
        "recentRejections": state["rejectedLog"][-10:],
    }


@app.get("/api/health")
def health():
    from lib import storage
    return {"ok": True, "persistent_storage": storage.is_persistent()}
