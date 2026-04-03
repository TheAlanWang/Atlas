import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
import httpx

from backend.services.rag import embed, retrieve, stream_generate


@pytest.fixture
def mock_docs():
    return [
        {"content": "RAG stands for Retrieval-Augmented Generation.", "title": "What is RAG?", "slug": "rag-intro", "topic": "rag"},
        {"content": "Chunking splits documents into smaller pieces.", "title": "Chunking", "slug": "rag-chunking", "topic": "rag"},
    ]


@pytest.mark.anyio
async def test_embed_returns_vector():
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1, 0.2, 0.3])]

    with patch("backend.services.rag.openai_client") as mock_openai:
        mock_openai.embeddings.create = AsyncMock(return_value=mock_response)
        result = await embed("what is RAG?")
        mock_openai.embeddings.create.assert_called_once_with(
            model="text-embedding-3-small",
            input="what is RAG?",
        )

    assert result == [0.1, 0.2, 0.3]


@pytest.mark.anyio
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
        result = await retrieve("what is RAG?")

    assert len(result) == 1
    assert result[0]["slug"] == "rag-intro"


@pytest.mark.anyio
async def test_retrieve_reranks_when_configured(monkeypatch):
    docs = [
        {"content": "Less relevant", "title": "Doc A", "slug": "a", "topic": "rag"},
        {"content": "Most relevant", "title": "Doc B", "slug": "b", "topic": "rag"},
    ]
    mock_rpc = MagicMock()
    mock_rpc.execute.return_value = MagicMock(data=docs)

    monkeypatch.setenv("VOYAGE_API_KEY", "test-key")
    monkeypatch.delenv("RERANKER_PROVIDER", raising=False)
    monkeypatch.setenv("RAG_RETRIEVE_CANDIDATES", "8")

    with patch("backend.services.rag.embed", AsyncMock(return_value=[0.1] * 1536)), \
         patch("backend.services.rag.supabase_client") as mock_supabase, \
         patch("backend.services.rag.rerank_documents", AsyncMock(return_value=[docs[1]])) as mock_rerank:
        mock_supabase.rpc.return_value = mock_rpc
        result = await retrieve("what is RAG?", top_k=1)

    mock_supabase.rpc.assert_called_once_with("match_documents", {
        "query_embedding": [0.1] * 1536,
        "match_count": 8,
    })
    mock_rerank.assert_awaited_once_with("what is RAG?", docs, 1)
    assert result == [docs[1]]


@pytest.mark.anyio
async def test_retrieve_falls_back_when_rerank_fails(monkeypatch):
    docs = [
        {"content": "First", "title": "Doc A", "slug": "a", "topic": "rag"},
        {"content": "Second", "title": "Doc B", "slug": "b", "topic": "rag"},
    ]
    mock_rpc = MagicMock()
    mock_rpc.execute.return_value = MagicMock(data=docs)

    monkeypatch.setenv("VOYAGE_API_KEY", "test-key")
    monkeypatch.delenv("RERANKER_PROVIDER", raising=False)

    with patch("backend.services.rag.embed", AsyncMock(return_value=[0.1] * 1536)), \
         patch("backend.services.rag.supabase_client") as mock_supabase, \
         patch("backend.services.rag.rerank_documents", AsyncMock(side_effect=httpx.HTTPError("boom"))):
        mock_supabase.rpc.return_value = mock_rpc
        result = await retrieve("what is RAG?", top_k=1)

    assert result == [docs[0]]


@pytest.mark.anyio
async def test_retrieve_falls_back_on_voyage_429(monkeypatch):
    docs = [
        {"content": "First", "title": "Doc A", "slug": "a", "topic": "rag"},
        {"content": "Second", "title": "Doc B", "slug": "b", "topic": "rag"},
    ]
    mock_rpc = MagicMock()
    mock_rpc.execute.return_value = MagicMock(data=docs)

    monkeypatch.setenv("VOYAGE_API_KEY", "test-key")
    monkeypatch.delenv("RERANKER_PROVIDER", raising=False)

    request = httpx.Request("POST", "https://api.voyageai.com/v1/rerank")
    response = httpx.Response(429, request=request)
    error = httpx.HTTPStatusError("rate limited", request=request, response=response)

    with patch("backend.services.rag.embed", AsyncMock(return_value=[0.1] * 1536)), \
         patch("backend.services.rag.supabase_client") as mock_supabase, \
         patch("backend.services.rag.rerank_documents", AsyncMock(side_effect=error)):
        mock_supabase.rpc.return_value = mock_rpc
        result = await retrieve("what is RAG?", top_k=1)

    assert result == [docs[0]]


@pytest.mark.anyio
async def test_stream_generate_yields_sources_first(mock_docs):
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock(delta=MagicMock(content="RAG"))]

    async def mock_stream():
        yield mock_chunk

    mock_completion = mock_stream()

    with patch("backend.services.rag.openai_client") as mock_openai:
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_completion)
        chunks = []
        async for chunk in stream_generate("what is RAG?", mock_docs, []):
            chunks.append(chunk)

    # First chunk must be sources
    first = json.loads(chunks[0].removeprefix("data: ").strip())
    assert "sources" in first
    assert first["sources"][0]["slug"] == "rag-intro"

    # At least one text chunk must appear between sources and [DONE]
    text_chunks = [
        c for c in chunks[1:-1]
        if "text" in json.loads(c.removeprefix("data: ").strip())
    ]
    assert len(text_chunks) >= 1

    # Last chunk must be [DONE]
    assert chunks[-1].strip() == "data: [DONE]"


@pytest.mark.anyio
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

    mock_completion = mock_stream()

    with patch("backend.services.rag.openai_client") as mock_openai:
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_completion)
        chunks = []
        async for chunk in stream_generate("what is RAG?", duplicate_docs, []):
            chunks.append(chunk)

    first = json.loads(chunks[0].removeprefix("data: ").strip())
    assert len(first["sources"]) == 1
