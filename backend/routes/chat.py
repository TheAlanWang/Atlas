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
    docs = await retrieve(req.question)
    return StreamingResponse(
        stream_generate(req.question, docs, req.history),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
