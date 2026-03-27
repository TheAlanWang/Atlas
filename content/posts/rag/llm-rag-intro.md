---
title: "What is RAG and Why?"
topic: rag
section: Core Concepts
order: 1
duration: 15
date: 2026-03-25
---

## The Problem with LLMs Alone

LLMs are powerful, but they have two fundamental limitations:

**1. Knowledge cutoff.** An LLM's training data has a cutoff date. It knows nothing about events after that date.

**2. Hallucination.** When asked about specific or obscure facts, LLMs generate text that sounds correct but may be completely wrong.

```python
# Ask GPT-4o about your internal company policy
"What is our refund policy for orders over $500?"

# The model has never seen your policy document
# It will either say it doesn't know, or worse, make something up
```

You cannot solve this by putting all your documents into the system prompt either. Documents can be thousands of pages long, far too large to fit in any context window.

## What is RAG?

**RAG (Retrieval-Augmented Generation)** is a technique that gives an LLM access to external knowledge at query time by retrieving relevant documents and injecting them into the prompt.

Instead of relying on what the model memorized during training, you supply the model with the actual facts it needs to answer the question.

```
Without RAG:  User question → LLM → answer (from training memory)
With RAG:     User question → retrieve relevant docs → LLM + docs → grounded answer
```

## How RAG Works

RAG has two distinct phases:

### Phase 1: Indexing (done once, ahead of time)

1. Take your documents (PDFs, articles, database records)
2. Split them into smaller chunks
3. Convert each chunk into a vector embedding (a list of numbers that captures meaning)
4. Store the embeddings in a vector database

### Phase 2: Retrieval + Generation (done at query time)

1. User asks a question
2. Convert the question into an embedding using the same model
3. Search the vector database for the chunks most similar to the question
4. Inject those chunks into the prompt as context
5. LLM generates an answer grounded in the retrieved chunks

```python
# Simplified RAG flow
question = "What is the refund policy for orders over $500?"

# Step 1: embed the question
question_embedding = embed(question)

# Step 2: find the most relevant chunks
relevant_chunks = vector_db.search(question_embedding, top_k=3)

# Step 3: build the prompt with context
prompt = f"""
Answer the question using only the context below.

Context:
{relevant_chunks}

Question: {question}
"""

# Step 4: generate the answer
answer = llm.generate(prompt)
```

## Why RAG Works

RAG works because you are no longer asking the LLM to recall facts from memory. You are asking it to **read and summarize** a passage you have already retrieved, which is something LLMs are very good at.

The model's job shifts from "remember the answer" to "extract the answer from this text."

## RAG vs Fine-tuning

A common question is: why use RAG instead of fine-tuning the model on your documents?

| | RAG | Fine-tuning |
|---|---|---|
| **When knowledge updates** | Re-index documents | Re-train the model |
| **Cost** | Low (indexing only) | High (GPU training) |
| **Transparency** | Can show source chunks | Opaque |
| **Best for** | Dynamic, changing data | Teaching new behavior or style |

For most use cases involving private or frequently updated data, RAG is the right choice.

## Interview Questions

> _Q: What is RAG and what problem does it solve?_

RAG (Retrieval-Augmented Generation) is a technique that augments LLM responses with relevant documents retrieved at query time. It solves two core limitations of standalone LLMs: knowledge cutoff (the model has no information after its training date) and hallucination (the model making up facts it doesn't know). By injecting retrieved context into the prompt, the model can answer questions grounded in real, up-to-date documents.

> _Q: What are the two phases of a RAG pipeline?_

The indexing phase runs ahead of time: documents are split into chunks, each chunk is converted to a vector embedding, and the embeddings are stored in a vector database. The retrieval and generation phase runs at query time: the user's question is embedded, the vector database is searched for the most similar chunks, those chunks are injected into the prompt as context, and the LLM generates a grounded answer.

> _Q: Why is RAG generally preferred over fine-tuning for private knowledge bases?_

Fine-tuning bakes knowledge into the model's weights, which means every time your data changes you need to re-train, which is expensive and slow. RAG keeps knowledge external: updating your data is as simple as re-indexing documents. RAG is also more transparent because you can show users which source chunks were used to generate an answer. Fine-tuning is better suited for changing the model's behavior or style, not for injecting factual knowledge.

> _Q: What does "grounding" mean in the context of RAG?_

Grounding means anchoring the model's response to specific, retrieved source documents rather than relying on training memory. A grounded response is one where every claim can be traced back to a retrieved chunk. Grounding reduces hallucination because the model is summarizing text you provided, not generating facts from memory.
