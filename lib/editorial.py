"""
Editorial judgment.

This is the "not everything gets published" logic. Every candidate topic is
scored against the persona's stated interests, recency, novelty vs. what has
already been published (memory), and basic source-quality heuristics. Only
candidates clearing ACCEPT_THRESHOLD are published; everything else is
rejected with a logged, human-readable reason, which is what gives the
rationale field its "why this one, not the others" content.
"""
from __future__ import annotations
import datetime as dt
import re
from typing import Dict, List, Optional, Tuple

ACCEPT_THRESHOLD = 3.0
MAX_TOPIC_AGE_HOURS = 30 * 24  # 30 days — beyond this, it can't honestly be called "relevant now"
LOW_QUALITY_PATTERNS = [
    r"^\s*(wow|omg|you won'?t believe)",
    r"!!!+",
]


def _parse_time(value: Optional[str]) -> Optional[dt.datetime]:
    if not value:
        return None
    try:
        value = value.replace("Z", "+00:00")
        parsed = dt.datetime.fromisoformat(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed
    except Exception:
        return None


def _token_set(text: str) -> set:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def _similarity(a: str, b: str) -> float:
    ta, tb = _token_set(a), _token_set(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def _keyword_score(text: str, keywords: List[str]) -> Tuple[float, List[str]]:
    text_l = text.lower()
    matched = [k for k in keywords if k.lower() in text_l]
    return float(len(matched)), matched


def _recency_score(published_at: Optional[str]) -> Tuple[float, Optional[float]]:
    parsed = _parse_time(published_at)
    if parsed is None:
        return 0.5, None  # unknown recency - small neutral credit
    age_hours = (dt.datetime.now(dt.timezone.utc) - parsed).total_seconds() / 3600.0
    if age_hours < 0:
        age_hours = 0
    if age_hours <= 24:
        return 2.0, age_hours
    if age_hours <= 72:
        return 1.0, age_hours
    if age_hours <= 168:
        return 0.25, age_hours
    return -1.0, age_hours


def _quality_penalty(title: str) -> Tuple[float, Optional[str]]:
    for pattern in LOW_QUALITY_PATTERNS:
        if re.search(pattern, title, flags=re.IGNORECASE):
            return -3.0, "title reads as clickbait / low editorial quality"
    if len(title.strip()) < 12:
        return -2.0, "title too thin to represent a real topic"
    return 0.0, None


def _novelty_score(candidate: Dict, published_history: List[Dict]) -> Tuple[float, Optional[str]]:
    for post in published_history:
        sim = _similarity(candidate["title"], post.get("topic_title", ""))
        if sim >= 0.5:
            return -5.0, f"too similar to a topic already published ({post.get('topic_title')!r})"
    return 1.0, None


def evaluate_candidate(candidate: Dict, persona: dict, published_history: List[Dict]) -> Dict:
    """Score one candidate. Returns a dict with decision, score, and reasons —
    used both to decide publish/reject and to build the transparent rationale."""
    kw_score, matched_keywords = _keyword_score(
        candidate["title"] + " " + candidate.get("snippet", ""), persona["keywords"]
    )
    rec_score, age_hours = _recency_score(candidate.get("published_at"))
    qual_penalty, qual_reason = _quality_penalty(candidate["title"])
    nov_score, nov_reason = _novelty_score(candidate, published_history)

    source_bonus = 0.5 if candidate.get("source") in ("Hacker News", "arXiv") else 0.0

    total = kw_score + rec_score + qual_penalty + nov_score + source_bonus

    # Hard cutoff: no amount of keyword density earns a stale topic a pass —
    # the agent's own rationale claims "relevant now", so it must actually be.
    stale = age_hours is not None and age_hours > MAX_TOPIC_AGE_HOURS
    stale_reason = None
    if stale:
        stale_reason = f"too old to be presented as current ({age_hours/24:.0f} days old, cutoff is {MAX_TOPIC_AGE_HOURS/24:.0f})"

    accepted = (
        total >= ACCEPT_THRESHOLD
        and qual_reason is None
        and nov_score > 0
        and not stale
    )

    reasons = []
    if matched_keywords:
        reasons.append(f"matches persona focus on {', '.join(matched_keywords[:3])}")
    else:
        reasons.append("no direct keyword overlap with persona's stated interests")
    if age_hours is not None:
        reasons.append(f"published ~{age_hours:.0f}h ago")
    if qual_reason:
        reasons.append(qual_reason)
    if nov_reason:
        reasons.append(nov_reason)
    if stale_reason:
        reasons.append(stale_reason)

    return {
        "candidate": candidate,
        "score": round(total, 2),
        "accepted": accepted,
        "matched_keywords": matched_keywords,
        "reasons": reasons,
    }


def rank_and_select(candidates: List[Dict], persona: dict, published_history: List[Dict]) -> Dict:
    """Evaluate all candidates, return the best accepted one (if any) plus the
    full evaluation list, so the rationale can reference what was passed over."""
    evaluations = [evaluate_candidate(c, persona, published_history) for c in candidates]
    evaluations.sort(key=lambda e: e["score"], reverse=True)

    accepted = [e for e in evaluations if e["accepted"]]
    chosen = accepted[0] if accepted else None
    runners_up = [e for e in evaluations if e is not chosen][:3]

    return {
        "chosen": chosen,
        "runners_up": runners_up,
        "all_evaluations": evaluations,
    }
