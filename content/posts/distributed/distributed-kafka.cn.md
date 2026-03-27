---
title: "Apache Kafka：核心概念"
topic: distributed
section: Messaging
order: 3
duration: 20
date: 2026-03-26
---

## 什么是 Kafka？

**Apache Kafka** 是一个分布式事件流平台。最初由 LinkedIn 构建，用于处理大规模的用户行为追踪，2011 年开源。

Kafka 不只是消息队列——它是一个**持久化的分布式日志**。消息存储在磁盘上，可以被重放，这让它和 RabbitMQ 等传统队列有本质区别。

## 核心概念

### Topic（主题）
**Topic** 是消息的命名分类。生产者往 topic 写消息，消费者从 topic 读消息。

```
生产者 → [Topic: "orders"] → 消费者
```

### Partition（分区）
每个 topic 被拆分成多个 **partition**——有序、不可变的消息序列。分区是实现并行的关键。

```
Topic: "orders"
  Partition 0: [msg1, msg4, msg7]
  Partition 1: [msg2, msg5, msg8]
  Partition 2: [msg3, msg6, msg9]
```

- 分区越多 = 吞吐量越高
- 同一分区内的消息有序；跨分区不保证顺序

### Offset（偏移量）
每条消息在分区内有唯一的 **offset**——它在日志中的位置。消费者通过记录 offset 来知道自己读到哪了。

### Consumer Group（消费者组）
**消费者组**是一组共同消费某个 topic 的消费者。每个分区同一时刻只分配给组内的一个消费者。

```
Topic: "orders"（3个分区）
Consumer Group: "payment-service"
  消费者 A → Partition 0
  消费者 B → Partition 1
  消费者 C → Partition 2
```

这样 3 个消费者并行处理 3 个分区，吞吐量翻倍。

### Broker（代理节点）
**Broker** 是 Kafka 的服务器节点。多个 broker 组成一个 Kafka **集群**。每个分区会在多个 broker 上保存副本，实现容错。

## Kafka vs 传统消息队列

| 特性 | 传统队列（RabbitMQ） | Kafka |
|------|-------------------|-------|
| 消息保留 | 消费后删除 | 持久化存储（可配置） |
| 消息重放 | 不支持 | 消费者可以重读历史消息 |
| 吞吐量 | 中等 | 极高（百万/秒） |
| 消费模式 | 推送（Push） | 拉取（Pull） |
| 消息顺序 | 队列级别 | 分区级别 |

**选 Kafka 的场景：**
- 需要高吞吐（日志、监控指标、点击流）
- 需要消息重放（审计日志、事件溯源）
- 多个独立服务消费同一事件流

**选 RabbitMQ 的场景：**
- 需要复杂路由规则
- 需要更低延迟
- 消息处理后应该删除

## 基本用法（Python）

```python
from kafka import KafkaProducer, KafkaConsumer
import json

# 生产者
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
producer.send('orders', {'order_id': 123, 'amount': 99.99})

# 消费者
consumer = KafkaConsumer(
    'orders',
    bootstrap_servers='localhost:9092',
    group_id='payment-service',
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)
for message in consumer:
    print(message.value)  # {'order_id': 123, 'amount': 99.99}
```

## 面试常问

> _Q: 什么是 Kafka 的 partition？为什么重要？_

Partition 是 topic 内的有序、不可变日志。重要性在于它实现了并行——消费者组内的多个消费者可以同时各自处理一个分区。分区越多吞吐量越高，但管理开销也越大。同一分区内严格有序，跨分区不保证顺序。

> _Q: 什么是消费者组（Consumer Group）？_

消费者组是共同消费一个 topic 的一组消费者。每个分区同一时刻只分配给组内一个消费者，实现负载分摊。如果某个消费者挂了，Kafka 会触发再平衡，把它的分区重新分配给其他消费者。

> _Q: Kafka 如何保证消息顺序？_

Kafka 只保证单个分区内的消息顺序。需要严格全局顺序时，可以只用一个分区（但会失去并行能力）。大多数场景下，按 key 路由到同一分区就够了——相同 key 的消息总在同一分区内有序。

> _Q: Kafka 和 RabbitMQ 的区别是什么？_

Kafka 是分布式日志，消息持久化存储，消费者主动拉取。RabbitMQ 是传统消息代理，消息被推送给消费者，确认后删除。Kafka 擅长高吞吐和消息重放，RabbitMQ 擅长复杂路由和低延迟场景。

> _Q: Kafka 消费者挂了会怎样？_

Kafka 通过心跳超时检测到消费者故障后，触发**再平衡（rebalance）**，将该消费者的分区重新分配给组内其他活跃消费者。新消费者从上次提交的 offset 继续消费，不会丢消息（但可能会重复处理部分消息）。
