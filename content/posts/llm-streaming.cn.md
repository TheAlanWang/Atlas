---
title: "流式响应（Streaming）"
topic: llm
section: Using LLM APIs
order: 2
duration: 15
date: 2026-03-25
---

## 什么是流式响应？

默认情况下，Chat Completions API 会等模型把整个回复全部生成完，才一次性返回结果。对于较长的回复，用户需要盯着空白屏幕等好几秒。

**流式响应（Streaming）** 会在模型生成 token 的同时，实时把内容发送给客户端——就像你在 ChatGPT 里看到的文字一个个出现的效果。

```
不用 streaming：等待 3 秒 → 一次性收到完整回复
用 streaming：  收到 token → token → token → token → 完成
```

总的生成时间没有变化，但应用体验会感觉快得多，也更有响应感。

## Python 中的流式请求

设置 `stream=True` 开启流式模式。此时返回的不是一个完整的响应对象，而是一个可迭代的 chunk 序列：

```python
from openai import OpenAI

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "用三句话解释什么是 RAG。"}],
    stream=True
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta is not None:
        print(delta, end="", flush=True)
```

每个 `chunk` 包含一小段回复内容，文字在 `chunk.choices[0].delta.content` 里。最后一个 chunk 的 `content` 为 `None`，表示流结束了。

## Next.js 中的流式响应

在 Next.js App Router 的 API 路由中，可以用 `ReadableStream` 把 OpenAI 的流直接传给浏览器：

```typescript
import OpenAI from "openai";

const client = new OpenAI();

export async function POST(req: Request) {
  const { message } = await req.json();

  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: message }],
    stream: true,
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

## 前端读取流

在客户端，用 Fetch API 配合 `ReadableStream` reader，实时消费每个到来的 chunk：

```typescript
async function sendMessage(message: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    result += chunk;
    setOutput(result); // 每收到一个 chunk 就更新 UI
  }
}
```

每次收到 chunk 就更新 UI 状态，这就产生了"打字机"效果。

## 面试常问

> _Q: 什么是 LLM API 中的流式响应？为什么要用它？_

流式响应是在模型生成 token 的同时，实时将内容发送给客户端，而不是等待完整回复生成后再一次性返回。这能提升用户感知性能——用户立刻就能看到文字出现，而不是盯着空白屏幕等待。总的生成时间不变，但体验更流畅。对于面向用户的 LLM 应用，流式响应是标准做法。

> _Q: OpenAI Python SDK 中流式请求是如何工作的？_

在调用 `client.chat.completions.create()` 时传入 `stream=True`。返回值变成一个 chunk 对象的迭代器，而不是单一的响应对象。每个 chunk 的 `chunk.choices[0].delta.content` 包含增量文字。你遍历 chunk 并累积文字，当 `delta.content` 为 `None` 时，表示流结束。

> _Q: 如何在 Next.js API 路由中实现 LLM 流式响应？_

使用 `ReadableStream` 把 OpenAI 的流传给 HTTP 响应。API 路由遍历 OpenAI 流，用 `TextEncoder` 对每个 chunk 编码后放入 `ReadableStream` 的 controller。路由返回一个携带该流的 `Response`，`Content-Type` 设为 `text/plain`。前端通过 `response.body.getReader()` 读取响应体，每收到一个解码后的 chunk 就更新 UI 状态。
