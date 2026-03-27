---
title: "Chunking 策略"
topic: rag
section: Core Concepts
order: 3
duration: 15
date: 2026-03-25
---

## 为什么 Chunking 很重要？

你不能把整篇文档作为一个向量来嵌入。一份 50 页的 PDF 只会产生一个向量，它把所有内容的含义都平均掉了——导致检索不精准。

正确的做法是把文档切分成更小的片段，叫做 **chunk**，对每个 chunk 单独生成向量并存储。查询时，只检索与问题相关的特定 chunk。

```
不好：整篇文档 → 1 个向量 → 检索不准确
好：  文档切成 20 个 chunk → 20 个向量 → 精准检索
```

难点在于如何切分。切太小，chunk 会失去上下文；切太大，含义会被稀释。

## 固定大小切分

最简单的策略：每隔 N 个字符切一刀，相邻 chunk 之间保留一段重叠。

```python
def fixed_size_chunks(text: str, chunk_size: int = 500, overlap: int = 50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap  # 重叠保持 chunk 之间的上下文连贯
    return chunks

text = "..."  # 你的文档内容
chunks = fixed_size_chunks(text, chunk_size=500, overlap=50)
```

**重叠（Overlap）** 很重要。没有重叠的话，一个句子被切成两半后就失去了连贯性。重叠 50–100 个字符可以确保没有想法被突然截断。

**适用场景：** 结构均匀的简单文档、快速原型开发。

**缺点：** 可能在句子中间、段落中间切断——chunk 可能不连贯。

## 按句子 / 段落切分

按自然语言边界切分——句子或段落——而不是固定字符数。

```python
import re

def paragraph_chunks(text: str):
    # 按双换行符（段落分隔）切分
    paragraphs = re.split(r'\n\n+', text)
    return [p.strip() for p in paragraphs if p.strip()]
```

每个 chunk 是一个完整的段落，比固定大小切分更好地保留了语义。

**适用场景：** 文章、博客、文档——任何有清晰段落结构的文本。

**缺点：** 段落长度差异可能很大——有些太短，有些太长。

## 递归切分

更智能的方式：先尝试按段落切分，再按句子，再按单词——递归地降级到更小的分隔符，直到 chunk 满足目标大小。

这是 LangChain 的 `RecursiveCharacterTextSplitter` 使用的方法：

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""]
)

chunks = splitter.split_text(text)
```

它先尝试 `\n\n`（段落），再尝试 `\n`（换行），再尝试 `. `（句子），以此类推。结果是尽可能尊重自然语言结构的 chunk。

**适用场景：** 大多数通用 RAG pipeline。这是默认推荐方案。

## 如何选择 Chunk 大小？

没有放之四海而皆准的 chunk 大小，取决于你的文档和检索需求。

| Chunk 大小 | 优点 | 缺点 |
|---|---|---|
| 小（100–200 字符） | 检索精准 | 缺少周围上下文 |
| 中（400–600 字符） | 平衡 | 大多数场景的好起点 |
| 大（1000+ 字符） | 上下文丰富 | 稀释语义，成本更高 |

实用起点：**chunk_size=500, overlap=50**。

索引完成后，用真实问题测试，检查检索到的 chunk 是否真的包含答案。如果不对，再调整。

## Chunk 大小与上下文窗口

你检索到的 chunk 必须和系统提示词、用户问题一起放进 LLM 的上下文窗口里。

```
上下文窗口 = 系统提示词 + 检索到的 chunk + 用户问题 + 模型回复
```

如果你检索 `top_k=5` 个、每个 500 token 的 chunk，那就是 2500 token 的上下文。要确保这个量在你的模型限制范围内。

## 面试常问

> _Q: RAG pipeline 中的 chunking 是什么？为什么必须做？_

Chunking 是在生成向量嵌入之前，将源文档切分成更小片段的过程。之所以必须做，是因为把整篇文档作为一个向量会把所有内容的含义都平均掉，导致检索不准确。更小的 chunk 能产生聚焦的向量，对应具体的知识点，向量搜索就能精准返回与查询相关的段落，而不是整篇文档。

> _Q: 什么是 chunk overlap？为什么要用它？_

Chunk overlap 是指相邻 chunk 在边界处共享一小段文本。它防止句子或概念在 chunk 边界处被突然截断。没有 overlap 的话，一个 chunk 可能从句子中间开始，缺少理解它所需的上下文。典型的 overlap 是 50–100 个字符或 token。

> _Q: Chunk 大小小和大之间的权衡是什么？_

小 chunk 产生精准、聚焦的向量——检索很具体，但每个 chunk 可能缺少足够的上下文让 LLM 给出好的回答。大 chunk 保留了更多上下文，但向量会平均掉很多不同的信息，检索精准度下降，同时也会消耗更多上下文窗口。合适的大小取决于文档类型和查询模式，400–600 字符是常用的起点。

> _Q: 什么是递归切分？_

递归切分按照分隔符的层级顺序依次尝试切分——先按段落，再按换行，再按句子，再按单词。只有当当前 chunk 超出目标大小时，才降级到下一个分隔符。结果是尽可能尊重自然语言结构同时保持在大小限制内的 chunk。LangChain 的 `RecursiveCharacterTextSplitter` 是一个流行的实现。
