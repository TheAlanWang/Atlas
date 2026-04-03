---
title: "RabbitMQ: Core Concepts"
topic: distributed
section: Messaging
order: 2
duration: 18
date: 2026-03-26
---

## What is RabbitMQ?

**RabbitMQ** is an open-source message broker that implements the **AMQP (Advanced Message Queuing Protocol)**. It acts as a middleman between services — producers send messages to RabbitMQ, and consumers receive them.

Unlike Kafka, RabbitMQ is a **traditional message broker**: messages are pushed to consumers and deleted once acknowledged. It excels at complex routing and task distribution.

## Core Concepts

### Producer & Consumer
- **Producer**: sends messages to RabbitMQ
- **Consumer**: receives and processes messages from RabbitMQ

### Queue
A **queue** is a buffer that stores messages until a consumer processes them. Queues are durable (survive broker restart) or transient.

### Exchange
An **exchange** receives messages from producers and routes them to queues based on rules. The producer never sends directly to a queue — it always goes through an exchange.

```
Producer → Exchange → (routing rules) → Queue → Consumer
```

### Binding
A **binding** is the link between an exchange and a queue, with an optional routing key.

## Exchange Types

This is where RabbitMQ shines — flexible routing logic:

### Direct Exchange
Routes to queues where the binding key **exactly matches** the routing key.

```
Exchange (direct)
  routing_key="error"   → Queue: error-logs
  routing_key="info"    → Queue: info-logs
```

### Fanout Exchange
Routes to **all bound queues**, ignoring the routing key. Pure pub/sub.

```
Exchange (fanout)
  → Queue: email-service
  → Queue: sms-service
  → Queue: push-service
```

### Topic Exchange
Routes based on **wildcard pattern matching** on the routing key.

```
routing_key="order.created"  → matches "order.*" and "*.created"
routing_key="user.deleted"   → matches "user.*" and "*.deleted"
```

- `*` matches exactly one word
- `#` matches zero or more words

### Headers Exchange
Routes based on **message header attributes** instead of routing key. Rarely used.

## Message Acknowledgment

RabbitMQ ensures messages aren't lost with **acknowledgments (acks)**:

1. Consumer receives message
2. Consumer processes it
3. Consumer sends **ack** → RabbitMQ deletes the message

If the consumer crashes before acking, RabbitMQ re-queues the message for another consumer.

```python
def callback(ch, method, properties, body):
    process(body)
    ch.basic_ack(delivery_tag=method.delivery_tag)  # manual ack
```

## Basic Usage (Python)

```python
import pika

# Producer
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='tasks', durable=True)
channel.basic_publish(
    exchange='',
    routing_key='tasks',
    body='{"task": "resize_image", "id": 42}'
)

# Consumer
def callback(ch, method, properties, body):
    print(f"Processing: {body}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue='tasks', on_message_callback=callback)
channel.start_consuming()
```

## RabbitMQ vs Kafka

| Feature | RabbitMQ | Kafka |
|---------|----------|-------|
| Message model | Push (broker pushes to consumer) | Pull (consumer pulls from broker) |
| Retention | Deleted after ack | Persisted on disk |
| Replay | Not supported | Supported |
| Routing | Powerful (exchanges) | Simple (topic + partition) |
| Throughput | Moderate | Very high |
| Latency | Lower | Higher |

## Key Questions

> _Q: What is the role of an exchange in RabbitMQ?_

An exchange receives messages from producers and routes them to queues based on routing rules. Producers never write directly to a queue — the exchange decides which queues receive the message based on the exchange type (direct, fanout, topic) and binding keys.

> _Q: What is the difference between direct, fanout, and topic exchanges?_

Direct exchange routes messages to queues with an exactly matching binding key. Fanout exchange broadcasts to all bound queues (ignoring the routing key). Topic exchange routes based on wildcard patterns — `*` matches one word, `#` matches zero or more words.

> _Q: How does RabbitMQ prevent message loss?_

Through acknowledgments (acks). A message stays in the queue until the consumer explicitly acknowledges it. If a consumer crashes before acking, the message is re-queued. Combine with durable queues and persistent messages to survive broker restarts.

> _Q: When would you choose RabbitMQ over Kafka?_

Choose RabbitMQ when you need complex routing logic, lower latency, or when messages should be deleted after processing. Choose Kafka when you need high throughput, message replay, or multiple independent consumer groups reading the same stream.
