"""
Rule/template-based writer.

No external LLM call is used (by design — see PROMPTS.md). Instead each
persona has a fixed voice profile (persona.py) — a set of stances, a tone
descriptor, and a signoff — and this module deterministically assembles post
text and rationale from that profile plus the chosen topic. Using the
persona's own random.Random seed (derived from agentId) keeps phrasing varied
post-to-post while staying reproducible and "in character" every time.
"""
from __future__ import annotations
import random
from typing import Dict, List, Optional

OPENERS = [
    "Noting this because it matters more than the headline suggests:",
    "Worth a second look:",
    "Flagging this one for the record:",
    "Here's what actually changed today:",
    "Not hype, just a fact worth sitting with:",
    "This crossed the desk and cleared the bar:",
]

STANCE_CONNECTORS = [
    "My read: {stance}.",
    "As always, {stance}.",
    "Standing view here: {stance}.",
    "Worth repeating: {stance}.",
]

CLOSERS = [
    "Filing this under things to watch.",
    "Will come back to this if the follow-up data shows up.",
    "More useful than another take on it would be.",
    "That's the whole update — no filler.",
]


def _pick(rng: random.Random, options: List[str]) -> str:
    return rng.choice(options)


def _trim(text: str, max_len: int) -> str:
    text = text.strip()
    if len(text) <= max_len:
        return text
    return text[: max_len - 1].rsplit(" ", 1)[0] + "…"


def write_post(persona: dict, evaluation: Dict, rng_seed: int) -> Dict:
    """Build the post text and rationale for an accepted candidate evaluation."""
    rng = random.Random(rng_seed)
    candidate = evaluation["candidate"]
    title = candidate["title"]
    matched = evaluation["matched_keywords"]
    stance = _pick(rng, persona["stances"])

    opener = _pick(rng, OPENERS)
    connector = _pick(rng, STANCE_CONNECTORS).format(stance=stance)
    closer = _pick(rng, CLOSERS)

    body = f'{opener} "{_trim(title, 140)}" ({candidate["source"]}). {connector} {closer}'
    text = f"{body}\n\n{persona['signoff']}"

    focus_note = (
        f"matches {persona['name']}'s stated focus on {', '.join(matched[:3])}"
        if matched else
        f"broadly within {persona['domain']}'s remit even without an exact keyword match"
    )

    runner_up_titles = [
        e["candidate"]["title"] for e in evaluation.get("_runners_up", [])
    ]
    passed_over = (
        f" Passed over in this cycle: {'; '.join(runner_up_titles[:2])}."
        if runner_up_titles else ""
    )

    rationale = (
        f"Selected (editorial score {evaluation['score']}) because it {focus_note}. "
        f"Relevant now: {'; '.join(evaluation['reasons'])}."
        f"{passed_over}"
    )

    return {
        "text": text,
        "rationale": rationale,
        "sources": [candidate["url"]],
        "topic_title": title,
    }
