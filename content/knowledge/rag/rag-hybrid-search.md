---
title: "Hybrid Search"
topic: rag
section: Retrieval Optimization
order: 1
duration: 14
date: 2026-03-30
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## What Hybrid Search Means

Hybrid search combines vector search with keyword-based retrieval such as BM25.

The goal is simple:

- vector search captures semantic similarity
- keyword search captures exact terms, entities, and identifiers

Some RAG systems benefit from both.

## Why Vector Search Alone Is Not Enough

Pure vector retrieval is strong when the wording changes but the meaning stays the same.

It is weaker when the question depends on exact terms such as:

- product names
- error codes
- API field names
- legal clauses
- version numbers

A query like `ERR_403_TOKEN_EXPIRED` should not rely only on semantic similarity.

## Basic Retrieval Pattern

```text
query
-> vector search
-> keyword search
-> merge scores
-> final candidate set
```

Some systems blend the scores directly. Others retrieve from both systems separately and merge the candidate lists before reranking.

## When Hybrid Search Helps Most

Hybrid search is especially useful when your corpus contains:

- technical documentation
- support content
- product specs
- structured business terminology

Those corpora mix semantic meaning with exact tokens. That is exactly where hybrid retrieval helps.

The sharper way to say this in interviews is:

`hybrid search is most useful when lexical constraints matter and pure semantic retrieval under-recovers them`

That is the real reason to add it.

## Tradeoff to Understand

Hybrid search improves recall, but it can also increase system complexity.

You now need to think about:

- two retrieval signals instead of one
- score normalization
- result merging
- higher latency

In practice, hybrid search is most useful when keyword precision adds something that embeddings consistently miss.

## When Not to Reach for It

Hybrid search is not automatically the next step after vector search.

It is often unnecessary when:

- the corpus is small and clean
- exact terms rarely matter
- semantic retrieval is already strong enough
- latency budget is tight

If lexical precision is not the actual problem, hybrid search adds complexity without solving the real bottleneck.

## Hybrid Search vs Reranking

These are related but different:

- hybrid search improves candidate retrieval
- reranking improves candidate ordering

A common production setup is:

```text
hybrid retrieval
-> merged candidate set
-> reranker
-> final top chunks
```

## Key Questions

> _Q: What is hybrid search in a RAG system?_

Hybrid search combines semantic retrieval and keyword retrieval. The vector side handles meaning, while the keyword side preserves exact matches such as names, codes, or version strings. It is used when either signal alone is not reliable enough.

> _Q: When does hybrid search help more than pure vector search?_

It helps most when the corpus contains important exact tokens like product names, API parameters, ticket ids, or legal wording. In those cases, lexical constraints matter and pure semantic retrieval tends to under-recover exact matches that users actually care about.

> _Q: How is hybrid search different from reranking?_

Hybrid search changes how candidates are retrieved. Reranking changes how already retrieved candidates are ordered. Hybrid search improves recall and coverage, while reranking improves final relevance among the candidates.

> _Q: When is hybrid search not worth the extra complexity?_

It is often not worth it when semantic retrieval already works well, exact-token matching is not important, or latency and operational simplicity matter more than squeezing out additional recall. It should be added to solve a real lexical retrieval gap, not as a default feature.
