---
title: "Retrieval"
topic: rag
section: Core Retrieval Concepts
order: 5
duration: 18
date: 2026-03-28
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## What Retrieval Means in RAG

Retrieval is the step where a user question is used to fetch the most relevant chunks from your indexed knowledge base.

This is the highest-leverage part of a RAG system. If retrieval returns the wrong chunks, the model is forced to answer from weak evidence or from memory.

```text
question -> embed -> similarity search -> top-k chunks
```

That is the core retrieval loop.

## The Goal of Retrieval

Retrieval is trying to do two things at the same time:

- maximize recall: do not miss the chunk that contains the answer
- maximize precision: do not send too much irrelevant context to the model

Those two goals fight each other.

If you retrieve too few chunks, you miss relevant evidence. If you retrieve too many, the model gets distracted by noise.

## Basic Vector Retrieval

The standard setup is:

1. Embed the question
2. Compare it against stored chunk embeddings
3. Return the nearest neighbors

```python
def retrieve(question: str, top_k: int = 5) -> list[str]:
    question_embedding = embed(question)
    result = supabase.rpc("match_documents", {
        "query_embedding": question_embedding,
        "match_count": top_k,
    }).execute()
    return [row["content"] for row in result.data]
```

This is usually the first version of any RAG system.

## What `top_k` Really Controls

`top_k` is one of the most important retrieval settings.

| Setting | Risk |
|---|---|
| Too low | Relevant evidence is missed |
| Too high | Context window fills with noise |

There is no universal best value. The right number depends on chunk size, document style, and how much context your generation step can tolerate.

A common production pattern is:

- retrieve a broader candidate set
- apply filtering or reranking
- pass only the best few chunks to the LLM

## Similarity Thresholds

Nearest-neighbor search always returns something, even when nothing is actually relevant.

That is dangerous. A bad RAG system often looks like:

```text
no real match
-> top-k still returned
-> model receives irrelevant context
-> hallucinated answer
```

A similarity threshold prevents obviously weak matches from reaching generation.

```python
def retrieve_with_threshold(question: str, top_k: int = 5, threshold: float = THRESHOLD):
    question_embedding = embed(question)
    result = supabase.rpc("match_documents", {
        "query_embedding": question_embedding,
        "match_count": top_k,
    }).execute()

    return [
        row["content"]
        for row in result.data
        if row["similarity"] >= threshold
    ]
```

If no chunk clears the threshold, the system should return a fallback instead of pretending it found evidence.

The important caution is that thresholds are not portable constants.

Their meaning depends on:

- the embedding model
- the similarity metric
- the index behavior
- score calibration on your own corpus

So the correct interview answer is not "use 0.75." The correct answer is "calibrate thresholds on representative queries."

## Common Retrieval Failure Modes

Low retrieval quality usually comes from one of these:

1. Chunking is poor, so the answer is split or diluted
2. The embedding model is weak for the domain
3. `top_k` is too small
4. Metadata filters are missing or too broad
5. The retrieved chunks are close semantically but still not answer-bearing

This is why debugging retrieval is never just about the vector database.

## Retrieval vs Retrieval Optimization

This article is about the core retrieval step.

These are related but separate optimization topics:

- metadata filtering
- hybrid search
- reranking
- query rewriting
- query expansion
- HyDE

Those methods improve retrieval, but they are not the base retrieval loop itself.

It is useful to separate them more clearly:

- hybrid search and reranking act on candidate retrieval and ordering
- query rewriting, expansion, and HyDE change the retrieval input itself

## Key Questions

> _Q: What does retrieval do in a RAG system?_

Retrieval takes the user's question, converts it into an embedding, and uses that embedding to search an indexed knowledge base for the most relevant chunks. Those chunks are then passed to the generation step as evidence. Its job is to surface the right information before the LLM answers.

> _Q: Why is retrieval often the most important part of RAG?_

Because generation quality is capped by retrieval quality. If the retrieved chunks are irrelevant or incomplete, the model either hallucinates or produces an incomplete answer. A stronger model cannot fully compensate for missing evidence.

> _Q: What does `top_k` control?_

`top_k` controls how many candidate chunks are returned from retrieval. Increasing it improves recall because you are less likely to miss relevant evidence, but it also lowers precision because more irrelevant chunks are included. The right value balances recall and noise.

> _Q: Why use a similarity threshold in retrieval?_

A similarity threshold prevents weak matches from being treated as valid evidence. Without it, the vector database still returns nearest neighbors even when all of them are poor matches. But thresholds must be calibrated on your own system. Their values depend on the embedding model, scoring method, and corpus, so there is no universal cutoff that works everywhere.
