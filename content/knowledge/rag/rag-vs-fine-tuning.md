---
title: "RAG vs Fine-tuning"
topic: rag
section: Evaluation and Failure Modes
order: 3
duration: 14
date: 2026-03-30
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## The Core Difference

RAG and fine-tuning solve different problems.

- RAG gives the model external knowledge at runtime
- fine-tuning changes the model's behavior or style through training

They are not interchangeable.

## When RAG Is the Better Choice

RAG is usually the better choice when:

- knowledge changes often
- you need citations or traceable sources
- you must respect document freshness
- the answer should come from a known corpus

RAG is fundamentally a knowledge access pattern.

## When Fine-tuning Helps More

Fine-tuning is more useful when you want to change:

- output style
- task behavior
- instruction following
- domain-specific response patterns

It is better for behavior shaping than for continuously updated knowledge.

## The Common Interview Mistake

A common weak answer is:

`fine-tuning teaches the model new facts`

That is incomplete at best.

Fine-tuning can influence how the model responds, but it is a poor substitute for a live, updateable knowledge layer.

## They Can Work Together

In practice, some systems use both:

- RAG for current knowledge
- fine-tuning for response format, tool use, or domain behavior

That is often the strongest architecture when both knowledge grounding and specialized behavior matter.

## Key Questions

> _Q: What is the difference between RAG and fine-tuning?_

RAG injects external knowledge at inference time by retrieving relevant documents. Fine-tuning changes the model itself through training. RAG is mainly for knowledge access, while fine-tuning is mainly for behavior shaping.

> _Q: When would you choose RAG over fine-tuning?_

I would choose RAG when the knowledge base changes frequently, when I need source traceability, or when answers must come from a controlled document set. Those are all cases where external retrieval is more practical than retraining.

> _Q: Can RAG and fine-tuning be used together?_

Yes. A common pattern is to use RAG to provide current evidence and fine-tuning to shape answer style, workflow behavior, or tool use. They solve different layers of the problem.
