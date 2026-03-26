---
title: "What is an LLM?"
topic: llm
section: Foundations
order: 1
duration: 15
date: 2026-03-25
---

## What is an LLM?

A Large Language Model (LLM) is an AI model trained to understand and generate human language. You give it text, it gives you text back.

LLMs are a subset of **NLP (Natural Language Processing),** the broader field of making computers understand human language. Before LLMs, each NLP task (translation, summarization, classification) required its own specialized model. LLMs changed that: one model can do all of it.

ChatGPT, Claude, and Gemini are all LLMs. Under the hood, they are all doing the same thing: **predicting what text should come next**.

## How Does an LLM Work?

An LLM is trained on massive amounts of text: books, articles, websites, code. During training, it learns patterns: what words tend to follow other words, how sentences are structured, how ideas connect.

When you send a message, the model doesn't "look up" an answer. It generates a response **one token at a time**, each token chosen based on what is most likely to come next given everything before it.

Think of it like autocomplete, but trained on the entire internet and much better at it.

## What is a Token?

A token is the smallest unit of text an LLM processes. Tokens are not exactly words. They are chunks of characters.

```
"Hello, world!" → ["Hello", ",", " world", "!"]  (4 tokens)
"unhappiness"   → ["un", "happiness"]             (2 tokens)
"LLM"           → ["L", "LM"]                     (2 tokens)
```

As a rough estimate: **1 token ≈ 0.75 words**, or about 4 characters in English.

Why does this matter? Because LLMs have a limit on how many tokens they can process at once, called the **context window**.

## What is a Context Window?

The context window is the maximum amount of text an LLM can "see" at one time. Everything outside the context window is invisible to the model.

```
Context Window = your message + conversation history + system prompt
```

For example, if a model has a 128,000-token context window, it can process roughly 100,000 words at once, about the length of a novel.

When a conversation gets too long and exceeds the context window, the model starts to "forget" earlier messages because they no longer fit.

## Why Do LLMs Hallucinate?

Hallucination is when an LLM confidently states something that is false.

This happens because LLMs are not databases. They don't store facts. They learn **patterns** from training data. When asked about something outside their training data (or something too specific), they generate text that *sounds* correct based on patterns, even if the content is wrong.

```python
# Example: asking an LLM a question it can't reliably answer
"What is the current stock price of Apple?"
# LLM might generate a number that looks plausible but is completely made up
```

This is one of the core problems that **RAG** (Retrieval-Augmented Generation) is designed to solve. It gives the model real, retrieved facts to work with instead of relying on training data alone.

## Interview Questions

> _Q: What is a Large Language Model?_

A Large Language Model is a neural network trained on large amounts of text data to understand and generate human language. It works by predicting the next token in a sequence based on all previous tokens. Examples include GPT-4o (OpenAI), Claude (Anthropic), and Gemini (Google).

> _Q: What is a token?_

A token is the basic unit of text that an LLM processes. Tokens are not exactly words. They are subword chunks, roughly 0.75 words or 4 characters on average in English. LLMs read and generate text one token at a time, and pricing for API usage is typically calculated per token.

> _Q: What is a context window and why does it matter?_

The context window is the maximum number of tokens an LLM can process in a single request. It includes the system prompt, conversation history, and the current message. When input exceeds the context window, earlier content is dropped. Context window size matters for tasks like document summarization, long conversations, and RAG pipelines where retrieved content must fit alongside the query.

> _Q: What is hallucination in the context of LLMs?_

Hallucination is when an LLM generates text that is factually incorrect but presented with confidence. It occurs because LLMs predict statistically likely text rather than retrieving verified facts. Mitigation strategies include RAG (providing grounding documents), prompt engineering (asking the model to say "I don't know" when uncertain), and output validation.
