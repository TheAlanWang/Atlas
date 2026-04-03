---
title: "What is RAG?"
topic: rag
section: Introduction
order: 1
duration: 16
date: 2026-03-25
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## The Core Idea

RAG stands for **Retrieval-Augmented Generation**.

The idea is simple:

1. retrieve external information
2. give that information to the model as context
3. ask the model to answer from that context

Instead of expecting the model to know everything from training, you let it look things up at query time.

## Why RAG Exists

LLMs have two major limitations:

- they do not know data added after training
- they can hallucinate when asked for specific facts

RAG helps with both by grounding the answer in external documents, but it does not eliminate hallucination on its own.

The most useful way to describe RAG in interviews is:

`RAG is a knowledge access pattern, not a reasoning upgrade`

It helps the model read the right information at query time. It does not automatically make the model smarter.

## A Simple Example

Imagine a support assistant asked:

```text
What is our refund policy for enterprise plans?
```

If the answer lives in an internal policy document, a plain LLM may guess.

A RAG system instead:

1. finds the relevant policy chunks
2. places them into the prompt
3. asks the model to answer using only that evidence

That changes the model's job from "remember the answer" to "read the answer from retrieved text."

## What RAG Is Not

RAG is not the same as fine-tuning.

- RAG keeps knowledge outside the model and retrieves it at query time
- fine-tuning changes the model's weights

For most factual, changing, or private knowledge bases, RAG is the better first choice. The deeper comparison belongs in a dedicated `RAG vs Fine-tuning` article.

## The Two-Phase Mental Model

Every RAG system has two broad phases:

- indexing: prepare documents for retrieval
- query time: retrieve evidence and generate an answer

That is the basic mental model you should hold before diving into chunking, embeddings, vector databases, or evaluation.

## The Core Trade-Offs

RAG is attractive because it improves freshness and grounding, but it introduces system trade-offs:

- better factual grounding vs more retrieval complexity
- fresher knowledge vs indexing and maintenance work
- higher answer quality vs more latency at query time

That tradeoff framing is often what interviewers actually want.

## Why Interviewers Ask About RAG

RAG is not just an AI buzzword. It is a system design pattern.

Interviewers ask about it because it tests whether you understand:

- how to connect models to changing knowledge
- how retrieval quality affects answer quality
- how to trade off latency, precision, and recall
- how to reduce hallucination in practical systems

They are usually not testing whether you memorized the acronym. They are testing whether you understand the tradeoffs of connecting models to external knowledge.

## Key Questions

> _Q: What does RAG stand for?_

RAG stands for Retrieval-Augmented Generation. It means retrieving relevant external information first, then using that retrieved information to augment the model's generation.

> _Q: Why do people use RAG instead of relying only on an LLM?_

Because LLMs have knowledge cutoffs and can hallucinate. RAG lets the system answer from current or private documents at query time, which improves factual accuracy and grounding.

> _Q: What does grounding mean in RAG?_

Grounding means the model's answer is anchored to retrieved evidence rather than generated from memory alone. A grounded answer should be traceable back to specific chunks.

> _Q: What is the most important tradeoff introduced by RAG?_

RAG improves freshness and grounding, but it adds retrieval infrastructure, latency, and more failure points. You are trading a simpler pure-model system for a more controllable but more complex system.
