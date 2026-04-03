# Rerank Comparison

Dataset: `backend/eval/test_set.json`  
Slices: `0:3`, `3:6`, `6:9`, `9:10`

## Result Summary

| Setup | Faithfulness | Answer Relevancy | Context Precision |
| --- | ---: | ---: | ---: |
| Vector-only baseline | 0.9005 | 0.8369 | 0.9000 |
| Vector + rerank | 0.7556 | 0.6610 | 0.9833 |
| Delta | -0.1449 | -0.1759 | +0.0833 |

## Files Used

Baseline:
- `backend/eval/results-20260401-000155.json`
- `backend/eval/results-20260401-000233.json`
- `backend/eval/results-20260401-000329.json`
- `backend/eval/results-20260401-000355.json`

Rerank:
- `backend/eval/results-20260331-234856.json`
- `backend/eval/results-20260331-235047.json`
- `backend/eval/results-20260331-235811.json`
- `backend/eval/results-20260331-235850.json`

## Takeaway

On this 10-question eval set, reranking improved retrieval precision, but overall answer quality went down. The largest regressions came from:

- `How do you prevent an LLM from hallucinating in a RAG system?`
- `What is cosine similarity used for in RAG?`

Current conclusion: on this eval set, the reranker configuration is **not** a net win yet.

## Filtered View

Excluding the two lowest-scoring rerank regressions above:

| Setup | Faithfulness | Answer Relevancy | Context Precision |
| --- | ---: | ---: | ---: |
| Vector-only baseline | 0.9292 | 0.8236 | 0.9583 |
| Vector + rerank | 0.9444 | 0.8262 | 1.0000 |
| Delta | +0.0152 | +0.0026 | +0.0417 |

On this 8-question filtered subset, reranking is slightly better across all three metrics.
