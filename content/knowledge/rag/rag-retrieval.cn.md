---
title: "检索"
topic: rag
section: Core Retrieval Concepts
order: 5
duration: 18
date: 2026-03-28
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## RAG 里的检索到底是什么

检索，就是把用户问题映射到知识库中最相关的 chunk。

这是 RAG 系统里最关键的环节之一。只要检索错了，后面的模型就只能基于错误证据，或者退回到自己的记忆去猜。

```text
问题 -> 向量化 -> 相似度搜索 -> top-k chunks
```

这就是最核心的检索回路。

## 检索真正的目标

检索同时在追两个目标：

- 提高召回率：不要漏掉真正包含答案的 chunk
- 提高精确率：不要把太多无关噪音送给模型

这两个目标天然是冲突的。

取太少，容易漏答案；取太多，又会把上下文窗口塞满噪音。

## 最基础的向量检索

最常见的做法是：

1. 对用户问题做 embedding
2. 和知识库里的 chunk embedding 做相似度比较
3. 返回最近的几个 chunk

```python
def retrieve(question: str, top_k: int = 5) -> list[str]:
    question_embedding = embed(question)
    result = supabase.rpc("match_documents", {
        "query_embedding": question_embedding,
        "match_count": top_k,
    }).execute()
    return [row["content"] for row in result.data]
```

这通常是任何 RAG 系统的第一版。

## `top_k` 真正在控制什么

`top_k` 是最重要的检索参数之一。

| 设置 | 风险 |
|---|---|
| 太小 | 相关证据被漏掉 |
| 太大 | 噪音太多，上下文被污染 |

没有一个对所有系统都通用的最佳值。它取决于 chunk 大小、文档结构，以及 generation 阶段对噪音的容忍度。

一种很常见的工程做法是：

- 先取一个相对更大的候选集
- 再做 filtering 或 reranking
- 最后只把少量最好的 chunk 送进 LLM

## 相似度阈值

最近邻搜索有一个危险点：哪怕根本没有真正相关的内容，它也会返回“最接近”的那几个结果。

这就容易出现：

```text
没有真正命中
-> top-k 仍然被返回
-> 模型收到无关上下文
-> 产生看起来有理、实际上错误的回答
```

相似度阈值就是用来拦住这种弱匹配的。

```python
def retrieve_with_threshold(question: str, top_k: int = 5, threshold: float = THRESHOLD):
    question_embedding = embed(question)
    result = supabase.rpc("match_documents", {
        "query_embedding": question_embedding,
        "match_count": top_k,
    }).execute()

    return [
        row["content"]
        for row in result.data
        if row["similarity"] >= threshold
    ]
```

如果没有任何 chunk 通过阈值，系统就应该直接走兜底逻辑，而不是假装“找到了证据”。

但要注意：阈值不是可以横向照搬的常数。

它会受到这些因素影响：

- embedding model
- 相似度度量方式
- index 行为
- 你自己语料上的 score calibration

所以更稳的面试回答不是“用 0.75”，而是“应该在代表性 query 上做阈值校准”。

## 常见检索失败点

检索效果差，通常来自下面几类问题：

1. chunking 设计差，导致答案被切碎或稀释
2. embedding 模型不适合这个领域
3. `top_k` 太小
4. metadata filter 缺失或过宽
5. 检索到的 chunk 在语义上相近，但并不真正包含答案

所以检索问题从来不只是“向量数据库不够强”。

## 检索和检索优化不是一回事

这篇文章只讲检索主线本身。

下面这些属于“检索优化”主题，应该单独展开：

- metadata filtering
- hybrid search
- reranking
- query rewriting
- query expansion
- HyDE

它们都是为了提升检索效果，但并不是“基础检索”本身。

更细一点地说：

- hybrid search 和 reranking 作用在候选召回与排序上
- query rewriting、expansion、HyDE 作用在检索输入本身上

## 关键问题

> _Q: RAG 系统里的检索在做什么？_

检索负责把用户问题映射到知识库中最相关的 chunk。它先对问题做 embedding，再在已索引的 chunk 向量中找最相似的内容，最后把这些 chunk 作为证据交给 generation 阶段。它的本质任务，是在模型回答之前先把正确的信息找出来。

> _Q: 为什么说 retrieval 往往是 RAG 里最重要的一步？_

因为 generation 的上限受 retrieval 限制。如果检索到的 chunk 不相关或不完整，模型要么幻觉，要么回答残缺。即使换成更强的模型，也无法完全弥补证据本身的缺失。

> _Q: `top_k` 控制的是什么？_

`top_k` 控制检索阶段返回多少个候选 chunk。调大它可以提高召回率，减少漏掉相关证据的风险；但同时也会降低精确率，引入更多噪音。合适的值是在“别漏掉答案”和“别污染上下文”之间做平衡。

> _Q: 为什么检索里要用相似度阈值？_

因为向量数据库即使在没有真正匹配时也会返回最近邻结果。相似度阈值可以拦住这些弱匹配，避免无关 chunk 被送进模型，导致“看起来像有依据、实际上却错”的回答。但阈值必须结合自己的系统做校准，它会随 embedding model、打分方式和语料而变化，不存在一个通用常数。
