---
title: "Agentic RAG"
topic: rag
section: Advanced Systems
order: 1
duration: 18
date: 2026-03-30
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 什么是 Agentic RAG

Agentic RAG 指的是：模型不再只是“一次检索，一次回答”，而是会在回答前主动做更多决策。

例如它可以：

- 判断是否需要检索
- 进行多轮检索
- 改写 query
- 在回答前调用其他工具

这会让系统更灵活，但也更复杂。

## 它和基础 RAG 的区别

基础 RAG 往往是：

```text
question -> retrieve -> generate
```

而 Agentic RAG 更像：

```text
question
-> plan
-> retrieve
-> inspect results
-> retrieve again or use another tool
-> generate
```

也就是说，系统不再是单次通过。

但 Agentic RAG 不只是“多做几次检索”。

它更深的一层变化是：系统开始自己做编排决策，例如：

- 要不要检索
- 下一步该检索什么
- 什么时候停止
- 什么时候该调用别的工具

## 什么情况下它真正有价值

当任务需要下面这些能力时，Agentic RAG 才更值得：

- 多步推理
- 工具调用
- 迭代式证据收集
- 动态 query reformulation

如果只是简单 FAQ 或稳定知识库问答，它通常不是首选。

## 代价也很明显

它的代价包括：

- 更高延迟
- 更复杂的编排逻辑
- 更难调试
- 更多级联错误机会

所以它应该被当作 advanced architecture，而不是默认起点。

## 什么情况下不值得上

下面这些情况下，Agentic RAG 往往没必要：

- 任务只是简单 FAQ 式问答
- 一次检索已经足够稳定
- 延迟预算很紧
- 基础检索能力本身还不扎实

这种时候，agentic behavior 往往是编排复杂度增长得比回答质量更快。

## 一个更稳的面试表达

比较好的说法是：

`agentic RAG improves flexibility, but it does not replace strong retrieval fundamentals`

如果 chunking、filtering 和 relevance 这些基础能力都很弱，再加 agent 通常只会让系统更难控制。

## 关键问题

> _Q: 什么是 agentic RAG？_

Agentic RAG 是一种更动态的 retrieval-augmented system。模型在回答前可以先规划、多轮检索、改写 query，或者调用工具，而不是只走一次固定的 retrieve -> generate 流程。

> _Q: 什么情况下 agentic RAG 值得它带来的复杂度？_

当任务确实需要多步证据收集、工具使用或迭代检索时，它才值得。对于稳定语料上的简单问答，普通 RAG 往往已经够用了。

> _Q: Agentic RAG 最大的风险是什么？_

最大的风险是系统复杂度。步骤越多，延迟越高，失败点越多，也越难调试。如果检索基础本来就弱，agentic behavior 往往会把问题放大，而不是修复它。

> _Q: Agentic RAG 和“多做几次检索”有什么区别？_

多轮检索只是它的一部分。Agentic RAG 更关键的地方在于：系统还会自己做策略和编排决策，比如要不要检索、该调哪个工具、什么时候停止。这层决策能力，才让它真正变成 agentic。
