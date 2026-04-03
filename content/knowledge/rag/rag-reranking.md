---
title: "Reranking"
topic: rag
section: Retrieval Optimization
order: 2
duration: 16
date: 2026-03-30
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## What Reranking Does

Reranking is a second-pass scoring step applied after initial retrieval.

Instead of trusting the vector database's first ordering, the system takes the top candidate chunks and asks a stronger model to sort them again by relevance.

```text
query
-> retrieve top-20
-> rerank top-20
-> keep best 5
```

That is the basic pattern.

## Why Reranking Helps

Initial retrieval is optimized for speed.

Rerankers are optimized for relevance.

This matters because the first retrieval pass often returns chunks that are:

- topically related
- partially relevant
- not the best answer-bearing evidence

Reranking improves the final ordering so the generation step sees cleaner context.

## Typical Model Choice

Rerankers are often cross-encoders or other relevance models that score:

- the query
- one candidate chunk at a time

They are slower than embedding search, which is why they are usually applied only to a small candidate set.

## What It Improves

Reranking usually helps with:

- precision at the top of the list
- noisy corpora
- long documents with many semantically similar chunks
- hybrid search pipelines with mixed candidates

It is especially useful when retrieval is "almost right" but the best chunks are not consistently first.

## What It Does Not Fix

Reranking is not a substitute for bad indexing.

It cannot rescue the system if:

- the answer-bearing chunk was never retrieved
- chunking is broken
- metadata filters are wrong

Reranking only improves ordering within the candidate set it receives.

## Latency Tradeoff

The main cost is latency.

A common production pattern is:

- broad first-pass retrieval
- rerank a small set such as top-20 or top-50
- pass only the best few chunks to generation

That keeps quality gains while limiting cost.

## Key Questions

> _Q: What is reranking in RAG?_

Reranking is a second-pass relevance scoring step applied after retrieval. The system first fetches a candidate set, then uses a stronger model to reorder those candidates so the best evidence appears at the top.

> _Q: Why not use the reranker on the whole corpus directly?_

Because rerankers are much slower than vector search. They compare the query against individual candidates in a more expensive way, so they are practical only after a fast first-pass retriever narrows the search space.

> _Q: What problem does reranking solve best?_

It is best at fixing ordering quality when retrieval is close but imperfect. If the right chunks are already in the candidate set but not ranked highly enough, reranking can move them to the top before generation.
