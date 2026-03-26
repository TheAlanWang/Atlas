---
title: "Building a RAG Pipeline"
topic: rag
section: Building
order: 4
duration: 25
date: 2026-03-25
---

## Overview

This article puts everything together: chunking, embeddings, vector search, and the Chat Completions API, into a working RAG pipeline.

We will build two things:

1. **An indexing script** that reads documents, chunks them, embeds each chunk, and stores them in Supabase
2. **A query function** that takes a user question, retrieves relevant chunks, and generates a grounded answer

## Setup

```bash
pip install openai supabase python-dotenv
```

```python
# .env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

In Supabase, run this SQL to create the documents table:

```sql
create extension if not exists vector;

create table documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536)
);
```

Also create a search function in Supabase:

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

## Part 1: Indexing

The indexing script reads your documents, splits them into chunks, embeds each chunk, and stores the result in Supabase.

```python
import os
from openai import OpenAI
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

openai_client = OpenAI()
supabase_client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_KEY"]
)

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def embed(text: str) -> list[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def index_document(text: str):
    chunks = chunk_text(text)
    print(f"Indexing {len(chunks)} chunks...")

    for chunk in chunks:
        embedding = embed(chunk)
        supabase_client.table("documents").insert({
            "content": chunk,
            "embedding": embedding
        }).execute()

    print("Done.")

# Example usage
with open("my_document.txt", "r") as f:
    text = f.read()

index_document(text)
```

Run this once (or whenever your documents change) to populate the vector database.

## Part 2: Retrieval + Generation

The query function embeds the user's question, retrieves the most relevant chunks, builds a prompt, and calls the LLM.

```python
def retrieve(question: str, top_k: int = 5) -> list[str]:
    question_embedding = embed(question)

    result = supabase_client.rpc("match_documents", {
        "query_embedding": question_embedding,
        "match_count": top_k
    }).execute()

    return [row["content"] for row in result.data]

def answer(question: str) -> str:
    chunks = retrieve(question)
    context = "\n\n---\n\n".join(chunks)

    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant. "
                    "Answer the question using only the context provided. "
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

# Example usage
question = "What is the refund policy for orders over $500?"
print(answer(question))
```

## The Full Flow

```
User question
     │
     ▼
Embed question (text-embedding-3-small)
     │
     ▼
Vector search in Supabase (match_documents)
     │
     ▼
Top-k relevant chunks retrieved
     │
     ▼
Build prompt: system + context + question
     │
     ▼
GPT-4o generates grounded answer
     │
     ▼
Return answer to user
```

## Key Design Decisions

**"Answer only from the context"**: The system prompt instructs the model to use only the retrieved chunks, not its training memory. This is what keeps the responses grounded.

**"If not in context, say you don't know"**: Without this instruction, the model may hallucinate an answer when no relevant chunk is retrieved. This instruction prevents that.

**top_k**: Retrieving more chunks gives the model more context but uses more of the context window. Start with `top_k=5` and tune based on your documents.

## Interview Questions

> _Q: Walk me through the steps of a RAG pipeline._

First, in the indexing phase: documents are split into chunks, each chunk is embedded using a model like `text-embedding-3-small`, and the embeddings are stored in a vector database alongside the original text. At query time: the user's question is embedded with the same model, the vector database is searched for the top-k most similar chunks using cosine similarity, those chunks are injected into the LLM prompt as context, and the LLM generates an answer grounded in the retrieved text.

> _Q: How do you prevent the LLM from hallucinating in a RAG system?_

Two main techniques: first, instruct the model in the system prompt to answer only from the provided context and to say "I don't know" if the answer is not there. Second, ensure the retrieval step actually returns relevant chunks — if the wrong chunks are retrieved, even a well-instructed model cannot answer correctly. Improving chunking strategy and embedding quality reduces retrieval failures.

> _Q: What happens when no relevant chunk is retrieved?_

If the vector search returns chunks that are unrelated to the question, the LLM will either generate an answer from its training memory (hallucination) or say it doesn't know, depending on how the system prompt is written. The correct behavior (saying "I don't know") should be enforced explicitly in the system prompt. You can also add a similarity threshold: if no chunk scores above a minimum similarity, skip the LLM call entirely and return a fallback response.

> _Q: How would you scale this pipeline for a large document corpus?_

For large corpora, add an index to the vector column in pgvector (`CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)`) to speed up similarity search. Use batch embedding to reduce API calls during indexing. Consider chunking strategy carefully — more documents means more chunks, so precise chunking becomes more important. For very large corpora, a managed vector database like Pinecone handles scaling automatically.
