---
title: "Generation"
topic: rag
section: Generation and Context
order: 2
duration: 14
date: 2026-03-30
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 什么是 Generation

Generation 就是 LLM 读取问题和检索上下文后，产出最终答案的那一步。

这是用户最直接看到的输出层，但它通常不是第一个该调试的地方。

## 模型在这一步应该做什么

一个好的 RAG 系统里，模型应该：

- 回答用户问题
- 尽量基于给定证据作答
- 不要编造没有依据的细节

这听起来简单，但它强烈依赖 prompt 设计和上下文质量。

## 为什么到了 Generation 还是会失败

即使有 retrieval，generation 依然可能失败。

常见原因有：

- 上下文不完整
- prompt 没有约束基于证据的回答行为
- 问题需要跨多个 chunk 综合
- 模型用自己的先验知识补空白

所以 retrieval 并不会自动消灭 hallucination。

## 怎样让回答更有依据

常见做法是明确告诉模型：

- 只使用提供的上下文
- 如果证据不足就直接说明
- 合适时引用相关 chunk 或来源

这些指令能提高稳定性，但它们不能完全弥补弱证据。

## 更好的输出表现是什么

比较好的 generation 行为通常是：

- 先给简洁答案
- 再给基于证据的解释
- 如果证据不足，就明确承认不确定

这比自信但没有依据的回答更好。

## 一个关键认知

面试里一个很稳的说法是：

`generation quality is downstream of retrieval and context construction`

如果证据本身就错了，输出层很难真正把系统救回来。

## 关键问题

> _Q: RAG 里的 generation step 做什么？_

Generation step 会把用户问题和检索到的上下文一起交给 LLM，让它产出最终答案。它的职责是利用给定证据组织出一个回答，而不是脱离证据自由发挥。

> _Q: 为什么 RAG 到了 generation 还是会 hallucinate？_

因为 retrieval 并不保证证据完整、干净、顺序合理。如果上下文本身就弱、缺失或装配得不好，模型依然可能用自己的先验去填空，生成没有依据的内容。

> _Q: 怎么让 RAG 的 generation 更可靠？_

做法包括提升上下文质量，以及在 prompt 里明确要求模型只基于提供证据作答，并在证据不足时承认不知道。不过最大的提升通常还是来自上游检索质量的改善。
