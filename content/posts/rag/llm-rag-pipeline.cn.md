---
title: "RAG Pipeline 完整解析"
topic: rag
section: Pipeline
order: 4
duration: 25
date: 2026-03-25
---

## RAG Pipeline 是什么？

RAG 是 **Retrieval-Augmented Generation**（检索增强生成）的缩写。核心思路：不让 LLM 凭记忆回答，而是先检索相关文档，再把这些文档作为上下文交给模型。

一个 RAG 系统由两条在不同时间运行的 pipeline 组成：

```
离线阶段（只运行一次，或文档更新时重新运行）
─────────────────────────────────────────
文档 → 切分 Chunk → 向量化 → 存入向量数据库

在线阶段（每次用户提问时运行）
─────────────────────────────────────────
用户问题 → 向量化 → 检索 → Rerank → 注入上下文 → LLM → 回答
```

理解这个分离是第一步。下面逐阶段讲解。

---

## 索引 Pipeline（离线）

在用户提问之前，需要先处理文档。

### 第一步：切分 Chunk

原始文档太大，无法整体向量化。需要把它切成小段——通常每段 300–500 个 token，段与段之间保留一些重叠，避免关键上下文被切断。

```python
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks
```

### 第二步：向量化（Embed）

每个 chunk 被转换成一个向量——一组数字，捕捉这段文本的语义。语义相近的 chunk，对应的向量在向量空间中也会彼此靠近。

```python
from openai import OpenAI

client = OpenAI()

def embed(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding
```

### 第三步：存储

将每对（chunk 文本, 向量）存入向量数据库。这里使用带 pgvector 扩展的 Supabase。

先在 Supabase 中建表：

```sql
create extension if not exists vector;

create table documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536)
);
```

然后运行索引脚本：

```python
from supabase import create_client
import os

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

def index_document(text: str):
    chunks = chunk_text(text)
    for chunk in chunks:
        embedding = embed(chunk)
        supabase.table("documents").insert({
            "content": chunk,
            "embedding": embedding
        }).execute()
```

文档首次导入时运行一次，之后每次文档内容变更时重新运行。

---

## 查询 Pipeline（在线）

每次用户提问，都会走这条 pipeline。

### 第一步：对问题向量化

用**与索引时相同的 embedding 模型**将用户问题转成向量。这一点很关键——向量必须处于同一个空间才能进行比较。

### 第二步：检索

找出向量与问题向量最接近的 chunk，即余弦相似度最高的那些。

在 Supabase 中创建检索函数：

```sql
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (content text, similarity float)
language sql stable
as $$
  select
    content,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

在 Python 中调用：

```python
def retrieve(question: str, top_k: int = 5) -> list[str]:
    question_embedding = embed(question)
    result = supabase.rpc("match_documents", {
        "query_embedding": question_embedding,
        "match_count": top_k
    }).execute()
    return [row["content"] for row in result.data]
```

### 第三步：Rerank（可选，推荐）

向量检索速度快但精度有限——它使用轻量的 bi-encoder 模型，将 query 和 document 分别向量化后比较。Reranking 使用更强的 cross-encoder 模型，将问题和每个 chunk **放在一起**做联合推理，得到更准确的相关性分数。

典型做法：先检索大量候选（top-20），rerank 后保留最好的几个（top-5）。

```python
import cohere

co = cohere.Client(os.environ["COHERE_API_KEY"])

def rerank(question: str, chunks: list[str], top_n: int = 5) -> list[str]:
    results = co.rerank(
        model="rerank-english-v3.0",
        query=question,
        documents=chunks,
        top_n=top_n,
    )
    return [chunks[r.index] for r in results.results]

def retrieve(question: str) -> list[str]:
    candidates = retrieve_top_k(question, top_k=20)   # 粗检索
    return rerank(question, candidates, top_n=5)       # 精筛选
```

如果不想引入额外依赖，可以跳过 reranking——它是优化项，不是必须项。

### 第四步：生成

将检索到的 chunk 注入 LLM 的 prompt 作为上下文，然后让模型作答。

```python
def answer(question: str) -> str:
    chunks = retrieve(question)
    context = "\n\n---\n\n".join(chunks)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "只根据下方提供的上下文回答问题。"
                    "如果上下文中没有答案，请说你不知道。"
                )
            },
            {
                "role": "user",
                "content": f"上下文：\n{context}\n\n问题：{question}"
            }
        ]
    )
    return response.choices[0].message.content
```

---

## 关键设计决策

**为什么要切分 Chunk？**
Embedding 模型有 token 限制（`text-embedding-3-small` 约 8k）。更重要的是，更小的 chunk 能提升检索精度——一个 500 token 的 chunk 比一个 5000 token 的文档更可能聚焦在单一主题上。

**为什么要重叠（overlap）？**
如果一句关键话恰好落在两个 chunk 的边界，两个 chunk 各自只拿到一半。重叠确保不存在硬切断边界。

**"只根据上下文回答"**
没有这条指令，当检索到的 chunk 质量差或不相关时，LLM 会退回到训练记忆作答，产生幻觉。System prompt 是你的护栏。

**Bi-encoder vs Cross-encoder**
Embedding 模型（bi-encoder）分别对 query 和 document 编码——速度快，但精度有限。Reranker（cross-encoder）联合编码两者——速度慢，但精度显著更高。两者结合使用可以兼顾：向量检索提供速度，reranking 提供精度。

**top_k**
chunk 越多 = 上下文越丰富 = 回答越好，但成本和 token 消耗也越高。配合 reranking 使用时：先检索 `top_k=20` 个候选，rerank 后保留 `top_n=5`。

---

## 面试常问

> _Q: 请描述 RAG pipeline 的各个阶段。_

RAG pipeline 分两个阶段。**索引阶段**（离线）：文档被切分成 chunk，每个 chunk 用 `text-embedding-3-small` 等模型向量化，（chunk 文本, 向量）对存入向量数据库。**查询阶段**（在线）：用户问题用同一个模型向量化，向量数据库执行相似度搜索找出 top-k 个最相关的 chunk，这些 chunk 作为上下文注入 LLM 的 prompt，模型基于检索到的文本生成有依据的回答。

> _Q: 为什么索引和查询必须使用同一个 embedding 模型？_

向量只在同一个模型的向量空间内有意义。如果用模型 A 对文档向量化，用模型 B 对问题向量化，得到的向量不可比较——它们之间的余弦相似度没有意义。必须使用同一个模型，才能让语义相近的文本映射到向量空间中的相近位置。

> _Q: 如何防止 RAG 系统产生幻觉？_

两个主要方法：第一，在 system prompt 中明确要求模型只根据提供的上下文作答，答案不在上下文中时说不知道。第二，确保检索真正返回了相关 chunk——检索质量差时，即使 prompt 写得再好也没用。改善 chunking 策略（大小、重叠、语义切分）以及使用更好的 embedding 模型，都能减少检索失败。

> _Q: 如果没有检索到相关 chunk，会怎样？_

如果检索到的 chunk 与问题无关，LLM 要么产生幻觉，要么说不知道，取决于 system prompt 的写法。正确行为必须明确要求。也可以加相似度阈值：如果没有 chunk 的相似度超过最低分数（如 0.75），直接跳过 LLM 调用，返回兜底回复"未找到相关信息"。

> _Q: 如何为大型文档库扩展这个 pipeline？_

在 pgvector 的向量列上添加索引（`CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)`），以加速近似最近邻搜索。索引时批量调用 embedding API，减少请求次数。对于超大规模语料库，考虑使用 Pinecone 或 Weaviate 等托管向量数据库，它们自动处理分片和扩展。
