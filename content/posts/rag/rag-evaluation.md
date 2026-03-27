---
title: "RAG Evaluation"
topic: rag
section: Evaluation
order: 1
duration: 20
date: 2026-03-25
---

## Why Evaluate?

Building a RAG pipeline is straightforward. Knowing whether it's actually working is harder.

Without evaluation, you're flying blind. A pipeline can look fine in demos but fail on real queries — returning irrelevant chunks, hallucinating answers, or missing obvious information. Evaluation gives you a quantitative signal so you can improve systematically.

RAG evaluation breaks down into three questions:

| Metric | Question |
|--------|----------|
| **Context Relevance** | Did retrieval return chunks relevant to the question? |
| **Faithfulness** | Is the answer actually supported by the retrieved chunks? |
| **Answer Relevance** | Does the answer address what the user asked? |

Each metric targets a different failure mode.

---

## The Three Core Metrics

### Context Relevance

Measures whether the retrieved chunks contain information needed to answer the question. Low context relevance means your retrieval step is broken — you're feeding the LLM irrelevant noise.

**Failure mode it catches:** bad chunking, weak embedding model, wrong `top_k`.

### Faithfulness

Measures whether every claim in the generated answer is grounded in the retrieved context. A faithful answer only says things that can be traced back to the chunks. Low faithfulness means the LLM is hallucinating.

**Failure mode it catches:** model ignoring the context, system prompt not enforcing grounding.

### Answer Relevance

Measures whether the answer actually addresses the question — even if it's faithful to the context. A model can produce a grounded but evasive answer ("The document discusses several topics...") that scores high on faithfulness but low on answer relevance.

**Failure mode it catches:** overly cautious models, unclear prompts, incomplete retrieval.

---

## Evaluating with RAGAS

[RAGAS](https://docs.ragas.io) is the standard open-source framework for RAG evaluation. It computes all three metrics automatically using an LLM as a judge.

```bash
pip install ragas
```

For each query, you provide the question, the pipeline's answer, the retrieved chunks, and the ground truth answer. RAGAS scores each metric from 0 to 1.

```python
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_relevancy

data = {
    "question": ["What is the refund policy for enterprise plans?"],
    "answer":   ["Enterprise plans include a 30-day full refund window."],
    "contexts": [["Our enterprise tier offers a 30-day money-back guarantee..."]],
    "ground_truth": ["Enterprise plans have a 30-day refund policy."],
}

results = evaluate(Dataset.from_dict(data), metrics=[
    faithfulness,
    answer_relevancy,
    context_relevancy,
])

print(results)
# {'faithfulness': 0.92, 'answer_relevancy': 0.87, 'context_relevancy': 0.74}
```

---

## Reranking (Optional)

Vector search retrieves candidates quickly but imprecisely — it uses a bi-encoder that compares embeddings independently. Reranking adds a second pass using a cross-encoder model that reads the question and each chunk *together*, producing a more accurate relevance score.

The typical pattern: retrieve a large candidate set (top-20), rerank, keep the best few (top-5).

```python
import cohere

co = cohere.Client("YOUR_COHERE_API_KEY")

def rerank(question: str, chunks: list[str], top_n: int = 5) -> list[str]:
    results = co.rerank(
        model="rerank-english-v3.0",
        query=question,
        documents=chunks,
        top_n=top_n,
    )
    return [chunks[r.index] for r in results.results]
```

Reranking is especially useful when context relevance scores are low despite good embedding quality — it surfaces the right chunk even when vector similarity alone doesn't rank it first.

If you don't want to add a dependency, skip it. It's an optimization, not a requirement.

---

## Using Scores to Improve

| Low score on... | Look at... |
|----------------|-----------|
| Context Relevance | Chunk size, embedding model, `top_k`, add reranking |
| Faithfulness | System prompt wording, reranking quality |
| Answer Relevance | Prompt clarity, retrieval coverage |

Run evaluation before and after each change. If a score goes down, revert.

---

## Interview Questions

> _Q: How do you evaluate a RAG system?_

The standard approach uses three metrics: context relevance (did retrieval return useful chunks?), faithfulness (is the answer grounded in those chunks?), and answer relevance (does the answer address the question?). Tools like RAGAS automate this using an LLM as judge. You also need a test set of representative queries with ground truth answers to score against.

> _Q: What's the difference between faithfulness and answer relevance?_

Faithfulness measures whether the answer is supported by the retrieved context — it catches hallucination. Answer relevance measures whether the answer addresses the question — it catches evasiveness. A model can score high on faithfulness but low on answer relevance if it produces a grounded but non-responsive answer like "The document mentions several topics related to your question."

> _Q: What causes low context relevance scores, and how do you fix it?_

Usually one of: chunks are too large (reducing topical focus), a weak embedding model, or `top_k` is too small and the relevant chunk falls outside the retrieved set. The fix depends on the root cause — tune chunk size, switch to a stronger embedding model, raise `top_k`, or add reranking to re-score candidates with a cross-encoder after the initial vector search.
