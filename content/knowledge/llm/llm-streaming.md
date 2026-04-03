---
title: "Streaming Responses"
topic: llm
section: Using LLM APIs
order: 2
duration: 15
date: 2026-03-25
---

## What is Streaming?

By default, the Chat Completions API waits until the model finishes generating the entire response before sending anything back. For a long response, this means your user stares at a blank screen for several seconds.

**Streaming** sends tokens back to the client as they are generated, just like you see in ChatGPT where the text appears word by word.

```
Without streaming: wait 3s → receive full response at once
With streaming:    receive token → token → token → token → done
```

This makes your application feel much faster and more responsive, even though the total generation time is the same.

## Streaming with Python

Set `stream=True` to enable streaming. Instead of a single response object, you get an iterator of chunks:

```python
from openai import OpenAI

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain what RAG is in 3 sentences."}],
    stream=True
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta is not None:
        print(delta, end="", flush=True)
```

Each `chunk` contains a small piece of the response. The text lives at `chunk.choices[0].delta.content`, which is `None` on the final chunk signaling the stream is done.

## Streaming in Next.js

In a Next.js App Router API route, you can stream the response directly to the browser using a `ReadableStream`:

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

## Reading the Stream on the Frontend

On the client side, use the `Fetch API` with a `ReadableStream` reader to consume chunks as they arrive:

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
    setOutput(result); // update UI with each chunk
  }
}
```

Each time a chunk arrives, you update the UI state, which creates the "typing" effect.

## Key Questions

> _Q: What is streaming in the context of LLM APIs, and why is it useful?_

Streaming sends tokens to the client incrementally as the model generates them, rather than waiting for the full response to complete. This improves perceived performance: users see text appearing immediately instead of waiting for a blank screen. The total generation time is the same, but the experience feels faster. It is the standard approach for any user-facing LLM application.

> _Q: How does streaming work in the OpenAI Python SDK?_

You pass `stream=True` to `client.chat.completions.create()`. The return value becomes an iterator of chunk objects instead of a single response. Each chunk contains a `delta` with the incremental text at `chunk.choices[0].delta.content`. You iterate over chunks and accumulate the text. The stream ends when `delta.content` is `None`.

> _Q: How would you implement a streaming LLM response in a Next.js API route?_

You use a `ReadableStream` to pipe the OpenAI stream to the HTTP response. The API route iterates over the OpenAI stream, encodes each chunk with `TextEncoder`, and enqueues it into the `ReadableStream` controller. The route returns a `Response` with that stream and `Content-Type: text/plain`. On the frontend, you read the response body using `response.body.getReader()` and update UI state with each decoded chunk.
