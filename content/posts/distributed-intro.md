---
title: "Distributed Systems: Core Concepts"
topic: distributed
section: Fundamentals
order: 1
duration: 15
date: 2026-03-26
---

## What is a Distributed System?

A **distributed system** is a collection of independent computers that appear to users as a single coherent system. The machines communicate over a network and coordinate their actions by passing messages.

Examples you use every day:
- **Google Search** — thousands of servers handle your query in parallel
- **Netflix** — video is served from the nearest data center to you
- **WhatsApp** — messages route through distributed servers globally

## Why Distributed Systems?

| Problem | Solution |
|---------|----------|
| One server can't handle the load | **Scale out** — add more machines |
| One server failure = downtime | **Replication** — copy data across machines |
| Users are global, server is local | **Geographic distribution** — servers near users |

## The CAP Theorem

The **CAP theorem** states that a distributed system can only guarantee **2 out of 3** properties:

- **C — Consistency**: Every read gets the most recent write (or an error)
- **A — Availability**: Every request gets a response (no errors), even if it's not the latest data
- **P — Partition Tolerance**: The system continues operating even if network messages are dropped between nodes

**The catch**: Network partitions are unavoidable in real distributed systems. So in practice, you're always choosing between **CP** or **AP**.

| Choice | Behavior | Example |
|--------|----------|---------|
| **CP** | Returns error if data might be stale | HBase, ZooKeeper |
| **AP** | Returns possibly stale data | Cassandra, DynamoDB |

## Consistency vs Availability Trade-off

Imagine two servers (A and B) that replicate data. A network cut occurs between them:

- **CP system**: Server B refuses to respond until it can confirm data with A → consistent, but unavailable
- **AP system**: Server B responds with its own (possibly stale) data → available, but inconsistent

Neither is "better" — it depends on your use case:
- **Banking** → CP (you never want stale balance data)
- **Shopping cart** → AP (it's OK if the cart is slightly out of date)

## Fallacies of Distributed Computing

Common assumptions that are **wrong** when building distributed systems:

1. The network is reliable
2. Latency is zero
3. Bandwidth is infinite
4. The network is secure
5. Topology doesn't change

These are called the **8 Fallacies of Distributed Computing** — every distributed systems engineer learns these the hard way.

## Interview Questions

> _Q: What is the CAP theorem?_

CAP states that a distributed system can only guarantee two of three properties: Consistency, Availability, and Partition Tolerance. Since network partitions are inevitable, systems must choose between CP (consistent but may be unavailable during partitions) and AP (always available but may return stale data).

> _Q: What is the difference between horizontal and vertical scaling?_

Vertical scaling (scale up) means adding more resources to a single machine — more CPU, RAM, storage. Horizontal scaling (scale out) means adding more machines. Horizontal scaling is preferred for distributed systems because it has no theoretical upper limit and provides fault tolerance.

> _Q: What is replication and why is it important?_

Replication means storing copies of data on multiple machines. It provides fault tolerance (if one node fails, others have the data), improved read performance (read from the nearest replica), and geographic distribution. The trade-off is keeping replicas in sync — this is where consistency challenges arise.

> _Q: What is a network partition?_

A network partition occurs when some nodes in a distributed system cannot communicate with others due to a network failure. This is why "P" in CAP is non-negotiable — partitions happen in real networks, so systems must be designed to handle them.
