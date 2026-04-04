import time
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.services.rag import retrieve, stream_generate

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    history: list[dict] = []


@router.post("/chat")
async def chat(req: ChatRequest):
    """Embed the question, retrieve relevant chunks, stream a grounded response.
    Response is Server-Sent Events: sources metadata first, then text tokens, then [DONE]."""
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
