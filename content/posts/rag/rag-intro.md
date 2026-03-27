---
title: "What is RAG?"
topic: rag
section: Introduction
order: 1
duration: 10
date: 2026-03-25
---

## The Core Idea

RAG stands for **Retrieval-Augmented Generation**. The name says exactly what it does: before generating an answer, the system first **retrieves** relevant information, then uses that information to **augment** the generation.

The key insight is simple: instead of expecting a model to know everything upfront, you give it access to external knowledge at the moment it needs it.

## RAG Is Not LLM-Specific

RAG is a general pattern. It shows up in many systems you already use:

**Search engines**
Google does not generate answers from scratch. It retrieves relevant web pages, then ranks and presents them. The retrieval step is RAG.

**Recommendation systems**
Netflix does not decide what to suggest by pure reasoning. It retrieves candidates based on your watch history, then ranks them. That is RAG.

**Customer support bots**
A support bot that looks up your order history before responding is doing RAG. It retrieves your data, then generates a relevant reply.

**Code assistants**
Tools like GitHub Copilot retrieve similar code snippets from a large corpus before suggesting a completion. Retrieval first, generation second.

## The General Pattern

Every RAG system has the same two-step structure:

```
User input
    │
    ▼
1. RETRIEVE: find relevant information from an external source
    │
    ▼
2. GENERATE: produce output using the retrieved information
    │
    ▼
Response
```

What changes between systems is what gets retrieved (web pages, documents, database rows, code) and how generation works (ranking, summarizing, completing, answering).

## Why RAG Matters

Any generative system has the same limitation: it can only work with what it already knows. RAG breaks that constraint by connecting generation to live, external knowledge.

This makes systems more accurate, more up-to-date, and more grounded in real information rather than approximations.

## What This Topic Covers

The rest of this topic focuses on **LLM-based RAG**: using retrieval to make large language models more accurate and less prone to hallucination.

This is the most widely used form of RAG today, and it is what powers most AI assistants, document Q&A tools, and knowledge base chatbots you will encounter in practice.

## Interview Questions

> _Q: What does RAG stand for and what is the core idea behind it?_

RAG stands for Retrieval-Augmented Generation. The core idea is to retrieve relevant external information at query time and use it to augment the generation process, rather than relying solely on what a model already knows. This makes outputs more accurate, more up-to-date, and grounded in real data.

> _Q: Is RAG specific to large language models?_

No. RAG is a general pattern that appears in many systems: search engines retrieve web pages before ranking results, recommendation systems retrieve candidates before scoring them, and code assistants retrieve similar snippets before suggesting completions. LLM-based RAG is the most prominent modern use case, but the retrieve-then-generate pattern predates LLMs.
