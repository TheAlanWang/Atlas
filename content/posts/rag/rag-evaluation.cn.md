---
title: "RAG 评估体系"
topic: rag
section: Evaluation
order: 1
duration: 20
date: 2026-03-25
---

## 为什么需要评估？

构建一个 RAG pipeline 并不难，难的是判断它是否真的在正常工作。

没有评估，你就是在盲飞。一个 pipeline 在 demo 里看起来没问题，但在真实查询中可能完全失效——返回不相关的 chunk、产生幻觉、或者漏掉显而易见的信息。评估提供可量化的信号，让你能系统性地改进。

RAG 评估围绕三个核心问题：

| 指标 | 问题 |
|------|------|
| **Context Relevance（上下文相关性）** | 检索到的 chunk 和问题相关吗？ |
| **Faithfulness（忠实度）** | 回答真的有 chunk 作为依据吗？ |
| **Answer Relevance（答案相关性）** | 回答真的回答了用户的问题吗？ |

每个指标针对不同的失效场景。

---

## 三个核心指标

### Context Relevance（上下文相关性）

衡量检索到的 chunk 是否包含回答问题所需的信息。分数低意味着检索环节出了问题——你在给 LLM 喂无关的噪音。

**能发现的问题：** chunking 策略不佳、embedding 模型太弱、`top_k` 设置不当。

### Faithfulness（忠实度）

衡量生成回答中的每一个声明是否都能追溯到检索到的 chunk。高忠实度的回答只说 chunk 里有的内容。分数低意味着 LLM 在产生幻觉。

**能发现的问题：** 模型无视上下文、system prompt 没有强制要求基于上下文作答。

### Answer Relevance（答案相关性）

衡量回答是否真正回答了问题——即使它忠实于上下文。模型可能给出一个有依据但回避问题的回答（"文档中讨论了几个相关话题……"），这种回答 Faithfulness 高但 Answer Relevance 低。

**能发现的问题：** 模型过于保守、prompt 不够清晰、检索覆盖不全。

---

## 用 RAGAS 进行评估

[RAGAS](https://docs.ragas.io) 是 RAG 评估的标准开源框架，使用 LLM 作为裁判自动计算三个指标。

```bash
pip install ragas
```

对于每条查询，你需要提供问题、pipeline 给出的回答、检索到的 chunk，以及标准答案。RAGAS 对每个指标打出 0 到 1 的分数。

```python
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_relevancy

data = {
    "question": ["企业版的退款政策是什么？"],
    "answer":   ["企业版提供 30 天全额退款窗口。"],
    "contexts": [["我们的企业版提供 30 天无理由退款保障……"]],
    "ground_truth": ["企业版有 30 天退款政策。"],
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

## Reranking（可选）

向量检索速度快但精度有限——它使用 bi-encoder，对 query 和 document 分别编码后再比较。Reranking 在此基础上加一个 cross-encoder 模型，将问题和每个 chunk **放在一起**联合推理，得到更准确的相关性分数。

典型做法：先粗检索大量候选（top-20），rerank 后保留最好的几个（top-5）。

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

当 Context Relevance 分数偏低时，reranking 尤其有效——它能把真正相关的 chunk 重新排到前面，即使向量相似度没有把它排在首位。

不想引入额外依赖的话可以跳过，它是优化项，不是必须项。

---

## 用分数指导改进

| 哪个分数低 | 去检查什么 |
|-----------|-----------|
| Context Relevance | chunk 大小、embedding 模型、`top_k`、是否需要 reranking |
| Faithfulness | system prompt 措辞、reranking 质量 |
| Answer Relevance | prompt 是否清晰、检索覆盖是否完整 |

每次改动前后都跑一遍评估，分数下降就回滚。

---

## 面试常问

> _Q: 你怎么评估一个 RAG 系统？_

标准方法是用三个指标：Context Relevance（检索到的 chunk 有用吗？）、Faithfulness（回答是否有 chunk 作为依据？）、Answer Relevance（回答是否真的回答了问题？）。RAGAS 这样的工具用 LLM 作裁判自动计算这些指标。同时还需要一个包含代表性查询和标准答案的测试集来打分。

> _Q: Faithfulness 和 Answer Relevance 有什么区别？_

Faithfulness 衡量回答是否有上下文支撑——用来发现幻觉。Answer Relevance 衡量回答是否真正回答了问题——用来发现回避性回答。一个模型可能 Faithfulness 很高但 Answer Relevance 很低，比如给出"文档中提到了几个与你的问题相关的话题"这样有据可查但不解决问题的回答。

> _Q: Context Relevance 分数低的原因是什么，如何解决？_

通常是以下之一：chunk 太大（主题焦点分散）、embedding 模型在该领域表现弱、或者 `top_k` 太小导致相关 chunk 落在检索范围之外。解决方案取决于根本原因——调整 chunk 大小、换更强的 embedding 模型、调高 `top_k`，或者加入 reranking，用 cross-encoder 对初步检索结果重新打分。
