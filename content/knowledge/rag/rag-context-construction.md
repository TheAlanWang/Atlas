---
title: "Context Construction"
topic: rag
section: Generation and Context
order: 1
duration: 14
date: 2026-03-30
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## What Context Construction Is

Context construction is the step where retrieved chunks are selected, ordered, and packaged before they are sent to the model.

Retrieval decides what is available.
Context construction decides what the model actually sees.

## Why It Matters

Good retrieval can still lead to a weak answer if the final context is poorly assembled.

Common problems:

- too many chunks
- duplicated chunks
- weak ordering
- important evidence buried late
- irrelevant instructions mixed into the prompt

RAG quality depends on context assembly, not just retrieval quality.

## Typical Decisions

Context construction usually answers questions like:

- how many chunks should be included?
- in what order?
- should adjacent chunks be merged?
- should metadata or citations be shown?

Those decisions affect how easy it is for the model to ground its answer.

## A Simple Strategy

A common baseline is:

1. keep only the highest-confidence chunks
2. remove near-duplicates
3. order by relevance and document logic
4. format the context consistently

The goal is not to maximize raw context volume. The goal is to maximize usable evidence.

## Bad Context Construction Example

Even with decent retrieval, this can fail:

```text
top-10 chunks
-> many duplicates
-> answer-bearing chunk placed last
-> prompt becomes noisy
```

The model may still produce a poor answer because the useful evidence is diluted.

## Good Mental Model

Think of context construction as evidence packaging.

The retriever gathers candidate evidence.
This step decides which pieces deserve the model's limited attention budget.

## Key Questions

> _Q: What is context construction in RAG?_

Context construction is the step that turns retrieved candidates into the final prompt context. It chooses which chunks to include, how to order them, and how to format them so the model sees the strongest evidence clearly.

> _Q: Why can a RAG system fail even when retrieval is decent?_

Because good candidates can still be assembled badly. If the final context is noisy, repetitive, or poorly ordered, the model may miss the key evidence or respond with a weaker answer.

> _Q: What is the main objective of context construction?_

The objective is to maximize usable evidence inside a limited context window. It is not about passing as many chunks as possible. It is about passing the right chunks in the right form.
