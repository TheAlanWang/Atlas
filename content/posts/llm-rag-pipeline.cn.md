---
title: "构建 RAG Pipeline"
topic: rag
section: Building
order: 4
duration: 25
date: 2026-03-25
---

## 概览

这篇文章把所有内容串起来——chunking、向量嵌入、向量检索和 Chat Completions API——构建一个完整可运行的 RAG pipeline。

我们要构建两个部分：

1. **索引脚本** — 读取文档，切分 chunk，对每个 chunk 生成嵌入，存入 Supabase
2. **查询函数** — 接收用户问题，检索相关 chunk，生成有依据的回答

## 环境配置

```bash
pip install openai supabase python-dotenv
```

```python
# .env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

在 Supabase 中执行以下 SQL 创建文档表：

```sql
create extension if not exists vector;

create table documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536)
);
```

同时在 Supabase 中创建搜索函数：

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

## 第一部分：索引

索引脚本读取你的文档，切分成 chunk，对每个 chunk 生成嵌入，并存储到 Supabase。

```python
import os
from openai import OpenAI
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

openai_client = OpenAI()
supabase_client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_KEY"]
)

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def embed(text: str) -> list[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def index_document(text: str):
    chunks = chunk_text(text)
    print(f"正在索引 {len(chunks)} 个 chunk...")

    for chunk in chunks:
        embedding = embed(chunk)
        supabase_client.table("documents").insert({
            "content": chunk,
            "embedding": embedding
        }).execute()

    print("完成。")

# 使用示例
with open("my_document.txt", "r") as f:
    text = f.read()

index_document(text)
```

每次文档内容变更时运行一次，用于填充向量数据库。

## 第二部分：检索 + 生成

查询函数将用户问题嵌入为向量，检索最相关的 chunk，构建 prompt，然后调用 LLM。

```python
def retrieve(question: str, top_k: int = 5) -> list[str]:
    question_embedding = embed(question)

    result = supabase_client.rpc("match_documents", {
        "query_embedding": question_embedding,
        "match_count": top_k
    }).execute()

    return [row["content"] for row in result.data]

def answer(question: str) -> str:
    chunks = retrieve(question)
    context = "\n\n---\n\n".join(chunks)

    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "你是一个有帮助的助手。"
                    "只根据提供的上下文回答问题。"
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

# 使用示例
question = "超过 500 美元的订单退款政策是什么？"
print(answer(question))
```

## 完整流程

```
用户提问
   │
   ▼
对问题生成向量嵌入（text-embedding-3-small）
   │
   ▼
在 Supabase 中执行向量搜索（match_documents）
   │
   ▼
检索到 top-k 个最相关的 chunk
   │
   ▼
构建 prompt：system + 上下文 + 问题
   │
   ▼
GPT-4o 生成有依据的回答
   │
   ▼
返回回答给用户
```

## 关键设计决策

**"只根据上下文回答"** — system prompt 中明确要求模型只使用检索到的 chunk，而不是训练记忆。这是保持回答有依据的关键。

**"如果上下文中没有就说不知道"** — 没有这条指令，当没有检索到相关 chunk 时，模型可能会编造答案。这条指令可以防止这种情况。

**top_k** — 检索更多 chunk 给模型提供更多上下文，但会消耗更多上下文窗口。从 `top_k=5` 开始，根据文档情况调整。

## 面试常问

> _Q: 请描述一下 RAG pipeline 的完整步骤。_

首先是索引阶段：将文档切分成 chunk，用 `text-embedding-3-small` 等模型对每个 chunk 生成嵌入，将嵌入和原始文本一起存储在向量数据库中。查询阶段：用相同的模型对用户问题生成嵌入，用余弦相似度在向量数据库中搜索 top-k 个最相似的 chunk，将这些 chunk 作为上下文注入 LLM 的 prompt，LLM 基于检索到的文本生成有依据的回答。

> _Q: 如何在 RAG 系统中防止 LLM 产生幻觉？_

两个主要方法：第一，在 system prompt 中明确要求模型只根据提供的上下文作答，如果答案不在上下文中就说不知道。第二，确保检索步骤真正返回了相关 chunk——如果检索到了错误的 chunk，即使 prompt 写得再好，模型也无法正确回答。改善 chunking 策略和嵌入质量可以减少检索失败。

> _Q: 如果没有检索到相关 chunk，会发生什么？_

如果向量搜索返回的 chunk 与问题无关，LLM 要么根据训练记忆生成回答（幻觉），要么说不知道，取决于 system prompt 是怎么写的。正确的行为——说"我不知道"——需要在 system prompt 中明确要求。也可以添加相似度阈值：如果没有任何 chunk 的相似度超过最低分数，直接跳过 LLM 调用，返回一个兜底回复。

> _Q: 如何为大型文档库扩展这个 pipeline？_

对于大型语料库，在 pgvector 的向量列上添加索引（`CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)`）以加速相似度搜索。索引时使用批量嵌入以减少 API 调用次数。仔细考虑 chunking 策略——文档越多，chunk 越多，精准的 chunking 就越重要。对于超大规模语料库，Pinecone 等托管向量数据库可以自动处理扩展问题。
