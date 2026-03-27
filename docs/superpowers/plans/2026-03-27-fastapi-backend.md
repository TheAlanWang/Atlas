# FastAPI Backend Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the RAG chat logic from the Next.js API route into a standalone FastAPI backend, so the Next.js frontend calls `http://localhost:8000/chat` instead of `/api/chat`.

**Architecture:** A `backend/` directory alongside the existing Next.js app contains a FastAPI service with a single `/chat` endpoint. The RAG logic (embed → retrieve → stream generate) lives in `backend/services/rag.py`. ChatWidget.tsx reads `NEXT_PUBLIC_API_URL` from the environment to know where to send requests.

**Tech Stack:** FastAPI, uvicorn, openai, supabase-py, python-dotenv, pytest, pytest-asyncio

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `backend/main.py` | FastAPI app init, CORS middleware |
| Create | `backend/routes/chat.py` | POST /chat — parses request, calls RAG service, returns SSE stream |
| Create | `backend/services/rag.py` | embed(), retrieve(), stream_generate() |
| Create | `backend/tests/test_rag.py` | Unit tests for rag.py with mocked OpenAI + Supabase |
| Create | `backend/requirements.txt` | Python dependencies |
| Create | `backend/.env.example` | Document required env vars |
| Modify | `components/ChatWidget.tsx` | Change fetch URL from `/api/chat` to `NEXT_PUBLIC_API_URL/chat` |
| Modify | `.env.local` | Add `NEXT_PUBLIC_API_URL=http://localhost:8000` |
| Delete | `app/api/chat/route.ts` | Replaced by FastAPI backend |

---

## Task 1: Backend project structure + dependencies

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`

- [ ] **Step 1: Create requirements.txt**

```
fastapi
uvicorn[standard]
openai
supabase
python-dotenv
pytest
pytest-asyncio
```

- [ ] **Step 2: Create .env.example**

```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Install dependencies**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

- [ ] **Step 4: Commit**

```bash
git add backend/requirements.txt backend/.env.example
git commit -m "feat: add FastAPI backend project structure"
```

---

## Task 2: RAG service

**Files:**
- Create: `backend/services/__init__.py`
- Create: `backend/services/rag.py`

- [ ] **Step 1: Create `backend/services/__init__.py`** (empty file)

```python
```

- [ ] **Step 2: Create `backend/services/rag.py`**

```python
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
```

- [ ] **Step 3: Commit**

```bash
git add backend/services/
git commit -m "feat: add RAG service with embed, retrieve, stream_generate"
```

---

## Task 3: Tests for RAG service

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_rag.py`

- [ ] **Step 1: Create `backend/tests/__init__.py`** (empty file)

```python
```

- [ ] **Step 2: Create `backend/tests/test_rag.py`**

```python
import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture
def mock_docs():
    return [
        {"content": "RAG stands for Retrieval-Augmented Generation.", "title": "What is RAG?", "slug": "rag-intro", "topic": "rag"},
        {"content": "Chunking splits documents into smaller pieces.", "title": "Chunking", "slug": "rag-chunking", "topic": "rag"},
    ]


@pytest.mark.asyncio
async def test_embed_returns_vector():
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1, 0.2, 0.3])]

    with patch("backend.services.rag.openai_client") as mock_openai:
        mock_openai.embeddings.create = AsyncMock(return_value=mock_response)
        from backend.services.rag import embed
        result = await embed("what is RAG?")

    assert result == [0.1, 0.2, 0.3]


@pytest.mark.asyncio
async def test_retrieve_returns_docs():
    mock_embed_response = MagicMock()
    mock_embed_response.data = [MagicMock(embedding=[0.1] * 1536)]

    mock_rpc = MagicMock()
    mock_rpc.execute.return_value = MagicMock(data=[
        {"content": "RAG is...", "title": "RAG Intro", "slug": "rag-intro", "topic": "rag"}
    ])

    with patch("backend.services.rag.openai_client") as mock_openai, \
         patch("backend.services.rag.supabase_client") as mock_supabase:
        mock_openai.embeddings.create = AsyncMock(return_value=mock_embed_response)
        mock_supabase.rpc.return_value = mock_rpc

        from backend.services.rag import retrieve
        result = await retrieve("what is RAG?")

    assert len(result) == 1
    assert result[0]["slug"] == "rag-intro"


@pytest.mark.asyncio
async def test_stream_generate_yields_sources_first(mock_docs):
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock(delta=MagicMock(content="RAG"))]

    async def mock_stream():
        yield mock_chunk

    mock_completion = AsyncMock()
    mock_completion.__aiter__ = mock_stream

    with patch("backend.services.rag.openai_client") as mock_openai:
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_completion)

        from backend.services.rag import stream_generate
        chunks = []
        async for chunk in stream_generate("what is RAG?", mock_docs, []):
            chunks.append(chunk)

    # First chunk must be sources
    first = json.loads(chunks[0].removeprefix("data: ").strip())
    assert "sources" in first
    assert first["sources"][0]["slug"] == "rag-intro"

    # Last chunk must be [DONE]
    assert chunks[-1].strip() == "data: [DONE]"


@pytest.mark.asyncio
async def test_stream_generate_deduplicates_sources():
    """Two docs with the same slug should produce only one source entry."""
    duplicate_docs = [
        {"content": "RAG intro part 1", "title": "RAG Intro", "slug": "rag-intro", "topic": "rag"},
        {"content": "RAG intro part 2", "title": "RAG Intro", "slug": "rag-intro", "topic": "rag"},
    ]
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock(delta=MagicMock(content=""))]

    async def mock_stream():
        yield mock_chunk

    mock_completion = AsyncMock()
    mock_completion.__aiter__ = mock_stream

    with patch("backend.services.rag.openai_client") as mock_openai:
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_completion)

        from backend.services.rag import stream_generate
        chunks = []
        async for chunk in stream_generate("what is RAG?", duplicate_docs, []):
            chunks.append(chunk)

    first = json.loads(chunks[0].removeprefix("data: ").strip())
    assert len(first["sources"]) == 1
```

- [ ] **Step 3: Run tests to verify they fail (functions not yet importable from root)**

```bash
cd backend
pytest tests/test_rag.py -v
```

Expected: ImportError or ModuleNotFoundError — that's fine, services exist but pytest path isn't set up yet.

- [ ] **Step 4: Add `pytest.ini` to fix import path**

Create `backend/pytest.ini`:
```ini
[pytest]
asyncio_mode = auto
pythonpath = ..
```

- [ ] **Step 5: Run tests — should pass**

```bash
pytest tests/test_rag.py -v
```

Expected: 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add backend/tests/ backend/pytest.ini
git commit -m "test: add unit tests for RAG service"
```

---

## Task 4: Chat route

**Files:**
- Create: `backend/routes/__init__.py`
- Create: `backend/routes/chat.py`

- [ ] **Step 1: Create `backend/routes/__init__.py`** (empty file)

```python
```

- [ ] **Step 2: Create `backend/routes/chat.py`**

```python
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
```

- [ ] **Step 3: Commit**

```bash
git add backend/routes/
git commit -m "feat: add /chat route with SSE streaming response"
```

---

## Task 5: FastAPI app entry point

**Files:**
- Create: `backend/main.py`

- [ ] **Step 1: Create `backend/main.py`**

```python
from pathlib import Path
from dotenv import load_dotenv

# Load .env.local from project root before anything else imports os.environ
load_dotenv(Path(__file__).parent.parent / ".env.local")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.chat import router

app = FastAPI(title="Atlas RAG API")

# Allow requests from the Next.js dev server and production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://thealanwang.xyz"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 2: Start the server and verify health endpoint**

```bash
cd /path/to/atlas
uvicorn backend.main:app --reload --port 8000
```

In a separate terminal:
```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: add FastAPI app with CORS and health endpoint"
```

---

## Task 6: Update ChatWidget to call FastAPI

**Files:**
- Modify: `components/ChatWidget.tsx`
- Modify: `.env.local`

- [ ] **Step 1: Add `NEXT_PUBLIC_API_URL` to `.env.local`**

Add this line to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 2: Update the fetch call in `ChatWidget.tsx` (line 44)**

Change:
```typescript
const res = await fetch("/api/chat", {
```

To:
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
```

- [ ] **Step 3: Verify the frontend still works**

Start both servers:
```bash
# Terminal 1
uvicorn backend.main:app --reload --port 8000

# Terminal 2
npm run dev
```

Open `http://localhost:3000`, open the chat widget, send a message. Verify the response streams correctly with sources.

- [ ] **Step 4: Commit**

```bash
git add components/ChatWidget.tsx .env.local
git commit -m "feat: update ChatWidget to call FastAPI backend"
```

---

## Task 7: Remove Next.js API route

**Files:**
- Delete: `app/api/chat/route.ts`

- [ ] **Step 1: Delete the old route**

```bash
rm app/api/chat/route.ts
```

- [ ] **Step 2: Check if `app/api/` directory is now empty**

```bash
ls app/api/
```

If empty, remove it:
```bash
rmdir app/api/
```

- [ ] **Step 3: Run the app one more time to confirm nothing breaks**

```bash
uvicorn backend.main:app --reload --port 8000 &
npm run dev
```

Send a chat message. Verify streaming works.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "refactor: remove Next.js API route, fully replaced by FastAPI backend"
```
