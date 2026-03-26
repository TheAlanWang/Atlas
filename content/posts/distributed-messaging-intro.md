---
title: "Message Queues: Why and How"
topic: distributed
section: Messaging
order: 1
duration: 12
date: 2026-03-26
---

## What is a Message Queue?

A **message queue** is a component that lets services communicate **asynchronously** by passing messages through a shared buffer. The sender (producer) drops a message in the queue and moves on — it doesn't wait for the receiver (consumer) to process it.

Think of it like email: you send a message and continue working. The recipient reads it when they're ready.

## Why Use a Message Queue?

Without a queue, services call each other directly (synchronous):

```
Order Service → Payment Service → Inventory Service → Notification Service
```

If Payment Service is slow or down, the entire chain stalls. With a queue:

```
Order Service → [Queue] ← Payment Service
                        ← Inventory Service
                        ← Notification Service
```

Benefits:
- **Decoupling** — services don't need to know about each other
- **Resilience** — if a consumer is down, messages wait in the queue
- **Load leveling** — smooth out traffic spikes; consumers process at their own pace
- **Scalability** — add more consumers to process faster

## Two Core Patterns

### Point-to-Point (Queue)
One producer, one consumer. Each message is processed **once**.

```
Producer → [Queue] → Consumer A
```

Use case: task processing, job queues (e.g., resize this image)

### Publish/Subscribe (Pub/Sub)
One producer, **multiple consumers**. Each consumer gets a copy of every message.

```
Producer → [Topic] → Consumer A
                   → Consumer B
                   → Consumer C
```

Use case: event broadcasting (e.g., "order placed" → notify payment, inventory, and email service simultaneously)

## Common Message Queue Systems

| System | Best For |
|--------|----------|
| **Kafka** | High-throughput event streaming, log aggregation |
| **RabbitMQ** | Complex routing, task queues, lower latency |
| **AWS SQS** | Simple managed queues on AWS |
| **Redis Streams** | Lightweight queuing with Redis |

## Interview Questions

> _Q: What is the difference between synchronous and asynchronous communication?_

Synchronous communication means the caller waits for a response before continuing (like an HTTP request). Asynchronous communication means the caller sends a message and continues without waiting — the receiver processes it independently. Message queues enable async communication between services.

> _Q: What is the difference between a queue and a topic (pub/sub)?_

A queue delivers each message to exactly one consumer (point-to-point). A topic delivers each message to all subscribers (pub/sub). Use queues for task distribution; use topics for event broadcasting where multiple services need to react to the same event.

> _Q: How does a message queue improve system resilience?_

If a downstream service goes down, messages accumulate in the queue instead of being lost. When the service recovers, it processes the backlog. Without a queue, the upstream service would either fail or need retry logic — the queue absorbs the failure gracefully.

> _Q: What is backpressure?_

Backpressure occurs when consumers can't keep up with the rate of incoming messages, causing the queue to grow. Solutions include scaling out consumers, rate limiting producers, or setting queue size limits with overflow handling.
