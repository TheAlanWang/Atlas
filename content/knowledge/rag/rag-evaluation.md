---
title: "RAG Evaluation"
topic: rag
section: Evaluation and Failure Modes
order: 1
duration: 18
date: 2026-03-25
---

## In This Chapter

- The main idea behind this part of the RAG system
- The trade-offs that matter in practice
- The interview framing that makes the topic easier to explain

---


## Why Evaluation Matters

A RAG system can look good in a demo and still fail badly in production.

Typical failure patterns are:

- retrieval returns irrelevant chunks
- the answer is grounded but does not actually answer the question
- the model hallucinates despite having context

Without evaluation, you cannot tell which part of the system is broken.

## The Three Core Metrics

RAG evaluation usually centers on three questions:

| Metric | What it checks |
|---|---|
| Context Relevance | Did retrieval return useful chunks? |
| Faithfulness | Is the answer supported by those chunks? |
| Answer Relevance | Does the answer actually address the question? |

These metrics isolate different failure modes instead of collapsing everything into one vague quality score.

## Test Set Quality Matters More Than Fancy Metrics

Evaluation quality is capped by dataset quality.

If your test set is narrow, outdated, or too easy, your metrics will look better than the real system.

A useful RAG test set should include:

- common user questions
- hard edge cases
- ambiguous queries
- cases where the system should refuse or fall back

In interviews, this point is often more important than naming a specific tool.

## Reading the Metrics Correctly

### Context Relevance

Low context relevance means retrieval is weak. The model is being fed noisy or incomplete evidence.

Typical causes:

- poor chunking
- weak embedding model
- wrong `top_k`
- missing filters

### Faithfulness

Low faithfulness means the answer is not fully supported by the retrieved context.

Typical causes:

- the model is ignoring evidence
- the prompt does not enforce grounded answering
- the retrieved evidence is partial, forcing the model to fill gaps

### Answer Relevance

Low answer relevance means the answer does not really address the user's question, even if it is grounded.

Typical causes:

- vague prompts
- incomplete context
- overly cautious answer behavior

## Evaluating with RAGAS

[RAGAS](https://docs.ragas.io) is one of the standard open-source tools for RAG evaluation.

```bash
pip install ragas
```

It evaluates your system by comparing:

- the question
- the retrieved contexts
- the generated answer
- the ground truth answer

```python
from ragas import evaluate
# Exact metric names and import paths change across RAGAS versions.
# The important part is to evaluate the same dataset with a stable metric set.

results = evaluate(
    dataset=eval_dataset,
    metrics=[
        faithfulness_metric,
        response_relevance_metric,
        context_relevance_metric,
    ],
)
```

The exact tool matters less than the discipline: evaluate the same representative queries before and after every major retrieval change.

The exact RAGAS API changes over time, so interview answers should focus on the evaluation workflow, not on memorizing one version's import paths.

## Metrics and Judges Have Limits

Automated metrics and LLM-as-judge workflows are useful, but they are noisy.

They can misread:

- partially correct answers
- multiple valid phrasings
- domain-specific nuance

So a strong workflow is:

- use automated evaluation for scale and regression checks
- use human review for ambiguous or high-stakes cases

## Offline vs Online Evaluation

Good teams usually use both:

- offline evaluation: fixed test set, repeatable, used for debugging and regression checks
- online evaluation: user feedback, click behavior, support escalations, production metrics

Offline evaluation tells you whether your latest change improved the system in a controlled way.
Online evaluation tells you whether users actually benefit.

You need both.

## A Practical Debugging Workflow

When scores drop, do not tweak everything at once.

Use this order:

1. check context relevance first
2. then check faithfulness
3. then check answer relevance

That order matters because retrieval failures usually propagate downstream.

If context relevance is bad, changing generation prompts alone will not solve the real problem.

## Key Questions

> _Q: How do you evaluate a RAG system?_

The standard approach is to evaluate retrieval and generation separately but in a connected way. I would track context relevance to measure retrieval quality, faithfulness to measure grounding, and answer relevance to measure whether the final response addresses the question. I would run those metrics on a representative offline test set, compare before and after changes, and then validate online with real user signals.

> _Q: What is the difference between faithfulness and answer relevance?_

Faithfulness asks whether the answer is supported by the retrieved evidence. Answer relevance asks whether the answer actually answers the user's question. A response can be faithful but still weak if it is grounded yet evasive.

> _Q: If a RAG system performs badly, where do you look first?_

I start with retrieval quality, especially context relevance. If the wrong chunks are retrieved, downstream generation metrics are naturally going to suffer. Fixing prompts before fixing retrieval usually treats the symptom rather than the cause.

> _Q: Are automated RAG evaluation metrics enough by themselves?_

No. They are useful for regression testing and scale, but they are noisy and can miss domain nuance. Good teams combine automated evaluation with human review, especially for ambiguous or high-stakes cases.
