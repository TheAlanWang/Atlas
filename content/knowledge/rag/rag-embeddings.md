---
title: "Embeddings"
topic: rag
section: Core Retrieval Concepts
order: 2
duration: 15
date: 2026-03-25
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## What an Embedding Is

An embedding is a vector representation of text.

The important property is not that it is "a list of numbers." The important property is that text with similar meaning is mapped to nearby points in vector space.

That is what makes semantic retrieval possible.

## Why Embeddings Matter in RAG

In RAG, both document chunks and the user's query are embedded into the same vector space.

```text
chunk -> embedding
query -> embedding
nearest vectors -> retrieved candidates
```

If the embedding model is weak, retrieval quality is capped before reranking or generation even begins.

## What a Good Embedding Model Needs to Capture

A useful embedding model should preserve:

- semantic similarity
- domain terminology
- paraphrases
- enough distinction between closely related concepts

For example, a strong model should understand that:

- `refund window` and `money-back guarantee` are related
- `enterprise pricing` and `consumer pricing` are not interchangeable

That distinction is what turns raw text into retrievable knowledge.

## Similarity and Vector Search

Once text is embedded, retrieval systems compare vectors using measures such as cosine similarity or inner product.

You usually do not compute those scores manually. The vector database handles that part.

The main interview point is:

`embeddings define the retrieval space; the vector database only searches inside it`

## Model Choice Tradeoffs

Choosing an embedding model is a tradeoff across:

- quality
- cost
- latency
- dimensionality
- domain fit

The best model is not always the largest one. A cheaper model with strong domain coverage can outperform a larger general-purpose model on your actual corpus.

## A Common Failure Mode

A frequent mistake is treating embeddings as a solved infrastructure detail.

They are not.

If the model does not represent your domain well, you will see:

- relevant chunks not retrieved
- semantically close but wrong chunks retrieved
- unstable behavior across similar queries

That often gets misdiagnosed as a vector DB problem when it is really an embedding problem.

## Key Questions

> _Q: What is an embedding and why is it important in RAG?_

An embedding is a vector representation of text where semantically similar content is placed near each other in vector space. In RAG, both documents and queries are embedded so the retriever can find meaning-based matches instead of relying only on exact keywords.

> _Q: What do embeddings do that keyword search cannot do well?_

Embeddings allow retrieval to match based on meaning rather than exact wording. That means a query can retrieve relevant chunks even when the source document uses different phrasing, synonyms, or paraphrases.

> _Q: Why is the embedding model such a high-leverage choice in a RAG system?_

Because it defines the retrieval space itself. If semantically important distinctions are not preserved in the embedding space, the rest of the pipeline is working with weak candidates from the start.

> _Q: Why must indexing and querying use the same embedding model?_

Because both documents and queries need to live in the same vector space. If they are embedded with different models, similarity scores become inconsistent and retrieval quality breaks down.
