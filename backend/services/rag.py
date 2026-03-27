import os
from openai import AsyncOpenAI
from supabase import create_client, Client
from typing import AsyncGenerator

openai_client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
supabase_client: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_ANON_KEY"],
)

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


async def retrieve(question: str, top_k: int = 3) -> list[dict]:
    """Search Supabase pgvector for the top-k most similar chunks.
    Returns list of dicts with keys: content, title, slug, topic."""
    embedding = await embed(question)
    result = supabase_client.rpc("match_documents", {
        "query_embedding": embedding,
        "match_count": top_k,
    }).execute()
    return result.data or []


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

    import json
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
