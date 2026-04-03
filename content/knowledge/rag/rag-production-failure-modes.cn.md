---
title: "Production Failure Modes"
topic: rag
section: Evaluation and Failure Modes
order: 2
duration: 16
date: 2026-03-30
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 为什么生产环境的失败不一样

RAG demo 往往在精心挑选的例子上表现很好。

而生产环境面对的是更混乱的现实：

- 含糊的问题
- 过期文档
- 质量不均的语料
- 权限和租户边界
- 延迟限制

所以 production failure modes 需要单独讨论。

## 最常见的失败模式

常见情况包括：

- 检索到了错误 chunk
- 检索到了正确 chunk，但排序很差
- 文档来源过期或彼此冲突
- 上下文噪声太大，模型难以利用
- 答案有依据，但对用户没帮助
- 回答跨越了安全边界或租户边界

这些问题并不全是 generation 问题，很多在前面几层就已经埋下了。

## 一个实用的排查拆分

当生产里的 RAG 出错时，可以先拆成四类：

1. retrieval failure
2. context construction failure
3. generation failure
4. product 或 policy failure

这样可以避免把所有坏答案都误判成 prompt 问题。

## 例子

### Retrieval Failure

真正有答案的 chunk 根本没进候选集。

### Context Construction Failure

正确 chunk 已经召回了，但被重复内容和噪声淹没。

### Generation Failure

证据其实在，但模型还是生成了没有依据的说法。

### Product Failure

答案在技术上有依据，但对用户依然是错的，比如返回了过期政策。

## 好的团队会监控什么

生产里的 RAG 团队通常会监控：

- 兜底率
- retrieval miss rate
- 用户不满意信号
- 各阶段延迟
- tenant 或权限违规

目标不是只给模型打分，而是要发现真实流量下到底哪一层在失效。

## 关键问题

> _Q: RAG 在生产里最常见的 failure modes 是什么？_

最常见的是错误检索、嘈杂的上下文组装、没有依据的 generation、过期文档，以及权限错误。很多用户看到的坏答案，其实根因在 generation 之前。

> _Q: 为什么一个成功的 demo 还不足以证明 RAG 系统可用？_

因为 demo 通常只用精挑细选的问题和较干净的文档。生产环境会引入歧义、文档质量不均、知识过期和延迟约束，这些才会暴露真实 failure modes。

> _Q: 如果线上一条 RAG 回答失败了，你会怎么排查？_

我会先把问题拆成 retrieval、context construction、generation 和 product-policy 四类。这样才能判断是没找到证据、证据装配得差、证据在但回答不好，还是业务规则本身就处理错了。
