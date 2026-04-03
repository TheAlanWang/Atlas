---
title: "Embeddings"
topic: rag
section: Core Retrieval Concepts
order: 2
duration: 15
date: 2026-03-25
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 什么是 Embedding

Embedding 是文本的向量表示。

关键点不在于“它是一串数字”，而在于：语义相近的文本会被映射到向量空间里彼此接近的位置。

这正是语义检索能够成立的基础。

## 它为什么在 RAG 里重要

在 RAG 里，文档 chunk 和用户 query 都会被映射到同一个向量空间里。

```text
chunk -> embedding
query -> embedding
nearest vectors -> retrieved candidates
```

如果 embedding model 本身不够好，后面的 reranking 和 generation 一开始就拿不到足够强的候选。

## 一个好的 Embedding Model 应该保留什么

一个有用的 embedding model 至少要尽量保留这些信息：

- 语义相似性
- 领域术语
- 不同说法之间的对应关系
- 相近概念之间仍然足够清晰的区分

例如，一个好的模型应该知道：

- `refund window` 和 `money-back guarantee` 语义相关
- `enterprise pricing` 和 `consumer pricing` 不是同一个东西

这种区分能力，决定了文本能不能被正确检索出来。

## 向量相似度到底在做什么

文本变成 embedding 之后，系统会用 cosine similarity、inner product 等方式比较向量接近程度。

这些分数通常由向量数据库来算，不需要手工处理。

更重要的理解是：

`embedding 决定了检索空间长什么样，vector DB 只是负责在这个空间里搜索`

## 选模型时的权衡

选择 embedding model 时，通常要平衡：

- 质量
- 成本
- 延迟
- 向量维度
- 领域适配性

最好的模型不一定是最大的模型。有时候一个更便宜但更适合你语料领域的模型，反而比更大的通用模型表现更稳。

## 一个很常见的失败点

很多人会把 embedding 当成“已经解决的基础设施问题”。

其实不是。

如果模型对你的领域理解不够好，常见现象会是：

- 真正相关的 chunk 没有被召回
- 语义接近但业务上错误的 chunk 被召回
- 类似 query 的表现不稳定

这类问题经常被误判成 vector DB 问题，但根因其实在 embedding。

## 关键问题

> _Q: 什么是 embedding，它为什么在 RAG 里重要？_

Embedding 是文本的向量表示，语义相近的内容会在向量空间里彼此靠近。在 RAG 里，文档和 query 都要先变成 embedding，retriever 才能基于“意义”而不是只基于关键词去找相关 chunk。

> _Q: Embedding 能做到什么是关键词搜索做不好的？_

Embedding 能按语义匹配，而不是只按字面词项匹配。所以即使用户提问和原文档的说法不同，只要意思接近，系统也有机会把相关 chunk 找出来。

> _Q: 为什么 embedding model 是 RAG 里高杠杆的选择？_

因为它决定了整个检索空间本身。如果模型没有把重要的语义差异保留下来，后面的系统从一开始就只能在一批较差的候选上工作。

> _Q: 为什么索引和查询必须用同一个 embedding model？_

因为文档和 query 必须处在同一个向量空间里。如果用不同模型生成向量，相似度分数就会失去一致性，检索质量也会明显下降。
