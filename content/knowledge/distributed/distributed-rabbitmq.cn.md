---
title: "RabbitMQ：核心概念"
topic: distributed
section: Messaging
order: 2
duration: 18
date: 2026-03-26
---

## 什么是 RabbitMQ？

**RabbitMQ** 是一个开源消息代理，实现了 **AMQP（高级消息队列协议）**。它作为服务之间的中间人——生产者把消息发给 RabbitMQ，消费者从中取出消息处理。

与 Kafka 不同，RabbitMQ 是**传统消息代理**：消息被推送给消费者，确认后删除。它擅长复杂路由和任务分发。

## 核心概念

### 生产者 & 消费者
- **生产者（Producer）**：向 RabbitMQ 发送消息
- **消费者（Consumer）**：从 RabbitMQ 接收并处理消息

### Queue（队列）
**队列**是存储消息的缓冲区，直到消费者处理它们。队列可以设置为持久化（broker 重启后仍保留）或临时的。

### Exchange（交换机）
**交换机**接收生产者的消息，并根据规则路由到队列。生产者不会直接往队列写消息——消息始终经过交换机。

```
生产者 → 交换机 → （路由规则）→ 队列 → 消费者
```

### Binding（绑定）
**绑定**是交换机和队列之间的连接，可以带一个可选的路由键（routing key）。

## 交换机类型

这是 RabbitMQ 的核心优势——灵活的路由逻辑：

### Direct Exchange（直连交换机）
只路由到绑定键**完全匹配**路由键的队列。

```
交换机（direct）
  routing_key="error"  → 队列：error-logs
  routing_key="info"   → 队列：info-logs
```

### Fanout Exchange（扇形交换机）
路由到**所有绑定的队列**，忽略路由键。纯发布/订阅模式。

```
交换机（fanout）
  → 队列：email-service
  → 队列：sms-service
  → 队列：push-service
```

### Topic Exchange（主题交换机）
基于路由键的**通配符模式匹配**来路由。

```
routing_key="order.created"  → 匹配 "order.*" 和 "*.created"
routing_key="user.deleted"   → 匹配 "user.*" 和 "*.deleted"
```

- `*` 匹配一个单词
- `#` 匹配零个或多个单词

### Headers Exchange（头部交换机）
基于消息头属性路由，而非路由键。很少使用。

## 消息确认机制

RabbitMQ 通过**确认（ack）**保证消息不丢失：

1. 消费者收到消息
2. 消费者处理消息
3. 消费者发送 **ack** → RabbitMQ 删除消息

如果消费者在 ack 之前崩溃，RabbitMQ 会将消息重新放回队列，交给其他消费者处理。

```python
def callback(ch, method, properties, body):
    process(body)
    ch.basic_ack(delivery_tag=method.delivery_tag)  # 手动确认
```

## 基本用法（Python）

```python
import pika

# 生产者
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='tasks', durable=True)
channel.basic_publish(
    exchange='',
    routing_key='tasks',
    body='{"task": "resize_image", "id": 42}'
)

# 消费者
def callback(ch, method, properties, body):
    print(f"处理中：{body}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue='tasks', on_message_callback=callback)
channel.start_consuming()
```

## RabbitMQ vs Kafka

| 特性 | RabbitMQ | Kafka |
|------|----------|-------|
| 消费模式 | 推送（broker 主动推） | 拉取（消费者主动拉） |
| 消息保留 | 确认后删除 | 持久化存储 |
| 消息重放 | 不支持 | 支持 |
| 路由能力 | 强大（多种交换机） | 简单（topic + partition） |
| 吞吐量 | 中等 | 极高 |
| 延迟 | 较低 | 较高 |

## 关键问题

> _Q: RabbitMQ 中 Exchange 的作用是什么？_

交换机接收生产者的消息，根据路由规则将消息分发到队列。生产者不直接向队列写消息，交换机根据类型（direct、fanout、topic）和绑定键决定哪些队列收到消息。

> _Q: Direct、Fanout、Topic 交换机有什么区别？_

Direct 交换机将消息路由到绑定键完全匹配的队列。Fanout 交换机广播到所有绑定的队列（忽略路由键）。Topic 交换机基于通配符模式匹配——`*` 匹配一个单词，`#` 匹配零个或多个单词。

> _Q: RabbitMQ 如何防止消息丢失？_

通过确认机制（ack）。消息在队列中一直保留，直到消费者显式确认。消费者崩溃未 ack 时，消息重新入队。配合持久化队列和持久化消息，可以在 broker 重启后仍保留消息。

> _Q: 什么时候选 RabbitMQ 而不是 Kafka？_

需要复杂路由逻辑、更低延迟、或消息处理后应删除时选 RabbitMQ。需要高吞吐、消息重放、或多个独立消费者组读取同一数据流时选 Kafka。
