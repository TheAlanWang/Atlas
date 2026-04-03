---
title: "RAG Pipeline 完整解析"
topic: rag
section: Introduction
order: 2
duration: 18
date: 2026-03-25
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## RAG Pipeline 到底是什么

RAG 系统的核心任务只有一个：在让模型回答之前，先把正确的上下文找出来。

真正落地时，这意味着系统里其实有两条不同的 pipeline：

```text
离线 / 索引阶段
文档 -> 切分 -> 向量化 -> 存储

在线 / 查询阶段
问题 -> 向量化 -> 检索 -> 组装上下文 -> 生成回答
```

如果一个人不能把这两个阶段清楚讲出来，通常说明他还没有真正理解 RAG。

但在面试里，更重要的不只是列出阶段，而是讲清楚：权衡和失败点分别落在哪些阶段。

## 第一阶段：索引

索引阶段是在用户提问之前处理数据。

1. 把原始文档切成 chunk
2. 把每个 chunk 转成 embedding
3. 把 chunk 文本、metadata、embedding 一起存进检索系统

这一阶段通常在文档新增或更新时运行，而不是每次用户提问都运行。

它的目标，是让后面的检索既准确又便宜。

## 第二阶段：查询时检索与生成

真正收到用户问题时，系统会做这几件事：

1. 用和索引时相同的 embedding 模型向量化问题
2. 从向量库里检索候选 chunk
3. 视情况做 filtering 或 reranking
4. 用筛出来的 chunk 组装上下文
5. 把上下文交给 LLM 生成回答

这一阶段每次请求都会执行，所以延迟和成本在这里尤其重要。

## RAG Pipeline 最容易坏在哪里

多数 RAG 系统的问题，不是模型太弱，而是 pipeline 某个环节设计得不好。

| 阶段 | 常见失败点 |
|---|---|
| Chunking | chunk 太大、太小，或者切的位置不对 |
| Embedding | 模型太弱，或索引和查询用了不同模型 |
| Retrieval | 正确 chunk 没进 top-k |
| Context Construction | 检索到了好内容，但上下文组装得很差 |
| Generation | 模型忽略上下文，或者过度泛化 |

这也是为什么面试官经常让你按阶段分析问题，而不是空谈“什么是 RAG”。

很多生产环境里的失败，本质上是 retrieval、freshness 或 context assembly 的失败，然后才表现成“模型回答不好”。

## 一个好用的心智模型

你可以把整个 pipeline 想成一个逐层收缩的漏斗：

```text
所有文档
-> 候选 chunks
-> top-k 检索结果
-> 最终上下文窗口
-> 有依据的回答
```

每一层都应该在减少噪音的同时，尽量不丢掉有用信息。

如果你在前面几层就把关键证据丢掉了，后面的生成阶段是补不回来的。

## 核心权衡

RAG pipeline 里反复出现的三个权衡是：

- 召回率 vs 精确率：多取一些 chunk，还是少取一些噪音
- 质量 vs 延迟：reranking、query rewriting 能提质，但会增加成本和耗时
- 新鲜度 vs 维护成本：更频繁地重建索引会更及时，但维护更重

在面试里，理解这些权衡通常比背工具名更重要。

另一个很有用的表达是：

- 更好的检索质量，通常意味着更多系统组件
- 更简单的 pipeline 更容易运维，但通常也更不精细

所以 production RAG 本质上是系统设计问题，不只是 prompt 问题。

## 这篇文章不展开什么

这篇文章只负责总览，不负责深入细节。具体细节应该放在独立文章中：

- chunking strategy
- embeddings
- vector databases
- metadata filtering
- retrieval optimization
- evaluation

如果一篇 pipeline 文章把这些全展开，它就会变成一篇重复很多内容的“大全”，而不是 overview。

## 关键问题

> _Q: 从文档到最终回答，请完整描述一个 RAG pipeline。_

RAG pipeline 分两阶段。离线索引阶段先把文档切成 chunk，再为每个 chunk 生成 embedding，并把文本、metadata、embedding 存入检索系统。在线查询阶段则先把用户问题向量化，再检索相关 chunk，必要时做 filtering 或 reranking，然后把最终选中的 chunk 组装成上下文，交给 LLM 生成有依据的回答。

> _Q: 为什么索引和查询要分开？_

因为索引成本高，但发生频率低；查询阶段必须快，因为它每次请求都会执行。把两者分开，才能提前计算并存储 embedding，而不是每次提问都重复做重处理。

> _Q: 在 RAG pipeline 里，哪个阶段最重要？_

通常是 retrieval。因为一旦检索到的 chunk 不相关或不完整，再强的 LLM 也无法凭空生成正确且有依据的答案。好的 generation 无法弥补坏的 retrieval。

> _Q: 为什么一个 RAG pipeline 不只是“向量搜索 + LLM”这么简单？_

因为生产级系统通常还需要 metadata filtering、reranking、thresholding、context construction 等环节。只有向量搜索往往要么噪音太多，要么漏掉真正关键的证据。

> _Q: 在 RAG pipeline 的面试题里，最重要的权衡是哪些？_

最核心的是召回率和精确率的平衡、质量和延迟的平衡，以及新鲜度和维护成本的平衡。一个好的回答应该体现出：你每提升 pipeline 某一层的效果，往往都要付出复杂度、成本或延迟上的代价。
