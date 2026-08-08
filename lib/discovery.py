"""
Topic discovery.

Pulls live candidate topics from two independent, free, no-auth-required
sources so the agent has real material to make editorial judgments about:

  1. Hacker News (via the Algolia HN Search API) — search_by_date, so we
     get genuinely recent items, not all-time-popular ones.
  2. arXiv (public Atom API) — recent papers in relevant categories.

Both calls are best-effort: if either source is unreachable (rate limit,
network hiccup, etc.) discovery degrades gracefully instead of failing the
whole publish cycle.
"""
from __future__ import annotations
import datetime as dt
from typing import Dict, List
from xml.etree import ElementTree

import httpx

HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search_by_date"
ARXIV_API_URL = "http://export.arxiv.org/api/query"

ARXIV_CATEGORY_MAP = {
    "ai security": "cs.CR",
    "machine learning engineer": "cs.LG",
    "ai product analyst": "cs.AI",
    "open source contributor": "cs.SE",
    "robotics engineer": "cs.RO",
    "developer advocate": "cs.SE",
    "ai ethics researcher": "cs.CY",
}


def _fetch_hn(keywords: List[str], limit: int = 8) -> List[Dict]:
    """Run several narrower single/pair-keyword queries instead of one big
    combined query. A combined multi-word query over-restricts Algolia's
    matching, so on a niche persona domain it can end up surfacing whatever
    old story best matches all the words instead of what's actually recent."""
    if not keywords:
        keywords = ["artificial intelligence"]

    seed_queries = keywords[:6] if len(keywords) >= 3 else keywords + ["artificial intelligence"]

    candidates = []
    seen_urls = set()
    for kw in seed_queries:
        params = {"query": kw, "tags": "story", "hitsPerPage": limit}
        try:
            resp = httpx.get(HN_SEARCH_URL, params=params, timeout=8.0)
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            continue
        for hit in data.get("hits", []):
            title = hit.get("title") or hit.get("story_title")
            url = hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}"
            if not title or not url or url in seen_urls:
                continue
            seen_urls.add(url)
            candidates.append({
                "title": title,
                "url": url,
                "source": "Hacker News",
                "published_at": hit.get("created_at"),
                "snippet": title,
                "points": hit.get("points", 0),
            })
    return candidates


def _fetch_arxiv(domain: str, limit: int = 8) -> List[Dict]:
    category = ARXIV_CATEGORY_MAP.get(domain.strip().lower(), "cs.AI")
    params = {
        "search_query": f"cat:{category}",
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "max_results": limit,
    }
    try:
        resp = httpx.get(ARXIV_API_URL, params=params, timeout=8.0)
        resp.raise_for_status()
        root = ElementTree.fromstring(resp.text)
    except Exception:
        return []

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    candidates = []
    for entry in root.findall("atom:entry", ns):
        title_el = entry.find("atom:title", ns)
        link_el = entry.find("atom:id", ns)
        summary_el = entry.find("atom:summary", ns)
        published_el = entry.find("atom:published", ns)
        if title_el is None or link_el is None:
            continue
        title = " ".join(title_el.text.split())
        candidates.append({
            "title": title,
            "url": link_el.text.strip(),
            "source": "arXiv",
            "published_at": published_el.text if published_el is not None else None,
            "snippet": " ".join((summary_el.text or "").split())[:280] if summary_el is not None else title,
            "points": None,
        })
    return candidates


def discover_candidates(persona: dict) -> List[Dict]:
    """Return a deduplicated list of live candidate topics for this persona."""
    keywords = persona["keywords"]
    domain = persona["domain"]

    candidates = _fetch_hn(keywords) + _fetch_arxiv(domain)

    seen_urls = set()
    deduped = []
    for c in candidates:
        if c["url"] in seen_urls:
            continue
        seen_urls.add(c["url"])
        deduped.append(c)
    return deduped
