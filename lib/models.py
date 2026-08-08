"""
Pydantic models for the ABTalks Autonomous Agent API.
These mirror the exact request/response shapes required by the challenge spec.
"""
from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class PersonaIn(BaseModel):
    name: str = Field(..., description="Persona display name, e.g. 'Ada'")
    domain: str = Field(..., description="Persona focus area, e.g. 'AI Security'")


class InitRequest(BaseModel):
    persona: PersonaIn


class InitResponse(BaseModel):
    agentId: str


class Post(BaseModel):
    id: str
    createdAt: str  # ISO 8601 UTC
    text: str
    rationale: str
    sources: List[str]


class FeedResponse(BaseModel):
    posts: List[Post]
