---
title: "The RAG Pipeline"
topic: rag
section: Introduction
order: 2
duration: 18
date: 2026-03-25
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## What a RAG Pipeline Actually Is

A RAG system has one job: fetch the right context before asking the model to answer.

That sounds simple, but in practice it means you are running two separate pipelines:

```text
OFFLINE / INDEXING
documents -> chunk -> embed -> store

ONLINE / QUERY TIME
question -> embed -> retrieve -> build context -> generate
```

If a candidate cannot explain those two phases clearly, they usually do not really understand RAG yet.

In interviews, the point is not just to list the stages. The point is to explain where the main tradeoffs and failures live.

## Phase 1: Indexing

The indexing pipeline prepares your data before any user asks a question.

1. Break source documents into chunks
2. Convert each chunk into an embedding
3. Store the chunk text, metadata, and embedding in a retrieval system

This phase runs when documents are added or updated, not on every query.

The main goal is to make later retrieval accurate and cheap.

## Phase 2: Query-Time Retrieval and Generation

At query time, the system does the following:

1. Embed the user question with the same embedding model used during indexing
2. Retrieve candidate chunks from the vector store
3. Optionally rerank or filter those chunks
4. Build a prompt using the selected context
5. Ask the LLM to answer using that context

This phase runs on every user request, so latency matters much more here.

## Where RAG Pipelines Usually Fail

Most RAG systems do not fail because the LLM is weak. They fail because one stage in the pipeline is poorly designed.

| Stage | Typical failure |
|---|---|
| Chunking | Chunks are too large, too small, or cut in the wrong places |
| Embedding | Weak model, or different models used for indexing and querying |
| Retrieval | Relevant chunks are not returned in the top-k |
| Context building | Good chunks are retrieved but assembled poorly |
| Generation | The model ignores context or over-generalizes |

That is why interviewers often ask you to debug the pipeline step by step rather than discuss RAG in abstract terms.

Most production failures are retrieval, freshness, or context assembly failures before they are model failures.

## A Good Mental Model

Think of the pipeline as a narrowing funnel:

```text
all documents
-> candidate chunks
-> top-k retrieved chunks
-> final context window
-> grounded answer
```

Each stage should reduce noise without dropping useful information.

If you lose relevant information too early, generation cannot recover it later.

## Design Trade-Offs

Three trade-offs show up everywhere in RAG pipeline design:

- Recall vs precision: retrieve more chunks to avoid missing answers, or fewer chunks to reduce noise
- Quality vs latency: reranking and query rewriting improve accuracy but add cost and delay
- Freshness vs maintenance cost: more frequent re-indexing keeps knowledge current but increases operational work

These trade-offs matter more in interviews than memorizing tool names.

Another useful framing is:

- better retrieval quality often means more moving parts
- simpler pipelines are easier to operate, but usually less precise

That is why production RAG is a systems problem, not just a prompt problem.

## What This Article Does Not Cover

This article is the overview. The details belong elsewhere:

- chunking strategy
- embeddings
- vector databases
- metadata filtering
- retrieval optimization
- evaluation

If one article tries to fully teach all of those, it stops being a pipeline overview and becomes repetitive.

## Key Questions

> _Q: Walk me through a RAG pipeline from documents to final answer._

A RAG pipeline has two phases. In the offline indexing phase, documents are chunked, embedded, and stored in a retrieval system. In the online query phase, the user's question is embedded, relevant chunks are retrieved, optional filtering or reranking is applied, a context window is built from the selected chunks, and the LLM generates an answer grounded in that context.

> _Q: Why do people separate indexing from query-time retrieval?_

Indexing is expensive but infrequent. Query-time retrieval must be fast because it runs on every request. Separating them lets you precompute embeddings and store them once, instead of repeating heavy preprocessing for every user question.

> _Q: Which stage matters most in a RAG pipeline?_

Retrieval quality usually matters most. If the system retrieves irrelevant or incomplete chunks, even a strong LLM cannot produce a correct grounded answer. Good generation cannot fix bad retrieval.

> _Q: Why does a RAG pipeline need more than just vector search?_

Vector search gives you candidate chunks, but production systems often also need metadata filtering, reranking, thresholding, and context construction. Otherwise the system either returns too much noise or misses the most useful evidence.

> _Q: What tradeoffs matter most in a RAG pipeline interview answer?_

The most important ones are recall versus precision, quality versus latency, and freshness versus maintenance cost. A strong answer should show that improving one part of the pipeline often makes another part more expensive or more complex.
