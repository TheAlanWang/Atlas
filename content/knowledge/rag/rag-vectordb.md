---
title: "Vector DB"
topic: rag
section: Core Retrieval Concepts
order: 3
duration: 15
date: 2026-03-25
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## What a Vector Database Does

A vector database stores embeddings and retrieves the nearest ones for a query vector.

That sounds simple, but it solves a real systems problem:

`how do you search millions of vectors fast enough for user-facing retrieval?`

That is why vector databases matter in RAG.

## What It Is Responsible For

A vector database typically handles:

- storing embeddings
- nearest-neighbor search
- vector indexes
- filtering support
- operational scale

It is infrastructure for retrieval, not the source of retrieval intelligence.

## Exact Search vs Approximate Search

At small scale, exact nearest-neighbor search is possible.

At production scale, most systems rely on approximate nearest-neighbor search, often called ANN.

The idea is to trade a small amount of search accuracy for much better latency.

That tradeoff is usually worth it in real RAG systems.

## Why Index Choice Matters

Vector search quality is not only about the embedding model. Index choice also affects:

- latency
- memory usage
- recall
- build time

A strong interview answer should mention that vector databases are not interchangeable by default. Different systems make different tradeoffs in speed, recall, filtering, and operations.

For example, in pgvector:

- HNSW usually gives strong recall with higher memory cost
- IVF can be cheaper or lighter, but often needs more tuning and may lose recall more easily

The exact winner depends on scale, latency targets, and operational constraints.

That is the level of tradeoff interviewers usually want to hear.

## Vector DB Is Not the Whole Retriever

A common misconception is that the vector DB alone determines retrieval quality.

It does not.

Retrieval quality also depends on:

- chunking
- embeddings
- metadata filtering
- reranking

The vector DB only searches the candidates defined by those earlier choices.

## Choosing Between Options

The main decision is usually not "which database is coolest."

It is:

- do you already use Postgres?
- do you want a managed service?
- do you need hybrid search?
- do you need strong filtering support?
- how much operational control do you want?

`pgvector` is a strong choice when you already live in Postgres.
Managed systems are attractive when you want faster setup and less infrastructure work.

## Key Questions

> _Q: What does a vector database do in a RAG system?_

A vector database stores document embeddings and performs nearest-neighbor search for the query embedding. Its job is to return the most similar candidates quickly enough for retrieval to work at scale.

> _Q: What is approximate nearest-neighbor search, and why is it used?_

Approximate nearest-neighbor search is a faster search method that gives up a small amount of exactness in exchange for much lower latency. It is widely used because exact search becomes too expensive once the vector corpus grows large.

> _Q: Does a better vector database automatically mean better retrieval?_

No. The vector database affects search speed, recall, and operational behavior, but retrieval quality still depends heavily on chunking, embeddings, filtering, and reranking. A strong database cannot fully compensate for weak upstream choices.

> _Q: When is pgvector a good choice?_

pgvector is a good choice when your team already uses PostgreSQL and wants to keep the architecture simple. It lets you add vector search without introducing a completely separate storage system.
