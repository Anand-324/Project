"""Shared Anthropic client + prompt helpers for all routes."""

import os
import json
import anthropic

_client = None

def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


def claude(system: str, user: str, max_tokens: int = 1024) -> str:
    """Call Claude and return the text response."""
    msg = get_client().messages.create(
        model="claude-opus-4-20250514",
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return "".join(b.text for b in msg.content if hasattr(b, "text"))


def claude_json(system: str, user: str, max_tokens: int = 1024) -> dict:
    """Call Claude expecting a JSON response. Strips markdown fences."""
    raw = claude(system, user, max_tokens)
    # Strip ```json ... ``` fences if present
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.rsplit("```", 1)[0]
    return json.loads(raw.strip())
