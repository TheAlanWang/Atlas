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

    mock_completion = mock_stream()

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

    mock_completion = mock_stream()

    with patch("backend.services.rag.openai_client") as mock_openai:
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_completion)

        from backend.services.rag import stream_generate
        chunks = []
        async for chunk in stream_generate("what is RAG?", duplicate_docs, []):
            chunks.append(chunk)

    first = json.loads(chunks[0].removeprefix("data: ").strip())
    assert len(first["sources"]) == 1
