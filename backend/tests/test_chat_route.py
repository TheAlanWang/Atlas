from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.chat_security import reset_rate_limit_state


def _streaming_events():
    async def generator():
        yield 'data: {"sources":[]}\n\n'
        yield 'data: {"text":"Atlas"}\n\n'
        yield "data: [DONE]\n\n"

    return generator()


@pytest.fixture(autouse=True)
def reset_chat_security(monkeypatch):
    monkeypatch.setenv(
        "CHAT_ALLOWED_ORIGINS",
        "http://localhost:3000,https://thealanwang.xyz",
    )
    monkeypatch.setenv("CHAT_RATE_LIMIT_WINDOW_MS", "300000")
    monkeypatch.setenv("CHAT_RATE_LIMIT_MAX_REQUESTS", "10")
    reset_rate_limit_state()
    yield
    reset_rate_limit_state()


@pytest.fixture
def client():
    return TestClient(app)


def test_chat_allows_request_under_limit(client):
    with patch(
        "backend.routes.chat.retrieve",
        AsyncMock(return_value=[]),
    ) as mock_retrieve, patch(
        "backend.routes.chat.stream_generate",
        side_effect=lambda *_args, **_kwargs: _streaming_events(),
    ) as mock_stream_generate:
        response = client.post(
            "/chat",
            json={"question": "What is RAG?", "history": []},
            headers={
                "origin": "http://localhost:3000",
                "x-forwarded-for": "203.0.113.9",
            },
        )

    assert response.status_code == 200
    assert 'data: {"text":"Atlas"}' in response.text
    mock_retrieve.assert_awaited_once_with("What is RAG?")
    mock_stream_generate.assert_called_once()


def test_chat_blocks_request_over_rate_limit(client, monkeypatch):
    monkeypatch.setenv("CHAT_RATE_LIMIT_MAX_REQUESTS", "1")

    with patch(
        "backend.routes.chat.retrieve",
        AsyncMock(return_value=[]),
    ) as mock_retrieve, patch(
        "backend.routes.chat.stream_generate",
        side_effect=lambda *_args, **_kwargs: _streaming_events(),
    ):
        headers = {
            "origin": "http://localhost:3000",
            "x-forwarded-for": "198.51.100.11",
        }

        first = client.post(
            "/chat",
            json={"question": "First question", "history": []},
            headers=headers,
        )
        second = client.post(
            "/chat",
            json={"question": "Second question", "history": []},
            headers=headers,
        )

    assert first.status_code == 200
    assert second.status_code == 429
    assert second.json()["error"] == "Chat rate limit exceeded. Please try again in a few minutes."
    assert "Retry-After" in second.headers
    mock_retrieve.assert_awaited_once_with("First question")


def test_chat_blocks_disallowed_origin_before_retrieval(client):
    with patch(
        "backend.routes.chat.retrieve",
        AsyncMock(return_value=[]),
    ) as mock_retrieve, patch(
        "backend.routes.chat.stream_generate",
        side_effect=lambda *_args, **_kwargs: _streaming_events(),
    ) as mock_stream_generate:
        response = client.post(
            "/chat",
            json={"question": "What is RAG?", "history": []},
            headers={
                "origin": "https://evil.example",
                "x-forwarded-for": "203.0.113.10",
            },
        )

    assert response.status_code == 403
    assert response.json()["error"] == "Chat requests are only allowed from approved Atlas origins."
    mock_retrieve.assert_not_awaited()
    mock_stream_generate.assert_not_called()


def test_chat_does_not_call_openai_when_rate_limited(client, monkeypatch):
    monkeypatch.setenv("CHAT_RATE_LIMIT_MAX_REQUESTS", "1")

    with patch(
        "backend.routes.chat.retrieve",
        AsyncMock(return_value=[]),
    ) as mock_retrieve, patch(
        "backend.routes.chat.stream_generate",
        side_effect=lambda *_args, **_kwargs: _streaming_events(),
    ) as mock_stream_generate:
        headers = {
            "origin": "http://localhost:3000",
            "x-forwarded-for": "198.51.100.25",
        }

        first = client.post(
            "/chat",
            json={"question": "Allowed", "history": []},
            headers=headers,
        )
        second = client.post(
            "/chat",
            json={"question": "Blocked", "history": []},
            headers=headers,
        )

    assert first.status_code == 200
    assert second.status_code == 429
    mock_retrieve.assert_awaited_once_with("Allowed")
    mock_stream_generate.assert_called_once()
