---
title: "LangChain：为什么需要框架"
topic: langchain
section: Fundamentals
order: 1
duration: 12
date: 2026-03-26
---

## 直接调 LLM API 的问题

直接调用 LLM API 处理单个 prompt 没问题。但真实应用很快就会变复杂：

- 需要**串联**多个 LLM 调用（摘要 → 翻译 → 格式化）
- 想让 LLM **使用工具**（联网搜索、查数据库）
- 需要维护**对话历史**
- 在搭建 **RAG**——检索 + 生成组合在一起

没有框架的话，你会在每个项目里重复写同样的"管道代码"。LangChain 就是提供这些管道的框架。

## LangChain 是什么？

LangChain 是一个 Python（也有 JavaScript 版）框架，专为构建 LLM 应用而设计。它为最常见的模式提供了抽象：

```
你的应用 → LangChain → LLM（OpenAI / Anthropic / 本地模型）
                     → 工具（搜索、数据库、计算器）
                     → 记忆（对话历史）
                     → 向量数据库（RAG）
```

## 核心概念

### 1. Model（模型）

把任意 LLM 封装成统一接口：

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)
response = llm.invoke("什么是 RAG？")
print(response.content)
```

换模型只需改一行——chain 的其他代码不用动。

### 2. Prompt Template（提示词模板）

把 prompt 的结构和变量内容分开管理：

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个能清晰解释 {topic} 的助手。"),
    ("human", "{question}"),
])

filled = prompt.invoke({"topic": "数据库", "question": "什么是索引？"})
```

### 3. Chain（LCEL）

LangChain Expression Language（LCEL）用 `|` 把组件串联起来：

```python
chain = prompt | llm

response = chain.invoke({
    "topic": "数据库",
    "question": "什么是索引？"
})
print(response.content)
```

`prompt | llm` 的含义：填充 prompt → 发给 LLM → 返回结果。每个 `|` 把左边的输出作为右边的输入。

### 4. Output Parser（输出解析器）

LLM 默认返回消息对象，加上解析器直接拿到字符串：

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | llm | StrOutputParser()

response = chain.invoke({"topic": "数据库", "question": "什么是索引？"})
print(response)  # 纯字符串，不是消息对象
```

## 完整示例

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o")

prompt = ChatPromptTemplate.from_messages([
    ("system", "用 2-3 句话解释这个概念，适合初学者。"),
    ("human", "解释：{concept}"),
])

chain = prompt | llm | StrOutputParser()

print(chain.invoke({"concept": "向量嵌入"}))
```

## LangChain vs 直接调 API

| | 直接调 API | LangChain |
|---|---|---|
| 简单的单次 prompt | ✅ 更简单 | 大材小用 |
| 串联多个步骤 | 手动写管道 | ✅ 简洁 |
| 切换 LLM 提供商 | 改很多代码 | 改一行 |
| 搭建 RAG | 从头自己写 | ✅ 内置集成 |
| 添加记忆 | 手动管理 | ✅ 内置 |

**用原始 API 的场景：** 只是单次调用，不需要 LangChain 的抽象。**用 LangChain 的场景：** 构建有多个步骤的真实应用。

## 关键问题

> _Q：LangChain 解决了什么问题？_

LangChain 为常见的 LLM 应用模式提供了抽象——串联多次调用、把 prompt 管理成模板、集成工具和记忆、搭建 RAG pipeline。没有它，开发者需要在每个项目里重复写相同的基础代码。

> _Q：什么是 LCEL？_

LangChain Expression Language——用 `|` 运算符组合 chain 的方式。每个组件（prompt、model、parser）实现统一接口（`invoke`、`stream`、`batch`），因此可以直接串联。它替代了旧版 LangChain 需要继承子类的 API 风格。

> _Q：什么时候不该用 LangChain？_

单次 LLM 调用、不需要复杂抽象时，直接调 API 更简单。另外在需要精细控制每个 token 和 API 调用的生产系统中，LangChain 的抽象层可能会隐藏底层细节，导致调试困难。
