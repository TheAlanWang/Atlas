---
title: "Embeddings & Vector Search"
topic: rag
section: Core Concepts
order: 2
duration: 20
date: 2026-03-25
---

## What is an Embedding?

An embedding is a way to represent text as a list of numbers (a vector). The key property is that **similar meaning → similar numbers**.

```
"dog"  → [0.21, -0.45, 0.87, ...]  (1536 numbers)
"puppy" → [0.23, -0.43, 0.85, ...]  (very similar)
"car"   → [-0.62, 0.11, -0.34, ...]  (very different)
```

This allows a computer to measure semantic similarity mathematically, which a simple keyword search cannot do.

## Generating Embeddings with OpenAI

OpenAI's `text-embedding-3-small` model converts any text into a 1536-dimensional vector:

```python
from openai import OpenAI

client = OpenAI()

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="What is a context window?"
)

embedding = response.data[0].embedding
print(len(embedding))   # 1536
print(embedding[:5])    # [-0.021, 0.043, -0.018, 0.076, -0.031]
```

You use the same model to embed both your documents and the user's query. This ensures they live in the same vector space and can be compared.

## Cosine Similarity

To find how similar two vectors are, we use **cosine similarity**. It measures the angle between two vectors:

- Score of `1.0` → identical meaning
- Score of `0.0` → completely unrelated
- Score of `-1.0` → opposite meaning

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

embedding_a = embed("dog")
embedding_b = embed("puppy")
embedding_c = embed("airplane")

print(cosine_similarity(embedding_a, embedding_b))  # ~0.92 (very similar)
print(cosine_similarity(embedding_a, embedding_c))  # ~0.21 (unrelated)
```

In practice, you do not compute this yourself. The vector database handles it.

## What is a Vector Database?

A vector database is a database optimized for storing and searching embeddings. Given a query vector, it efficiently finds the most similar vectors. This is called **nearest neighbor search**.

Popular options:

| Database | Notes |
|---|---|
| **pgvector** | PostgreSQL extension, great for existing Postgres setups |
| **Pinecone** | Fully managed, no infrastructure to run |
| **Weaviate** | Open source, supports hybrid search |
| **Chroma** | Lightweight, great for local development |

In Atlas, we use **Supabase with pgvector**, a regular PostgreSQL database with vector search capabilities added.

## Storing Embeddings in Supabase (pgvector)

First, enable the pgvector extension and create a table:

```sql
-- Enable pgvector
create extension if not exists vector;

-- Create a table to store document chunks and their embeddings
create table documents (
  id bigserial primary key,
  content text,
  embedding vector(1536)
);
```

Then insert a chunk with its embedding from Python:

```python
import openai
import supabase

chunk = "RAG stands for Retrieval-Augmented Generation."

embedding = client.embeddings.create(
    model="text-embedding-3-small",
    input=chunk
).data[0].embedding

supabase_client.table("documents").insert({
    "content": chunk,
    "embedding": embedding
}).execute()
```

## Searching for Similar Chunks

To find the most relevant chunks for a query, embed the query and run a similarity search:

```sql
-- Find the 3 most similar chunks to a query embedding
select content, 1 - (embedding <=> '[0.021, -0.043, ...]') as similarity
from documents
order by embedding <=> '[0.021, -0.043, ...]'
limit 3;
```

The `<=>` operator is pgvector's cosine distance operator. You can wrap this in a Supabase RPC function and call it from your application.

## Keyword Search vs Vector Search

| | Keyword Search | Vector Search |
|---|---|---|
| **How it works** | Exact word matching | Semantic similarity |
| **"dog" finds "puppy"?** | No | Yes |
| **Speed** | Very fast | Fast (with indexing) |
| **Best for** | Exact matches, IDs | Meaning-based retrieval |

Vector search finds semantically related content even when the exact words don't match, which is why it is central to RAG.

## Interview Questions

> _Q: What is a vector embedding and why is it used in RAG?_

A vector embedding is a numerical representation of text as a list of floating-point numbers. Embeddings are trained so that semantically similar text produces similar vectors. In RAG, both documents and the user's query are converted to embeddings so that a vector database can find the most semantically relevant document chunks for a given query, even when the exact words don't match.

> _Q: What is cosine similarity and why is it used to compare embeddings?_

Cosine similarity measures the angle between two vectors, returning a score between -1 and 1. A score close to 1 means the vectors point in the same direction, indicating semantically similar content. It is preferred over Euclidean distance for embeddings because it captures orientation (meaning) rather than magnitude (length), making it robust regardless of how long or short the text is.

> _Q: What is the difference between keyword search and vector search?_

Keyword search matches documents that contain the exact query words. Vector search converts both the query and documents to embeddings and finds documents with similar meaning, even if different words are used. For example, searching "dog" with vector search can surface results about "puppy" or "canine." RAG systems use vector search because users rarely phrase their question using the exact words in the source document.

> _Q: What is pgvector?_

pgvector is a PostgreSQL extension that adds a native `vector` data type and operators for similarity search (cosine distance, L2 distance, inner product). It allows you to store embeddings directly in a Postgres table and query them with SQL, making it a practical choice when you already use PostgreSQL (such as with Supabase) without needing a separate vector database.
