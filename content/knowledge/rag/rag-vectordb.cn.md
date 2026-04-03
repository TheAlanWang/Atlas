---
title: "Vector DB"
topic: rag
section: Core Retrieval Concepts
order: 3
duration: 15
date: 2026-03-25
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## Vector Database 到底做什么

Vector database 的职责是存储 embedding，并在给定 query vector 时找出最近的那些向量。

这听起来很简单，但它解决的是一个真实的系统问题：

`当你有几百万个向量时，怎样还能在用户可接受的延迟里完成检索？`

这就是它在 RAG 里重要的原因。

## 它通常负责哪些事

一个 vector database 通常会处理：

- embedding 存储
- nearest-neighbor search
- 向量索引
- filtering 支持
- 检索层的规模化能力

它是 retrieval 的基础设施，不是“检索智能”本身。

## Exact Search 和 Approximate Search

在数据量很小时，可以做精确最近邻搜索。

但在生产规模下，大多数系统会使用 approximate nearest-neighbor search，也就是 ANN。

核心思路是：

用少量精度损失，换来更好的检索延迟。

在真实 RAG 系统里，这个权衡通常是值得的。

## 为什么索引选择也很重要

向量检索的效果不只取决于 embedding model。

索引选择还会影响：

- 延迟
- 内存占用
- recall
- 建索引成本

一个更稳的面试回答会提到：不同 vector DB 或不同索引方案，并不是天然等价的，它们在速度、召回、过滤能力和运维复杂度上都有差异。

例如，在 pgvector 里：

- HNSW 通常 recall 更强，但内存成本也更高
- IVF 往往更轻一些，但通常需要更多调参，而且更容易损失 recall

具体哪种更合适，取决于数据规模、延迟目标和运维约束。

这类具体 tradeoff，才是面试官真正想听到的层次。

## Vector DB 不是整个 Retriever

一个很常见的误解是：只要 vector DB 选得对，检索质量就会好。

其实不是。

检索质量还强烈依赖：

- chunking
- embeddings
- metadata filtering
- reranking

Vector DB 只是负责在这些上游决定好的向量空间里做搜索。

## 实际选型时怎么想

最核心的问题通常不是“哪个数据库最酷”，而是：

- 你是不是已经在用 Postgres？
- 你想不想用托管服务？
- 你需不需要 hybrid search？
- 你对 filtering 支持要求高不高？
- 你想要多少运维控制权？

如果团队已经深度使用 PostgreSQL，`pgvector` 往往很自然。
如果想快速起步、减少基础设施负担，托管方案会更合适。

## 关键问题

> _Q: Vector database 在 RAG 系统里做什么？_

它负责存储文档 embedding，并在 query embedding 到来时执行最近邻搜索，把最相似的候选尽快找出来。它的核心职责是让 retrieval 在规模化场景下仍然可行。

> _Q: 什么是 approximate nearest-neighbor search，为什么要用它？_

ANN 是一种更快的向量搜索方法。它会牺牲一点点精确性，换取更低延迟。在向量规模变大以后，精确搜索成本太高，所以生产系统里通常会采用 ANN。

> _Q: 更好的 vector DB 就一定等于更好的 retrieval 吗？_

不一定。Vector DB 会影响搜索速度、召回和运维表现，但检索质量仍然很大程度上取决于 chunking、embedding、filtering 和 reranking。一个再强的数据库，也补不回前面设计上的问题。

> _Q: 什么情况下 pgvector 是好选择？_

当团队已经在用 PostgreSQL，并且希望系统结构尽量简单时，pgvector 是很好的选择。它能让你在原有数据库体系里直接加上向量检索，而不必单独引入一套新的存储系统。
