import json
import logging
import os
import asyncio
from openai import AsyncOpenAI
from supabase import create_client, Client
from typing import Any, AsyncGenerator

import httpx

# Use getenv so the module is importable without env vars (e.g. during test collection)
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
_supabase_url = os.getenv("SUPABASE_URL", "")
_supabase_key = os.getenv("SUPABASE_ANON_KEY", "")
supabase_client: Client = create_client(_supabase_url, _supabase_key) if _supabase_url else None  # type: ignore
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a helpful assistant for the Atlas learning platform.
Answer questions based ONLY on the context below.
If the answer is not in the context, say so honestly.
Be concise and clear.

Context:
{context}"""


async def embed(text: str) -> list[float]:
    """Convert text to a vector. Must use same model as indexing step."""
    response = await openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding


def _reranker_provider() -> str:
    default_provider = "voyage" if os.getenv("VOYAGE_API_KEY") else "none"
    return os.getenv("RERANKER_PROVIDER", default_provider).lower()


def _reranker_enabled() -> bool:
    return _reranker_provider() == "voyage" and bool(os.getenv("VOYAGE_API_KEY"))


def _reranker_model() -> str:
    return os.getenv("RERANKER_MODEL", "rerank-2.5-lite")


def _candidate_count(final_k: int) -> int:
    configured = int(os.getenv("RAG_RETRIEVE_CANDIDATES", "8"))
    return max(final_k, configured)


def _reranker_retry_attempts() -> int:
    return max(1, int(os.getenv("RERANKER_MAX_RETRIES", "3")))


def _reranker_retry_delay_seconds() -> float:
    return max(0.0, float(os.getenv("RERANKER_RETRY_DELAY_SECONDS", "2")))


def _serialize_for_reranker(doc: dict[str, Any]) -> str:
    title = doc.get("title", "").strip()
    content = doc.get("content", "").strip()
    if title:
        return f"{title}\n\n{content}"
    return content


async def _vector_retrieve(question: str, match_count: int) -> list[dict]:
    """Search Supabase pgvector for the most similar chunks."""
    embedding = await embed(question)
    result = supabase_client.rpc("match_documents", {
        "query_embedding": embedding,
        "match_count": match_count,
    }).execute()
    return result.data or []


async def rerank_documents(
    question: str,
    docs: list[dict],
    top_k: int,
) -> list[dict]:
    """Reorder retrieved docs with Voyage's reranker and attach the score."""
    payload = {
        "query": question,
        "documents": [_serialize_for_reranker(doc) for doc in docs],
        "model": _reranker_model(),
        "top_k": top_k,
        "truncation": True,
    }
    headers = {
        "Authorization": f"Bearer {os.environ['VOYAGE_API_KEY']}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        attempts = _reranker_retry_attempts()
        base_delay = _reranker_retry_delay_seconds()
        response = None

        for attempt in range(1, attempts + 1):
            try:
                response = await client.post(
                    "https://api.voyageai.com/v1/rerank",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                break
            except httpx.HTTPStatusError as exc:
                should_retry = exc.response.status_code == 429 and attempt < attempts
                if not should_retry:
                    raise
                delay = base_delay * attempt
                logger.warning(
                    "Voyage rerank hit 429; retrying in %.1fs (attempt %s/%s)",
                    delay,
                    attempt,
                    attempts,
                )
                await asyncio.sleep(delay)

        if response is None:
            raise RuntimeError("Voyage rerank request did not produce a response")

    body = response.json()
    results = body.get("data") or body.get("results") or []

    reranked: list[dict] = []
    for item in results:
        index = item["index"]
        doc = dict(docs[index])
        doc["rerank_score"] = item.get("relevance_score")
        reranked.append(doc)

    return reranked


async def retrieve(question: str, top_k: int = 3) -> list[dict]:
    """Retrieve from pgvector, then optionally rerank before truncating."""
    candidate_count = _candidate_count(top_k) if _reranker_enabled() else top_k
    docs = await _vector_retrieve(question, candidate_count)

    if not docs or not _reranker_enabled():
        return docs[:top_k]

    try:
        return await rerank_documents(question, docs, top_k)
    except httpx.HTTPError as exc:
        logger.warning("Voyage rerank failed; falling back to vector order: %s", exc)
        return docs[:top_k]


async def stream_generate(
    question: str,
    docs: list[dict],
    history: list[dict],
) -> AsyncGenerator[str, None]:
    """Build grounded prompt from retrieved docs and stream GPT-4o response.
    Yields SSE-formatted strings: sources first, then text chunks, then [DONE]."""
    context = "\n\n---\n\n".join(
        f"[{d['title']}]\n{d['content']}" for d in docs
    )

    # Deduplicate sources by slug
    seen: set[str] = set()
    sources = []
    for d in docs:
        if d["slug"] not in seen:
            seen.add(d["slug"])
            sources.append({"title": d["title"], "slug": d["slug"], "topic": d["topic"]})

    yield f"data: {json.dumps({'sources': sources})}\n\n"

    stream = await openai_client.chat.completions.create(
        model="gpt-4o",
        stream=True,
        max_tokens=300,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT.format(context=context)},
            *(history or []),
            {"role": "user", "content": question},
        ],
    )

    async for chunk in stream:
        text = chunk.choices[0].delta.content or ""
        if text:
            yield f"data: {json.dumps({'text': text})}\n\n"

    yield "data: [DONE]\n\n"
