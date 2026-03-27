---
title: "向量嵌入与向量检索"
topic: rag
section: Core Concepts
order: 2
duration: 20
date: 2026-03-25
---

## 什么是向量嵌入？

向量嵌入（Embedding）是将文本表示为一组数字（向量）的方式。它的核心特性是：**语义相似 → 数字相近**。

```
"dog"   → [0.21, -0.45, 0.87, ...]  （1536 个数字）
"puppy" → [0.23, -0.43, 0.85, ...]  （非常相近）
"car"   → [-0.62, 0.11, -0.34, ...]  （差异很大）
```

这样计算机就能用数学方法衡量语义相似度——这是普通关键词搜索做不到的。

## 用 OpenAI 生成向量嵌入

OpenAI 的 `text-embedding-3-small` 模型可以把任意文本转换为 1536 维的向量：

```python
from openai import OpenAI

client = OpenAI()

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="什么是上下文窗口？"
)

embedding = response.data[0].embedding
print(len(embedding))   # 1536
print(embedding[:5])    # [-0.021, 0.043, -0.018, 0.076, -0.031]
```

对文档和用户问题都使用相同的模型来生成嵌入，这样它们才处于同一个向量空间，可以互相比较。

## 余弦相似度

衡量两个向量有多相似，我们使用**余弦相似度**。它测量两个向量之间的夹角：

- 得分 `1.0` → 语义完全相同
- 得分 `0.0` → 完全无关
- 得分 `-1.0` → 语义完全相反

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

embedding_a = embed("dog")
embedding_b = embed("puppy")
embedding_c = embed("airplane")

print(cosine_similarity(embedding_a, embedding_b))  # ~0.92（非常相似）
print(cosine_similarity(embedding_a, embedding_c))  # ~0.21（无关）
```

实际使用中你不需要自己计算——向量数据库会帮你做。

## 什么是向量数据库？

向量数据库是专门为存储和检索向量嵌入优化的数据库。给定一个查询向量，它能高效地找到最相似的向量——这叫做**近邻搜索（Nearest Neighbor Search）**。

常见的选择：

| 数据库 | 说明 |
|---|---|
| **pgvector** | PostgreSQL 扩展，适合已有 Postgres 的项目 |
| **Pinecone** | 全托管服务，无需自己维护基础设施 |
| **Weaviate** | 开源，支持混合搜索 |
| **Chroma** | 轻量级，适合本地开发 |

在 Atlas 中，我们使用 **Supabase + pgvector**——一个普通的 PostgreSQL 数据库，加上向量搜索能力。

## 在 Supabase（pgvector）中存储向量

首先启用 pgvector 扩展并创建表：

```sql
-- 启用 pgvector
create extension if not exists vector;

-- 创建存储文档 chunk 和向量的表
create table documents (
  id bigserial primary key,
  content text,
  embedding vector(1536)
);
```

然后从 Python 插入一个 chunk 及其向量：

```python
import openai
import supabase

chunk = "RAG 是检索增强生成（Retrieval-Augmented Generation）的缩写。"

embedding = client.embeddings.create(
    model="text-embedding-3-small",
    input=chunk
).data[0].embedding

supabase_client.table("documents").insert({
    "content": chunk,
    "embedding": embedding
}).execute()
```

## 搜索相似 Chunk

要为用户问题找到最相关的 chunk，对问题做嵌入后执行相似度搜索：

```sql
-- 找到与查询向量最相似的 3 个 chunk
select content, 1 - (embedding <=> '[0.021, -0.043, ...]') as similarity
from documents
order by embedding <=> '[0.021, -0.043, ...]'
limit 3;
```

`<=>` 是 pgvector 的余弦距离运算符。可以把这个查询封装成 Supabase RPC 函数，从应用中调用。

## 关键词搜索 vs 向量搜索

| | 关键词搜索 | 向量搜索 |
|---|---|---|
| **原理** | 精确词语匹配 | 语义相似度 |
| **"dog" 能找到 "puppy"？** | 不能 | 能 |
| **速度** | 非常快 | 快（有索引的情况下） |
| **适合场景** | 精确匹配、ID 查找 | 基于语义的检索 |

向量搜索能找到语义相关的内容，即使用词完全不同——这就是它成为 RAG 核心的原因。

## 面试常问

> _Q: 什么是向量嵌入？为什么在 RAG 中要用它？_

向量嵌入是将文本表示为浮点数列表的数值形式。嵌入模型经过训练后，语义相似的文本会产生相近的向量。在 RAG 中，文档和用户问题都被转换为向量，这样向量数据库就能为给定的查询找到语义最相关的文档 chunk——即使用词完全不同也没关系。

> _Q: 什么是余弦相似度？为什么用它来比较向量嵌入？_

余弦相似度衡量两个向量之间的夹角，返回 -1 到 1 之间的分数。分数接近 1 说明向量方向相同——语义相似。相比欧式距离，它更适合比较嵌入向量，因为它捕捉的是方向（语义），而不是长度（量级），无论文本长短都比较稳健。

> _Q: 关键词搜索和向量搜索有什么区别？_

关键词搜索匹配包含确切查询词的文档。向量搜索将查询和文档都转换为嵌入，找到语义相似的文档，即使使用了不同的词。比如用向量搜索搜索"dog"，可以搜到关于"puppy"或"canine"的结果。RAG 系统使用向量搜索，是因为用户提问的措辞很少和原始文档中的用词完全一致。

> _Q: 什么是 pgvector？_

pgvector 是 PostgreSQL 的一个扩展，它添加了原生的 `vector` 数据类型以及相似度搜索运算符（余弦距离、L2 距离、内积）。它允许你直接在 Postgres 表中存储向量嵌入，并用 SQL 进行查询，对于已经使用 PostgreSQL（比如 Supabase）的项目来说，是一个非常实用的选择，无需额外部署独立的向量数据库。
