---
title: "LangChain: Why You Need a Framework"
topic: langchain
section: Fundamentals
order: 1
duration: 12
date: 2026-03-26
---

## The Problem with Raw LLM Calls

Calling an LLM API directly works fine for a single prompt. But real applications quickly get complicated:

- You need to **chain** multiple LLM calls (summarize → translate → format)
- You want the LLM to **use tools** (search the web, query a database)
- You need to maintain **conversation history**
- You're building **RAG** — retrieval + generation together

Without a framework, you end up writing the same plumbing code over and over. LangChain provides that plumbing.

## What is LangChain?

LangChain is a Python (and JavaScript) framework for building LLM-powered applications. It provides abstractions for the most common patterns:

```
Your App → LangChain → LLM (OpenAI / Anthropic / local)
                     → Tools (search, database, calculator)
                     → Memory (conversation history)
                     → Vector stores (RAG)
```

## Core Concepts

### 1. Model

Wraps any LLM behind a unified interface:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)
response = llm.invoke("What is RAG?")
print(response.content)
```

Switch models by changing one line — your chain code stays the same.

### 2. Prompt Template

Separates your prompt structure from the variable content:

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that explains {topic} clearly."),
    ("human", "{question}"),
])

filled = prompt.invoke({"topic": "databases", "question": "What is an index?"})
```

### 3. Chain (LCEL)

LangChain Expression Language (LCEL) connects components with `|`:

```python
chain = prompt | llm

response = chain.invoke({
    "topic": "databases",
    "question": "What is an index?"
})
print(response.content)
```

`prompt | llm` means: fill the prompt → send to LLM → return response. Each `|` passes the output of the left side as input to the right side.

### 4. Output Parser

By default, the LLM returns a message object. Add a parser to extract just the string:

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | llm | StrOutputParser()

response = chain.invoke({"topic": "databases", "question": "What is an index?"})
print(response)  # plain string, not a message object
```

## A Complete Example

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o")

prompt = ChatPromptTemplate.from_messages([
    ("system", "Explain the concept in 2-3 sentences, suitable for a beginner."),
    ("human", "Explain: {concept}"),
])

chain = prompt | llm | StrOutputParser()

print(chain.invoke({"concept": "vector embeddings"}))
```

## LangChain vs. Calling the API Directly

| | Direct API call | LangChain |
|---|---|---|
| Simple one-off prompt | ✅ simpler | Overkill |
| Chaining multiple steps | Manual plumbing | ✅ clean |
| Swapping LLM providers | Change lots of code | Change one line |
| Building RAG | Build everything yourself | ✅ built-in integrations |
| Adding memory | Manual | ✅ built-in |

**Use the raw API** when you're making a single call and don't need any of LangChain's abstractions. **Use LangChain** when you're building a real application with multiple steps.

## Interview Questions

> _Q: What problem does LangChain solve?_

LangChain provides abstractions for common LLM application patterns — chaining multiple calls, managing prompts as templates, integrating tools and memory, and building RAG pipelines. Without it, developers repeat the same plumbing code across projects.

> _Q: What is LCEL?_

LangChain Expression Language — a way to compose chains using the `|` operator. Each component (prompt, model, parser) implements a standard interface (`invoke`, `stream`, `batch`), so they can be chained together. It replaces older LangChain APIs that required subclassing.

> _Q: When would you NOT use LangChain?_

For simple, single LLM calls where the overhead isn't justified. Also in production systems where you need tight control over every token and API call — LangChain's abstractions can hide what's actually happening, making debugging harder.
