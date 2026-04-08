import time
from typing import AsyncGenerator

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from backend.services.rag import retrieve, stream_generate
from backend.services.chat_security import guard_chat_request

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    history: list[dict] = []


@router.post("/chat")
async def chat(req: ChatRequest, request: Request):
    """Embed the question, retrieve relevant chunks, stream a grounded response.
    Response is Server-Sent Events: sources metadata first, then text tokens, then [DONE]."""
    guard_failure = guard_chat_request(request)
    if guard_failure is not None:
        return JSONResponse(
            status_code=guard_failure.status_code,
            content={"error": guard_failure.error},
            headers=guard_failure.headers,
        )

    # Start timing on the server so logs land in the backend runtime.
    started_at = time.perf_counter()
    docs = await retrieve(req.question)

    async def timed_stream() -> AsyncGenerator[str, None]:
        first_token_ms: float | None = None

        async for event in stream_generate(req.question, docs, req.history):
            # The first SSE event with text marks the first visible model token.
            if first_token_ms is None and '"text"' in event:
                first_token_ms = (time.perf_counter() - started_at) * 1000
            yield event

        # Emit one compact timing log per question for terminal/hosted logs.
        print(
            "[Atlas chat latency]",
            {
                "question": req.question,
                "timeToFirstTokenMs": round(first_token_ms, 1) if first_token_ms is not None else None,
                "totalLatencyMs": round((time.perf_counter() - started_at) * 1000, 1),
            },
        )

    return StreamingResponse(
        timed_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
