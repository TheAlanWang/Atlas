---
title: "Query Transformation"
topic: rag
section: Retrieval Optimization
order: 3
duration: 16
date: 2026-03-30
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 什么是 Query Transformation

Query transformation 指的是：在正式检索前，先把用户的问题改写、扩展，或者重新组织。

它的目标，是在尽量保持原始意图不变的前提下，让这个意图更容易和已有文档匹配上。

## 为什么它有帮助

用户的问题经常是短的、模糊的、口语化的。

而文档通常写得更正式、更明确。

这种表达差异会直接伤害检索效果。

例如：

- 用户问：`How do refunds work for enterprise?`
- 文档写的是：`Enterprise plans are eligible for a 30-day money-back guarantee`

意思接近，但措辞没有完全对齐。

## 常见做法

Query transformation 常见有三种：

- rewriting：把问题改写得更明确
- expansion：补充可能相关的词项
- decomposition：把一个复杂问题拆成多个检索步骤

本质上，它们都在提升 retrieval 的输入质量。

但这几种方法并不是在所有系统里都同样适合：

- rewriting 更适合简单 FAQ 式检索
- expansion 可能提升召回，但也更容易引入噪声
- decomposition 更适合 multi-hop 或 agentic workflow

## 一个简单例子

```text
original query:
"How do refunds work for enterprise?"

rewritten query:
"What is the refund policy for enterprise plans?"
```

改写后的问题更接近文档里常见的表述方式。

## 需要注意的代价

Query transformation 可能提升召回，但也会引入风险。

常见失败点包括：

- 改写改变了原问题的意思
- 扩展加入了噪声词
- 系统更难调试和解释

所以它应该作为优化层谨慎使用，尤其是在高风险场景里。

## 什么情况下值得用

当真正的问题是“query 和文档表述方式不一致”时，query transformation 最有价值。

常见表现包括：

- 用户提问口语化、模糊
- 文档写法更正式
- 检索结果经常差一点点，但不稳定

如果 retrieval 的根因是 chunking、embedding 或 filter 太弱，那 query transformation 往往不是第一修复点。

## 什么情况下不该先上

它不应该被当成所有弱检索问题的默认答案。

如果真实问题是：

- chunking 很差
- embedding 很弱
- metadata filtering 出错

那你先改写 query，本质上只是把上游问题暂时遮住。

## 它应该放在哪一层

常见链路是：

```text
user query
-> transform query
-> retrieve candidates
-> rerank
-> generate answer
```

它是优化层，不是对 chunking、embedding、filtering 的替代。

## 关键问题

> _Q: RAG 里的 query transformation 是什么？_

它指的是在检索前先对用户问题做改写、扩展或重组，让问题更容易和文档空间对齐。目标是提高检索效果，但不改变用户原始意图。

> _Q: 为什么 query transformation 能提升检索？_

因为用户问题常常口语化、不完整，或者和文档用词不一致。经过改写后，query 会更贴近文档术语，从而改善召回。

> _Q: Query transformation 最大的风险是什么？_

最大的风险是语义漂移。如果改写后的 query 改变了原本意图，或者加入了误导性的词，检索效果反而会变差。

> _Q: 什么情况下 query transformation 是正确优化，什么情况下不是？_

当核心问题是“用户说法”和“文档说法”不一致时，它是正确优化；当问题根因在 chunking、embedding 或 filtering 时，它通常不是第一步。那种情况下，先改 query 更像是在治表面症状。
