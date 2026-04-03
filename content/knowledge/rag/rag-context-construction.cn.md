---
title: "Context Construction"
topic: rag
section: Generation and Context
order: 1
duration: 14
date: 2026-03-30
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 什么是 Context Construction

Context construction 指的是：在检索完成后，把哪些 chunk 真正送进模型，以及这些 chunk 以什么顺序、什么格式出现。

Retrieval 决定“有哪些候选证据”。
Context construction 决定“模型最后真正看到什么”。

## 为什么它很重要

即使检索本身不错，如果最终上下文组装得不好，答案依然会很弱。

常见问题有：

- chunk 太多
- chunk 重复
- 排序很差
- 最关键证据埋得太后面
- prompt 里混入不相关指令

所以 RAG 的质量不只是检索质量，也取决于上下文装配质量。

## 它通常要解决哪些问题

Context construction 往往要回答这些问题：

- 最终放几个 chunk？
- 按什么顺序排列？
- 相邻 chunk 要不要合并？
- metadata 或 citation 要不要一起展示？

这些决定都会影响模型能否更容易地利用证据。

## 一个基础策略

比较常见的 baseline 是：

1. 只保留置信度最高的 chunk
2. 去掉近似重复的 chunk
3. 结合相关性和文档逻辑排序
4. 用统一格式组织上下文

目标不是把上下文塞得越多越好，而是把真正可用的证据包装好。

## 一个失败例子

即使 retrieval 不差，这种情况也会失败：

```text
top-10 chunks
-> 有很多重复
-> 真正有答案的 chunk 排在最后
-> prompt 很嘈杂
```

最终模型可能还是给出一个弱答案，因为关键信息被冲淡了。

## 一个更好的理解方式

把 context construction 理解成“证据打包”会更准确。

Retriever 负责把候选证据找回来。
这一步负责决定：在有限上下文预算里，哪些证据最值得被模型注意。

## 关键问题

> _Q: RAG 里的 context construction 是什么？_

它是把检索候选转成最终 prompt 上下文的那一步。系统要决定哪些 chunk 被保留、它们怎样排序，以及以什么格式呈现给模型，让最强的证据更清楚地出现。

> _Q: 为什么检索不错，RAG 还是可能答不好？_

因为好的候选也可能被糟糕地组装。如果最终上下文充满噪声、重复，或者排序很差，模型就可能错过关键证据，导致回答变弱。

> _Q: Context construction 的核心目标是什么？_

核心目标是在有限上下文窗口里最大化“可用证据”。重点不是塞尽可能多的 chunk，而是把最合适的 chunk 以最合适的形式送进去。
