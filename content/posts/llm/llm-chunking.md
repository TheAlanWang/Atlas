---
title: "Chunking Strategies"
topic: rag
section: Core Concepts
order: 3
duration: 15
date: 2026-03-25
---

## Why Chunking Matters

You cannot embed an entire document as one vector. A 50-page PDF would produce a single embedding that averages out all the meaning, making retrieval imprecise.

Instead, you split documents into smaller pieces called **chunks**, embed each chunk separately, and store them individually. At query time, you retrieve only the specific chunks relevant to the question.

```
Bad:  entire document → 1 embedding → poor retrieval
Good: document split into 20 chunks → 20 embeddings → precise retrieval
```

The challenge is deciding how to split. Too small and chunks lose context. Too large and they dilute the meaning.

## Fixed-Size Chunking

The simplest strategy: split text every N characters, with an overlap between consecutive chunks.

```python
def fixed_size_chunks(text: str, chunk_size: int = 500, overlap: int = 50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap  # overlap keeps context between chunks
    return chunks

text = "..." # your document
chunks = fixed_size_chunks(text, chunk_size=500, overlap=50)
```

**Overlap** is important. Without it, a sentence split across two chunks loses coherence. Overlapping by 50–100 characters ensures no idea is cut off abruptly.

**When to use:** Simple documents with uniform structure, quick prototyping.

**Downside:** Splits mid-sentence or mid-paragraph, so chunks can be incoherent.

## Sentence / Paragraph Chunking

Split on natural language boundaries like sentences or paragraphs, instead of fixed character counts.

```python
import re

def paragraph_chunks(text: str):
    # Split on double newlines (paragraph breaks)
    paragraphs = re.split(r'\n\n+', text)
    return [p.strip() for p in paragraphs if p.strip()]
```

Each chunk is a complete paragraph, so it preserves meaning better than fixed-size splitting.

**When to use:** Articles, blog posts, documentation — any text with clear paragraph structure.

**Downside:** Paragraphs can vary wildly in length. Some may be too short, others too long.

## Recursive Chunking

A smarter approach: try to split on paragraph breaks first, then sentence breaks, then word breaks, recursively falling back to smaller separators until chunks fit the target size.

This is the approach used by LangChain's `RecursiveCharacterTextSplitter`:

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""]
)

chunks = splitter.split_text(text)
```

It tries `\n\n` first (paragraphs), then `\n` (lines), then `. ` (sentences), and so on. The result is chunks that respect natural language structure as much as possible.

**When to use:** Most general-purpose RAG pipelines. This is the default recommendation.

## Choosing Chunk Size

There is no universally correct chunk size. It depends on your documents and your retrieval needs.

| Chunk Size | Pros | Cons |
|---|---|---|
| Small (100–200 chars) | Precise retrieval | Loses surrounding context |
| Medium (400–600 chars) | Balanced | Good default for most cases |
| Large (1000+ chars) | Rich context | Dilutes meaning, higher cost |

A practical starting point: **chunk_size=500, overlap=50**.

After indexing, test with real queries and check whether the retrieved chunks actually contain the answer. If they don't, adjust.

## Chunk Size and the Context Window

The chunks you retrieve must fit inside the LLM's context window along with the system prompt and the user's question.

```
Context Window = system prompt + retrieved chunks + user question + response
```

If you retrieve `top_k=5` chunks of 500 tokens each, that is 2,500 tokens of context. Make sure this fits within your model's limit.

## Interview Questions

> _Q: What is chunking in a RAG pipeline and why is it necessary?_

Chunking is the process of splitting source documents into smaller pieces before embedding them. It is necessary because embedding an entire document produces a single vector that averages out all the meaning, making retrieval imprecise. Smaller chunks produce focused embeddings that map to specific ideas, so the vector search can return exactly the passage relevant to a query rather than an entire document.

> _Q: What is chunk overlap and why is it used?_

Chunk overlap means consecutive chunks share a small amount of text at their boundaries. It prevents ideas from being cut off abruptly when a sentence or concept spans a chunk boundary. Without overlap, a chunk might start mid-sentence, losing the context needed to understand it. A typical overlap is 50–100 characters or tokens.

> _Q: What is the trade-off between small and large chunk sizes?_

Small chunks produce precise, focused embeddings and retrieval is specific, but each chunk may lack enough surrounding context for the LLM to generate a good answer. Large chunks preserve more context but their embeddings average out many ideas, making retrieval less precise. They also consume more of the context window. The right size depends on the document type and query patterns; 400–600 characters is a common starting point.

> _Q: What is recursive chunking?_

Recursive chunking splits text by trying a hierarchy of separators in order — paragraph breaks first, then line breaks, then sentence boundaries, then words. It falls back to the next separator only when the current chunk exceeds the target size. This produces chunks that respect natural language structure as much as possible while staying within the size limit. LangChain's `RecursiveCharacterTextSplitter` is a popular implementation.
