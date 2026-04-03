---
title: "Chunking 策略"
topic: rag
section: Core Retrieval Concepts
order: 1
duration: 15
date: 2026-03-25
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 为什么需要 Chunking

RAG 系统一般不会直接检索整篇文档，而是检索文档里的较小片段。

Chunking 做的就是这件事：

- 把文档拆成更小单元
- 分别生成 embedding
- 只检索和 query 最相关的那些单元

如果不做 chunking，长文档会被压成一个过于宽泛的 embedding，检索粒度就会太粗。

## 真正的权衡是什么

Chunking 的核心权衡是：

- 精准度
- 上下文

小 chunk 更精准，因为每个 chunk 往往只表达一个较窄的概念。
大 chunk 保留更多上下文。

但两边走极端都不好：

- 太小：有答案的事实和解释被拆开
- 太大：多个概念被混进同一个 embedding

## 更应该用 Token 来思考，而不是 Character

对 RAG 来说，用 token 来思考通常比用 character 更实用。

因为：

- 模型消耗的是 token
- context window 按 token 计算
- 检索和生成成本最终也体现在 token 上

所以讨论 chunk size 时，更合理的问题通常是：

- 每个 chunk 大概多少 token？
- 一次会召回几个 chunk？
- 留给最终回答的上下文预算还有多少？

## 常见 Chunking 策略

### 固定大小切分

每隔 N 个 token 切分，并保留少量 overlap。

这种方式实现简单，是一个不错的 baseline，但它容易打断语义边界。

### 结构感知切分

优先按段落、标题、小节等文档结构切分。

这样通常会得到更连贯的 chunk，因为它更尊重原文档组织方式。

### 递归切分

先尝试较大的语义边界，不行再逐步退到更小边界，直到 chunk 满足目标大小。

对通用 RAG 系统来说，这是很强的默认方案。

## 为什么 Overlap 有帮助

Overlap 的存在，是因为重要信息经常正好落在 chunk 边界附近。

如果没有 overlap，一个关键句子可能会和它的解释被硬切开。

但 overlap 也不是越多越好。太多 overlap 会制造重复内容，增加检索噪声。

所以它应该被当作一种受控折中，而不是默认尽量拉满。

## 怎么选一个起步方案

一个实用的起点通常是：

- 中等 token 大小
- 小幅 overlap
- 结构感知或递归切分

然后用真实 query 去验证。

真正合适的 chunking 方式和语料类型有关：

- API 文档通常更适合按 section 切
- policy 文档往往需要稍大 chunk，保留条件和例外
- 客服知识库通常更适合较小、更紧凑的 chunk

## 一个常见失败模式

当 chunking 出问题时，检索往往会表现成“差一点点对”。

典型现象包括：

- 检索到的 chunk 看起来相关，但就是没包含答案
- 答案跨两个 chunk，单独任何一个都不够
- 多个 chunk 都有点像，但真正最有用的证据被冲淡了

这些首先是 chunking failure，其次才是 retrieval failure。

## 关键问题

> _Q: RAG 里的 chunking 是什么，为什么必须做？_

Chunking 是在 embedding 之前把源文档拆成更小可检索单元的过程。之所以必须做，是因为长文档作为一个单独向量通常太宽泛，无法支持高质量的精细检索。

> _Q: 小 chunk 和大 chunk 的权衡是什么？_

小 chunk 更精准，因为每个 embedding 表达的是更窄的概念，但它容易丢掉周围上下文。大 chunk 保留更多背景，但也会把多个概念混在一起，既降低检索精度，也更消耗 context budget。

> _Q: 为什么 chunking 里要用 overlap？_

Overlap 可以保留 chunk 边界附近的重要信息，避免一个关键句子和它的解释被拆开。但 overlap 太大又会制造重复内容，浪费上下文窗口，还可能降低检索质量。

> _Q: 为什么递归切分或结构感知切分通常比朴素固定切分更好？_

因为它更尊重文档结构。当 chunk 能和 section、段落或语义边界对齐时，检索出来的证据通常更连贯，也更容易被模型正确使用。
