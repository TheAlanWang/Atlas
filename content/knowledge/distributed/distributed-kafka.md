---
title: "Apache Kafka: Core Concepts"
topic: distributed
section: Messaging
order: 3
duration: 20
date: 2026-03-26
---

## What is Kafka?

**Apache Kafka** is a distributed event streaming platform. It was originally built at LinkedIn to handle activity tracking at massive scale, then open-sourced in 2011.

Kafka is not just a message queue — it's a **persistent, distributed log**. Messages are stored on disk and can be replayed, making it fundamentally different from traditional queues like RabbitMQ.

## Core Concepts

### Topic
A **topic** is a named category for messages. Producers write to a topic; consumers read from a topic.

```
Producer → [Topic: "orders"] → Consumer
```

### Partition
Each topic is split into **partitions** — ordered, immutable sequences of messages. Partitions enable parallelism.

```
Topic: "orders"
  Partition 0: [msg1, msg4, msg7]
  Partition 1: [msg2, msg5, msg8]
  Partition 2: [msg3, msg6, msg9]
```

- More partitions = higher throughput
- Messages within a partition are ordered; across partitions, they are not

### Offset
Each message in a partition has a unique **offset** — its position in the log. Consumers track their offset to know where they left off.

### Consumer Group
A **consumer group** is a set of consumers that jointly consume a topic. Each partition is assigned to exactly one consumer in the group.

```
Topic: "orders" (3 partitions)
Consumer Group: "payment-service"
  Consumer A → Partition 0
  Consumer B → Partition 1
  Consumer C → Partition 2
```

This enables parallel processing: 3 consumers process 3 partitions simultaneously.

### Broker
A **broker** is a Kafka server. A Kafka **cluster** is a group of brokers. Each partition is replicated across brokers for fault tolerance.

## Why Kafka Over a Traditional Queue?

| Feature | Traditional Queue (RabbitMQ) | Kafka |
|---------|------------------------------|-------|
| Message retention | Deleted after consumption | Retained on disk (configurable) |
| Replay | Not possible | Consumers can re-read old messages |
| Throughput | Moderate | Very high (millions/sec) |
| Consumer model | Push | Pull |
| Ordering | Per queue | Per partition |

**Use Kafka when:**
- You need high throughput (logs, metrics, click streams)
- You need message replay (audit logs, event sourcing)
- Multiple independent services consume the same events

**Use RabbitMQ when:**
- You need complex routing rules
- You need lower latency
- Messages should be deleted after processing

## Basic Producer/Consumer (Python)

```python
from kafka import KafkaProducer, KafkaConsumer
import json

# Producer
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
producer.send('orders', {'order_id': 123, 'amount': 99.99})

# Consumer
consumer = KafkaConsumer(
    'orders',
    bootstrap_servers='localhost:9092',
    group_id='payment-service',
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)
for message in consumer:
    print(message.value)  # {'order_id': 123, 'amount': 99.99}
```

## Key Questions

> _Q: What is a Kafka partition and why does it matter?_

A partition is an ordered, immutable log within a topic. Partitions matter because they enable parallelism — multiple consumers in a group can each process a different partition simultaneously. More partitions = higher throughput, but also more overhead. Messages within a partition are strictly ordered; ordering across partitions is not guaranteed.

> _Q: What is a consumer group?_

A consumer group is a set of consumers that collectively consume a topic. Each partition is assigned to exactly one consumer in the group at a time, enabling load distribution. If one consumer fails, Kafka rebalances and reassigns its partitions to the remaining consumers.

> _Q: How does Kafka guarantee message ordering?_

Kafka guarantees ordering only within a single partition. If strict global ordering is required, use a single partition (at the cost of parallelism). For most use cases, per-key ordering is sufficient — producers can route messages with the same key to the same partition.

> _Q: What is the difference between Kafka and RabbitMQ?_

Kafka is a distributed log — messages are persisted on disk and consumers pull at their own pace. RabbitMQ is a traditional message broker — messages are pushed to consumers and deleted after acknowledgment. Kafka excels at high throughput and message replay; RabbitMQ excels at complex routing and lower latency.

> _Q: What happens when a Kafka consumer fails?_

Kafka detects the failure via a heartbeat timeout and triggers a **rebalance** — redistributing the failed consumer's partitions among the remaining active consumers in the group. The new consumer resumes from the last committed offset, so no messages are lost (though some may be reprocessed).
