---
title: "Chat Completions API"
topic: llm
section: Using LLM APIs
order: 1
duration: 20
date: 2026-03-25
---

## 什么是 Chat Completions API？

Chat Completions API 是通过代码与 GPT-4o 等大语言模型交互的主要方式。你不再需要在聊天界面手动输入，而是通过代码发送结构化请求，然后接收回复。

这是所有 AI 应用的基础——聊天机器人、写作助手、RAG pipeline 等都建立在这个 API 之上。

## 安装与配置

安装 OpenAI Python 库：

```bash
pip install openai
```

将 API Key 设置为环境变量：

```bash
export OPENAI_API_KEY="sk-..."
```

永远不要把 API Key 直接写在代码里。

## 第一个 API 调用

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "什么是大语言模型？"}
    ]
)

print(response.choices[0].message.content)
```

返回的是一个对象，生成的文字在 `response.choices[0].message.content` 里。

## messages 数组

`messages` 参数是 API 中最重要的部分。它是一个消息对象的列表，每个对象包含 `role` 和 `content`。

共有三种角色：

| 角色 | 作用 |
|------|------|
| `system` | 设置模型的行为和人设 |
| `user` | 用户发送的消息 |
| `assistant` | 模型之前的回复（用于维持对话历史） |

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个简洁的编程助教，回答要简短清晰。"},
        {"role": "user", "content": "Python 的列表推导式是什么？"}
    ]
)
```

`system` 消息是你在对话开始前告诉模型如何表现的方式。

## 维持对话历史

这个 API 是**无状态的**——它不会自动记住之前的消息。要维持多轮对话，你必须每次都把完整的历史记录传进去。

```python
messages = [
    {"role": "system", "content": "你是一个有帮助的助手。"}
]

# 第一轮
messages.append({"role": "user", "content": "我叫 Alan。"})
response = client.chat.completions.create(model="gpt-4o", messages=messages)
reply = response.choices[0].message.content
messages.append({"role": "assistant", "content": reply})

# 第二轮——因为我们传了历史，模型记得名字
messages.append({"role": "user", "content": "我叫什么名字？"})
response = client.chat.completions.create(model="gpt-4o", messages=messages)
print(response.choices[0].message.content)  # "你叫 Alan。"
```

## 常用参数

```python
response = client.chat.completions.create(
    model="gpt-4o",        # 使用哪个模型
    messages=[...],         # 对话历史
    temperature=0.7,        # 随机性：0 = 确定性，2 = 非常随机
    max_tokens=500,         # 回复的最大 token 数
)
```

**temperature** 控制模型的"创造性"：
- `0` — 每次输出相同，适合事实性任务
- `0.7` — 平衡，适合大多数场景的默认值
- `1.5+` — 非常随机，适合创意写作

## 查看 Token 用量

每次回复都包含一个 `usage` 字段，显示本次消耗了多少 token：

```python
print(response.usage.prompt_tokens)      # 输入消耗的 token 数
print(response.usage.completion_tokens)  # 回复消耗的 token 数
print(response.usage.total_tokens)       # 总计
```

这对于成本追踪和控制上下文窗口用量非常重要。

## 面试常问

> _Q: Chat Completions API 中"无状态"是什么意思？_

API 不会在两次请求之间保存任何对话历史。每次 API 调用都是独立的。要维持多轮对话，应用程序必须在每次请求时传入完整的消息历史（所有之前的 user 和 assistant 消息）。也就是说，对话状态由应用程序管理，而不是 API。

> _Q: Chat Completions API 中的三种消息角色是什么？_

`system` 在对话开始前设置模型的行为和人设。`user` 代表用户的输入。`assistant` 代表模型之前的回复，用于给模型提供它说过什么的上下文。在多轮对话中，每轮结束后需要把 user 和 assistant 消息都追加到历史记录里。

> _Q: `temperature` 参数是什么？_

temperature 控制模型输出的随机性。设为 `0` 时，模型是确定性的，总是选择最可能的 token——适合事实性或结构化任务。值越高（最高 `2`），随机性越强，适合创意类任务。`0.7` 是通用场景常用的默认值。

> _Q: 为什么不能把 OpenAI API Key 直接写在代码里？_

API Key 是敏感信息。直接写在代码里有意外泄露的风险——比如不小心把代码提交到公开的 GitHub 仓库。标准做法是把 API Key 存储在环境变量或 `.env` 文件中（通过 `.gitignore` 排除在版本控制之外），在运行时用 `os.environ` 或 `python-dotenv` 这类库加载。
