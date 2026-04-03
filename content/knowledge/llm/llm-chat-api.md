---
title: "Chat Completions API"
topic: llm
section: Using LLM APIs
order: 1
duration: 20
date: 2026-03-25
---

## What is the Chat Completions API?

The Chat Completions API is the main way to interact with LLMs like GPT-4o programmatically. Instead of typing into a chat interface, you send a structured request from your code and get a response back.

This is the foundation of every AI-powered application: chatbots, writing assistants, RAG pipelines, and more.

## Setup

Install the OpenAI Python library:

```bash
pip install openai
```

Set your API key as an environment variable:

```bash
export OPENAI_API_KEY="sk-..."
```

Never hardcode your API key directly in your code.

## Your First API Call

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "What is a large language model?"}
    ]
)

print(response.choices[0].message.content)
```

The response is an object. The generated text lives at `response.choices[0].message.content`.

## The Messages Array

The `messages` parameter is the most important part of the API. It is a list of message objects, each with a `role` and `content`.

There are three roles:

| Role | Purpose |
|------|---------|
| `system` | Sets the behavior and persona of the model |
| `user` | The human's message |
| `assistant` | The model's previous response (used to maintain conversation history) |

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful coding tutor. Keep answers concise."},
        {"role": "user", "content": "What is a list comprehension in Python?"}
    ]
)
```

The `system` message is your way of telling the model how to behave before the conversation starts.

## Maintaining Conversation History

The API is **stateless**, meaning it does not remember previous messages on its own. To maintain a conversation, you must pass the full history every time.

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."}
]

# Turn 1
messages.append({"role": "user", "content": "My name is Alan."})
response = client.chat.completions.create(model="gpt-4o", messages=messages)
reply = response.choices[0].message.content
messages.append({"role": "assistant", "content": reply})

# Turn 2: the model remembers the name because we passed the history
messages.append({"role": "user", "content": "What is my name?"})
response = client.chat.completions.create(model="gpt-4o", messages=messages)
print(response.choices[0].message.content)  # "Your name is Alan."
```

## Key Parameters

```python
response = client.chat.completions.create(
    model="gpt-4o",        # which model to use
    messages=[...],         # conversation history
    temperature=0.7,        # randomness: 0 = deterministic, 2 = very random
    max_tokens=500,         # maximum tokens in the response
)
```

**temperature** controls how "creative" the model is:
- `0`: same output every time, best for factual tasks
- `0.7`: balanced, good default for most use cases
- `1.5+`: very random, good for creative writing

## Checking Token Usage

Every response includes a `usage` field showing how many tokens were used:

```python
print(response.usage.prompt_tokens)      # tokens in your input
print(response.usage.completion_tokens)  # tokens in the response
print(response.usage.total_tokens)       # total
```

This matters for cost tracking and staying within context window limits.

## Key Questions

> _Q: What does "stateless" mean in the context of the Chat Completions API?_

The API does not store any conversation history between requests. Each API call is independent. To maintain a multi-turn conversation, the application must pass the full message history (all previous user and assistant messages) with every request. This means conversation state is managed by the application, not the API.

> _Q: What are the three message roles in the Chat Completions API?_

`system` sets the model's behavior and persona before the conversation starts. `user` represents the human's input. `assistant` represents the model's previous responses, used to give the model context about what it said earlier. In a multi-turn conversation, you append both user and assistant messages to the history after each turn.

> _Q: What is the `temperature` parameter?_

Temperature controls the randomness of the model's output. At `0`, the model is deterministic and always picks the most likely token, best for factual or structured tasks. Higher values (up to `2`) introduce more randomness, which can be useful for creative tasks. A value around `0.7` is a common default for general-purpose use.

> _Q: Why should you never hardcode your OpenAI API key in your code?_

API keys are secrets. Hardcoding them risks accidental exposure, for example if you commit the code to a public GitHub repository. The standard practice is to store API keys in environment variables or a `.env` file (excluded from version control via `.gitignore`), and load them at runtime using `os.environ` or a library like `python-dotenv`.
