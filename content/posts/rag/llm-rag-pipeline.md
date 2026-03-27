---
title: "The RAG Pipeline"
topic: rag
section: Pipeline
order: 4
duration: 25
date: 2026-03-25
---

## What Is a RAG Pipeline?

RAG stands for **Retrieval-Augmented Generation**. The core idea: instead of asking an LLM to answer from memory, you first fetch relevant documents and hand them to the model as context.

A RAG system has two distinct pipelines that run at different times:

```
OFFLINE (runs once, or when docs change)
─────────────────────────────────────────
Documents → Chunk → Embed → Store in vector DB

ONLINE (runs on every user query)
─────────────────────────────────────────
User question → Embed → Search → Rerank → Inject context → LLM → Answer
```

Understanding this split is the first step. Let's walk through each stage.

---

## The Indexing Pipeline (Offline)

Before users can ask questions, you need to process your documents.

### Step 1: Chunk

Raw documents are too large to embed as a whole. You split them into smaller pieces — typically 300–500 tokens each, with some overlap so context doesn't get cut off at boundaries.

```python
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks
```

### Step 2: Embed

Each chunk is converted into a vector — a list of numbers that captures its meaning. Similar chunks will have vectors that are close together in space.

```python
from openai import OpenAI

client = OpenAI()

def embed(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding
```

### Step 3: Store

Store each (chunk, embedding) pair in a vector database. Here we use Supabase with pgvector.

First, set up the table in Supabase:

```sql
create extension if not exists vector;

create table documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536)
);
```

Then run the indexing script:

```python
from supabase import create_client
import os

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

def index_document(text: str):
    chunks = chunk_text(text)
    for chunk in chunks:
        embedding = embed(chunk)
        supabase.table("documents").insert({
            "content": chunk,
            "embedding": embedding
        }).execute()
```

Run this once to populate the database, then re-run whenever your documents change.

---

## The Query Pipeline (Online)

Every time a user asks a question, this pipeline runs.

### Step 1: Embed the question

Convert the user's question into a vector using the **same embedding model** used during indexing. This is important — the vectors need to exist in the same space to be comparable.

### Step 2: Search

Find the chunks whose vectors are closest to the question vector. This is cosine similarity search.

Create a search function in Supabase:

```sql
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (content text, similarity float)
language sql stable
as $$
  select
    content,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

Then call it from Python:

```python
def retrieve(question: str, top_k: int = 5) -> list[str]:
    question_embedding = embed(question)
    result = supabase.rpc("match_documents", {
        "query_embedding": question_embedding,
        "match_count": top_k
    }).execute()
    return [row["content"] for row in result.data]
```

### Step 3: Rerank (Optional but Recommended)

Vector search is fast but imprecise — it uses a lightweight bi-encoder model that compares embeddings independently. Reranking runs a more powerful cross-encoder model that looks at the question and each chunk *together*, producing a more accurate relevance score.

The typical pattern: retrieve a large candidate set (top-20), rerank, keep the best few (top-5).

```python
import cohere

co = cohere.Client(os.environ["COHERE_API_KEY"])

def rerank(question: str, chunks: list[str], top_n: int = 5) -> list[str]:
    results = co.rerank(
        model="rerank-english-v3.0",
        query=question,
        documents=chunks,
        top_n=top_n,
    )
    return [chunks[r.index] for r in results.results]

def retrieve(question: str) -> list[str]:
    candidates = retrieve_top_k(question, top_k=20)   # broad search
    return rerank(question, candidates, top_n=5)       # precise filter
```

If you don't want to add a dependency, you can skip reranking — it's an optimization, not a requirement.

### Step 4: Generate

Inject the retrieved chunks into the LLM prompt as context, then ask the model to answer.

```python
def answer(question: str) -> str:
    chunks = retrieve(question)
    context = "\n\n---\n\n".join(chunks)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "Answer using only the context below. "
                    "If the answer is not in the context, say you don't know."
                )
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}"
            }
        ]
    )
    return response.choices[0].message.content
```

---

## Key Design Decisions

**Why chunk at all?**
Embedding models have a token limit (~8k for `text-embedding-3-small`). More importantly, smaller chunks improve retrieval precision — a 500-token chunk is more likely to be topically focused than a 5,000-token document.

**Why overlap?**
If a key sentence falls right at the boundary between two chunks, both chunks would miss half the context. Overlap ensures no boundary is a hard cut.

**"Answer only from the context"**
Without this instruction, the LLM falls back to its training memory when retrieved chunks are weak or irrelevant. This causes hallucination. The system prompt is your guardrail.

**Bi-encoder vs cross-encoder**
Embedding models (bi-encoders) encode query and document separately — fast, but less accurate. Rerankers (cross-encoders) encode them together — slower, but significantly more accurate. Using both gives you the best of each: speed from vector search, precision from reranking.

**top_k**
More chunks = more context = better answers, but also higher cost and token usage. With reranking: retrieve `top_k=20` candidates, rerank to `top_n=5`.

---

## Interview Questions

> _Q: Walk me through the stages of a RAG pipeline._

A RAG pipeline has two phases. In the **indexing phase** (offline): documents are chunked, each chunk is embedded using a model like `text-embedding-3-small`, and the (chunk, embedding) pairs are stored in a vector database. In the **query phase** (online): the user's question is embedded with the same model, the vector database performs a similarity search to find the top-k most relevant chunks, those chunks are injected into the LLM prompt as context, and the model generates an answer grounded in the retrieved text.

> _Q: Why do you use the same embedding model for both indexing and querying?_

Embeddings only have meaning relative to each other within the same model's vector space. If you embed documents with model A and queries with model B, the resulting vectors are not comparable — cosine similarity between them would be meaningless. The model must be the same so that similar text maps to nearby vectors.

> _Q: How do you prevent hallucination in a RAG system?_

Two main approaches: First, instruct the model in the system prompt to answer only from the provided context and say "I don't know" when the answer isn't there. Second, ensure retrieval actually returns relevant chunks — bad retrieval quality means even a well-instructed model can't answer correctly. Improving chunking strategy (size, overlap, semantic splitting) and using a better embedding model both reduce retrieval failures.

> _Q: What happens when no relevant chunk is retrieved?_

If retrieved chunks are unrelated to the question, the LLM will either hallucinate or say it doesn't know, depending on the system prompt. The correct behavior must be enforced explicitly. You can also add a similarity threshold: if no chunk scores above a minimum similarity (e.g., 0.75), skip the LLM call entirely and return a fallback like "I couldn't find relevant information."

> _Q: How would you scale this pipeline for a large document corpus?_

Add an index to the vector column in pgvector (`CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)`) to speed up approximate nearest neighbor search. Use batch embedding during indexing to reduce API calls. For very large corpora, consider a managed vector database like Pinecone or Weaviate, which handle sharding and scaling automatically.
