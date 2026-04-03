---
title: "Chunking Strategies"
topic: rag
section: Core Retrieval Concepts
order: 1
duration: 15
date: 2026-03-25
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## Why Chunking Exists

RAG systems usually do not retrieve whole documents. They retrieve smaller pieces of them.

That is what chunking does:

- split a document into smaller units
- embed those units separately
- retrieve only the units most relevant to the query

Without chunking, a long document gets compressed into one broad embedding and retrieval becomes too coarse.

## The Real Tradeoff

Chunking is a tradeoff between:

- precision
- context

Small chunks improve precision because each chunk stays focused on one idea.
Large chunks preserve more surrounding context.

Neither extreme is ideal:

- too small: the answer-bearing fact is detached from its explanation
- too large: multiple ideas are blended into one embedding

## Think in Tokens, Not Characters

For RAG, token-based thinking is more useful than character-based thinking.

The model consumes tokens, the context window is measured in tokens, and retrieval cost is felt in tokens.

That is why chunk size discussions should usually be framed as:

- how many tokens per chunk?
- how many chunks will be retrieved?
- how much total context budget remains for the answer?

## Common Chunking Strategies

### Fixed-size chunking

Split every N tokens with overlap.

This is easy to implement and a good baseline, but it can break semantic boundaries.

### Structure-aware chunking

Split on paragraphs, sections, or headings first.

This usually produces more coherent chunks because document structure is preserved.

### Recursive chunking

Try larger semantic boundaries first, then fall back to smaller ones until the chunk fits the target size.

This is a strong default for general-purpose RAG systems.

## Why Overlap Helps

Overlap exists because useful context often sits near chunk boundaries.

Without overlap, a key sentence can get cut away from the sentence that explains it.

Too much overlap, however, creates duplicates and increases retrieval noise.

So overlap should be treated as a controlled compromise, not a default to maximize blindly.

## How to Choose a Starting Point

A practical starting point is:

- moderate token size
- small overlap
- structure-aware or recursive splitting

Then validate with real queries.

The right chunking strategy depends on the corpus:

- API docs often benefit from section-aware chunks
- policies may need larger chunks to preserve conditions and exceptions
- support knowledge bases often benefit from smaller, tighter chunks

## A Common Failure Pattern

When chunking is wrong, retrieval often looks "almost right."

Typical symptoms:

- the retrieved chunk is relevant but missing the answer
- the answer spans two chunks and neither is sufficient alone
- multiple chunks say similar things but the most useful one is diluted

Those are chunking failures before they are retrieval failures.

## Key Questions

> _Q: What is chunking in RAG, and why is it necessary?_

Chunking is the process of splitting source documents into smaller retrievable units before embedding them. It is necessary because long documents are too broad to embed and retrieve effectively as a single vector.

> _Q: What is the tradeoff between small and large chunks?_

Small chunks improve precision because each embedding represents a narrow idea, but they may lose surrounding context. Large chunks preserve context, but they blur multiple ideas together and consume more context budget during generation.

> _Q: Why is overlap used in chunking?_

Overlap helps preserve information near chunk boundaries so important context is not split apart. But too much overlap creates duplicates, which can hurt retrieval quality and waste context window space.

> _Q: Why is recursive or structure-aware chunking often better than naive fixed-size chunking?_

Because it respects document structure. When chunks align with sections, paragraphs, or semantic boundaries, the retrieved evidence is usually more coherent and easier for the model to use.
