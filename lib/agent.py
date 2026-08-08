"""
Agent orchestration.

Design note on "autonomous operation" under serverless constraints
--------------------------------------------------------------------
Vercel's free/Hobby tier restricts Cron Jobs to at most once/day, which is
too coarse to trickle out posts across a 48h window. So publishing is driven
by the agent's own clock, not by cron and not by any new instruction: every
time GET /api/agent/feed is called, the agent first asks itself "has enough
wall-clock time passed since I last published, per my own schedule?" and, if
so, independently runs discover -> judge -> write -> publish (possibly
several times, to catch up) *before* returning the feed. The evaluator's
poll is what causes CPU cycles to run (inevitable in serverless), but the
decision of whether/what/when to publish is made entirely by the agent's own
stored state and scoring logic — no topic, instruction, or content is
supplied by the caller. A `/api/agent/tick` endpoint is also exposed so a
true push-based Cron (Vercel Pro, or an external scheduler like
cron-job.org hitting the deployed URL) can drive the same loop independently
of anyone polling the feed at all.
"""
from __future__ import annotations
import datetime as dt
import random
import uuid
from typing import Dict, List

from . import discovery, editorial, generator, persona as persona_module, storage

MIN_INTERVAL_MINUTES = 45
MAX_INTERVAL_MINUTES = 150
FIRST_POST_DELAY_MINUTES = 5
MAX_CATCHUP_POSTS_PER_CALL = 3

AGENT_KEY_PREFIX = "abtalks:agent:"
AGENT_INDEX_KEY = "abtalks:agent:__index__"


def _now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def _key(agent_id: str) -> str:
    return f"{AGENT_KEY_PREFIX}{agent_id}"


def _rng_for(agent_id: str, salt: str) -> random.Random:
    return random.Random(f"{agent_id}:{salt}")


def create_agent(name: str, domain: str) -> str:
    agent_id = str(uuid.uuid4())
    persona = persona_module.build_persona(name, domain)
    now = _now()
    state = {
        "agentId": agent_id,
        "persona": persona,
        "createdAt": now.isoformat(),
        "nextPublishAt": (now + dt.timedelta(minutes=FIRST_POST_DELAY_MINUTES)).isoformat(),
        "posts": [],          # published posts, newest last internally
        "rejectedLog": [],    # recent rejection reasons, for internal transparency
    }
    storage.set(_key(agent_id), state)

    index = storage.get(AGENT_INDEX_KEY) or {"ids": []}
    if agent_id not in index["ids"]:
        index["ids"].append(agent_id)
    storage.set(AGENT_INDEX_KEY, index)

    return agent_id


def list_agent_ids() -> List[str]:
    index = storage.get(AGENT_INDEX_KEY) or {"ids": []}
    return index["ids"]


def get_agent(agent_id: str) -> Dict | None:
    return storage.get(_key(agent_id))


def _schedule_next(state: Dict) -> None:
    rng = _rng_for(state["agentId"], f"schedule:{len(state['posts'])}")
    minutes = rng.randint(MIN_INTERVAL_MINUTES, MAX_INTERVAL_MINUTES)
    # Advance from the *missed* slot, not from "now" — otherwise a long gap
    # between polls collapses into a single catch-up post instead of the
    # several that were actually due, which is what makes the catch-up loop
    # below meaningful.
    previous_slot = dt.datetime.fromisoformat(state["nextPublishAt"])
    state["nextPublishAt"] = (previous_slot + dt.timedelta(minutes=minutes)).isoformat()


def _publish_once(state: Dict) -> bool:
    """Run one discover -> judge -> write cycle. Returns True if a post was published."""
    persona = state["persona"]
    candidates = discovery.discover_candidates(persona)

    if not candidates:
        state["rejectedLog"].append({
            "at": _now().isoformat(),
            "reason": "no candidates returned from discovery sources this cycle",
        })
        state["rejectedLog"] = state["rejectedLog"][-20:]
        return False

    selection = editorial.rank_and_select(candidates, persona, state["posts"])

    for e in selection["all_evaluations"]:
        if not e["accepted"]:
            state["rejectedLog"].append({
                "at": _now().isoformat(),
                "title": e["candidate"]["title"],
                "score": e["score"],
                "reasons": e["reasons"],
            })
    state["rejectedLog"] = state["rejectedLog"][-20:]

    chosen = selection["chosen"]
    if chosen is None:
        return False

    chosen["_runners_up"] = selection["runners_up"]
    post_seed = int.from_bytes(
        f"{state['agentId']}:{len(state['posts'])}".encode(), "little"
    ) % (2**31)
    written = generator.write_post(persona, chosen, post_seed)

    post = {
        "id": f"p{len(state['posts']) + 1}",
        "createdAt": _now().isoformat().replace("+00:00", "Z"),
        "text": written["text"],
        "rationale": written["rationale"],
        "sources": written["sources"],
        "topic_title": written["topic_title"],
    }
    state["posts"].append(post)
    return True


def maybe_publish(state: Dict) -> Dict:
    """Catch up on any due posts (bounded per call), then reschedule. Mutates
    and persists state; returns it."""
    published_this_call = 0
    while (
        _now() >= dt.datetime.fromisoformat(state["nextPublishAt"])
        and published_this_call < MAX_CATCHUP_POSTS_PER_CALL
    ):
        _publish_once(state)
        _schedule_next(state)
        published_this_call += 1

    storage.set(_key(state["agentId"]), state)
    return state


def public_posts(state: Dict) -> List[Dict]:
    posts = [
        {k: v for k, v in p.items() if k != "topic_title"}
        for p in state["posts"]
    ]
    posts.sort(key=lambda p: p["createdAt"], reverse=True)
    return posts
