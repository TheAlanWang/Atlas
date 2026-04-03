---
title: "Metadata Filtering"
topic: rag
section: Core Retrieval Concepts
order: 4
duration: 14
date: 2026-03-29
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 什么是 Metadata Filtering

Metadata filtering 指的是：在检索前或检索过程中，先根据 chunk 附带的结构化字段缩小候选范围。

常见的 metadata 字段包括：

- 文档类型
- 来源
- tenant id / customer id
- 语言
- 产品线
- 创建时间或更新时间

也就是说，你不是直接在“所有 chunk”里搜索，而是先筛出“有可能相关的那部分 chunk”，再做相似度检索。

## 为什么它在 RAG 里很重要

单靠向量相似度通常不够。

两个 chunk 语义上可能都很接近，但对当前用户或当前场景来说，其中一个依然是错的。

例如：

- 用户问的是 `enterprise refund`，不应该检索到 `consumer refund`
- 多租户系统里，tenant A 的机器人绝不能看到 tenant B 的文档
- 用户问 `2025 pricing`，不应该优先拿到 `2023 pricing`

metadata filtering 的价值，在于同时提升相关性和安全性。

## 一个典型流程

```text
问题
-> metadata 过滤
-> 在过滤后的子集上做向量检索
-> 返回 top-k chunks
```

当语料库里混有多个产品、多个客户、多种语言或多个时间版本时，这个流程尤其重要。

## 一个简单例子

假设每个 chunk 都带着这样的 metadata：

```json
{
  "content": "Enterprise plans include SSO and audit logs.",
  "product": "enterprise",
  "doc_type": "pricing",
  "language": "en"
}
```

当用户问企业版定价时，系统理想上应该只在以下条件的 chunk 里搜索：

- `product = enterprise`
- 可能再加 `doc_type = pricing`
- 可能再加 `language = en`

如果不加这些过滤，向量检索就很可能拿到“语义相似但业务上不对”的内容。

## Pre-filtering 和 Post-filtering

常见有两种做法：

### Pre-filtering

先过滤，再做向量搜索。

这通常是更推荐的方式，因为向量搜索只在真正相关的子集上执行。

### Post-filtering

先做向量搜索，再把不满足条件的结果删掉。

这种做法实现上有时更简单，但会伤害召回率。因为真正相关的 chunk 可能一开始就没能进入 top-k。

面试里比较稳妥的回答是：

`如果检索系统支持得好，优先选择 pre-filtering`

## 这些过滤条件从哪里来

好的 filter 通常来自三类信息：

1. 应用上下文
2. 用户身份或权限
3. 对问题本身的解析

例如：

- 用户当前就在 `billing` 页面
- 当前 tenant id 已经从登录态知道
- 问题里明确提到了 `Spanish docs` 或 `Q1 2025`

所以 metadata 设计本身就是 retrieval 设计的一部分，而不只是存储层的小细节。

## 常见失败点

Metadata filtering 自己也可能出问题。

常见错误有：

- filter 太宽，几乎没起作用
- filter 太严，把真正相关的 chunk 也挡掉了
- metadata 本身不完整或不一致
- filter 放在检索后做，结果把召回率悄悄削掉

很多“检索效果很随机”的系统，根本问题不在 embedding，而在 metadata 设计。

## 关键问题

> _Q: 已经有向量搜索了，为什么还需要 metadata filtering？_

因为语义相似并不能自动满足业务边界或文档范围要求。Metadata filtering 可以把检索限制在正确的语料子集里，例如某个 tenant、某条产品线、某种语言或某个时间范围。这样既提高相关性，也提高安全性。

> _Q: Pre-filtering 和 Post-filtering 有什么区别？_

Pre-filtering 是先按 metadata 缩小候选集，再做向量检索。Post-filtering 是先检索，再把不符合条件的结果删掉。通常 pre-filtering 更好，因为 post-filtering 容易让真正相关的 chunk 根本进不了初始 top-k，从而降低召回率。

> _Q: 举一个 metadata filtering 不是可选项、而是必须项的场景。_

多租户系统是最典型的例子。如果一个客服机器人同时服务多个客户，就必须先按 tenant id 过滤，再做检索。否则系统可能会拿到另一个客户的语义相似文档，这既错误也不安全。
