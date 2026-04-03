---
title: "Metadata Filtering"
topic: rag
section: Core Retrieval Concepts
order: 4
duration: 14
date: 2026-03-29
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## What Metadata Filtering Is

Metadata filtering means narrowing the candidate set before or during retrieval using structured fields attached to each chunk.

Common metadata fields include:

- document type
- source
- customer or tenant id
- language
- product area
- created_at or updated_at

Instead of searching across every chunk in the system, you first restrict the search space to the subset that could possibly contain the answer.

## Why It Matters in RAG

Vector similarity alone is not enough.

Two chunks can be semantically similar but still be wrong for the current user or task.

Examples:

- a question about `enterprise refunds` should not retrieve `consumer refund` docs
- a support bot for tenant A should never retrieve data from tenant B
- a question about `2025 pricing` should not prefer archived `2023 pricing`

Metadata filtering improves both relevance and safety.

## Typical Retrieval Flow

```text
question
-> metadata filter
-> vector search on filtered subset
-> top-k chunks
```

This is especially useful when your corpus mixes multiple products, customers, languages, or time periods.

## Example

Suppose each chunk is stored with metadata:

```json
{
  "content": "Enterprise plans include SSO and audit logs.",
  "product": "enterprise",
  "doc_type": "pricing",
  "language": "en"
}
```

A question about enterprise pricing should search only chunks where:

- `product = enterprise`
- maybe `doc_type = pricing`
- maybe `language = en`

Without those filters, vector search may retrieve text that sounds similar but belongs to the wrong slice of your corpus.

## Pre-Filtering vs Post-Filtering

There are two common patterns:

### Pre-filtering

Apply filters before similarity search.

This is usually preferred because the vector search only runs on the relevant subset.

### Post-filtering

Run vector search first, then discard results that do not match the filter.

This is simpler in some systems but can hurt recall. A relevant chunk may never make the initial top-k if the search was dominated by a broader corpus.

For interview answers, the safe default is:

`prefer pre-filtering when your retrieval system supports it well`

## Where Metadata Filters Come From

Good filters usually come from one of three places:

1. application context
2. user identity or permissions
3. explicit query interpretation

Examples:

- user is already inside the `billing` section of the app
- current tenant id is known from auth
- the question explicitly mentions `Spanish docs` or `Q1 2025`

This is why metadata design is part of retrieval design, not just storage design.

## Failure Modes

Metadata filtering can also be misused.

Common mistakes:

- filters are too broad, so they do not help
- filters are too strict, so they hide relevant chunks
- metadata is missing or inconsistent across documents
- filters are applied after retrieval and silently reduce recall

A bad filter setup can make retrieval look random even when embeddings are fine.

## Key Questions

> _Q: Why do RAG systems need metadata filtering if they already use vector search?_

Because semantic similarity alone cannot enforce business constraints or document boundaries. Metadata filtering lets you restrict retrieval to the correct subset of the corpus, such as a tenant, product area, language, or date range. That improves both relevance and safety.

> _Q: What is the difference between pre-filtering and post-filtering?_

Pre-filtering restricts the candidate set before vector search, so retrieval runs only on the relevant subset. Post-filtering runs vector search first and removes mismatched results afterward. Pre-filtering is usually better because post-filtering can reduce recall if the truly relevant chunks never make the initial top-k.

> _Q: Give an example where metadata filtering is required, not optional._

Multi-tenant systems are the clearest example. If a support assistant serves multiple customers, retrieval must be filtered by tenant id before searching. Otherwise the system can retrieve semantically relevant chunks from the wrong customer's data, which is both incorrect and unsafe.
