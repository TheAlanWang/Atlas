---
title: "Reranking"
topic: rag
section: Retrieval Optimization
order: 2
duration: 16
date: 2026-03-30
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 什么是 Reranking

Reranking 是发生在初次检索之后的第二次相关性打分。

系统不会直接相信向量数据库第一次给出的排序，而是把前面的一批候选 chunk 再交给一个更强的模型重新排一次序。

```text
query
-> retrieve top-20
-> rerank top-20
-> keep best 5
```

这就是最常见的模式。

## 为什么它有效

第一阶段检索通常追求的是速度。

Reranker 追求的是相关性。

这很重要，因为第一轮检索经常会返回一些：

- 主题接近
- 部分相关
- 但不是真正最能回答问题的 chunk

Reranking 的价值，就是把这些候选重新排序，让 generation 看到更干净的上下文。

## 常见的模型形态

Reranker 往往是 cross-encoder 或类似的 relevance model，它会对下面这组输入打分：

- query
- 单个候选 chunk

因为它比 embedding search 慢很多，所以通常只会作用在一个较小的候选集上。

## 它最擅长提升什么

Reranking 通常擅长提升：

- 排在最前面的结果质量
- 噪声较多语料下的精度
- 长文档场景里相似 chunk 的区分能力
- hybrid search 合并后的候选质量

特别是在“检索差一点点，但最好答案没有稳定排第一”的时候，它很有用。

## 它解决不了什么

Reranking 不是坏索引的补丁。

如果下面这些地方已经出错，它救不了：

- 真正有答案的 chunk 根本没被召回
- chunking 本身有问题
- metadata filter 设错了

它只能在“已有候选集”内部改善排序。

## 主要代价

最大的代价是延迟。

生产里常见的做法是：

- 第一阶段先做较宽的召回
- 只对 top-20 或 top-50 做 reranking
- 最后只把最好的少数 chunk 送给 LLM

这样能在质量和成本之间取得平衡。

## 关键问题

> _Q: RAG 里的 reranking 是什么？_

Reranking 就是在检索之后做第二次相关性评分。系统先召回一批候选，再用更强的模型把这些候选重新排序，让最好的证据排到前面。

> _Q: 为什么不直接用 reranker 搜整个语料库？_

因为 reranker 比向量检索慢得多。它会用更贵的方式把 query 和每个候选逐一比较，所以只能在快速 first-pass retriever 先缩小搜索范围之后再使用。

> _Q: Reranking 最适合解决什么问题？_

它最适合修复排序质量问题。也就是正确 chunk 已经被召回了，但排名不够靠前，导致 generation 没看到最好的证据。reranking 可以把这些 chunk 提到前面。
