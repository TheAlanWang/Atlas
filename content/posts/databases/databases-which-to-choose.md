---
title: "SQL vs NoSQL: Which Database Should You Use?"
topic: databases
section: Overview
order: 1
duration: 12
date: 2026-03-26
---

## The Core Question

Every application needs to store data. The first decision is: **relational (SQL) or non-relational (NoSQL)?**

There is no universally correct answer — the right choice depends on your data structure, access patterns, and scale requirements.

## Relational Databases (SQL)

Relational databases store data in **tables with rows and columns**. Relationships between tables are defined with foreign keys. You query them with SQL.

```sql
-- Users table
id | name  | email
1  | Alan  | alan@example.com

-- Orders table
id | user_id | amount
1  | 1       | 99.99
```

**Strengths:**
- **ACID guarantees** — transactions are reliable (atomic, consistent, isolated, durable)
- **Joins** — query related data across multiple tables efficiently
- **Schema enforcement** — data structure is validated before writing
- **Mature ecosystem** — decades of tooling, optimization, and expertise

**Popular options:** PostgreSQL, MySQL, SQLite

**Use when:**
- Data has clear relationships (users → orders → payments)
- You need transactions (banking, e-commerce)
- Data structure is stable and well-defined

## Non-Relational Databases (NoSQL)

NoSQL databases drop the table/row structure in favor of flexible formats — documents, key-value pairs, graphs, or time-series.

```json
// MongoDB document
{
  "_id": "1",
  "name": "Alan",
  "email": "alan@example.com",
  "orders": [
    { "id": "1", "amount": 99.99 }
  ]
}
```

**Strengths:**
- **Flexible schema** — documents can have different fields
- **Horizontal scaling** — designed to scale across many machines
- **Performance** — no joins means simpler, faster reads for certain patterns
- **Developer friendly** — JSON documents map naturally to application objects

**Popular options:** MongoDB, Redis, Cassandra, DynamoDB

**Use when:**
- Data structure varies or evolves frequently
- You need extreme write throughput (logs, events, IoT)
- You're storing hierarchical or nested data naturally

## Side-by-Side Comparison

| | SQL (PostgreSQL) | NoSQL (MongoDB) |
|--|-----------------|-----------------|
| **Data model** | Tables + rows | Documents (JSON) |
| **Schema** | Fixed, enforced | Flexible |
| **Relationships** | Joins across tables | Embed or reference |
| **Transactions** | Full ACID | Limited (improving) |
| **Scaling** | Vertical (primarily) | Horizontal |
| **Query language** | SQL | MongoDB Query Language |
| **Best for** | Structured, relational data | Flexible, hierarchical data |

## The "Just Use PostgreSQL" Argument

For most applications, **start with PostgreSQL**. It's battle-tested, supports JSON columns (bridging SQL and NoSQL), has excellent performance, and handles most use cases well.

Switch to NoSQL when you have a specific, compelling reason — not because it's trendy.

> "PostgreSQL can do most of what MongoDB can do, but MongoDB can't do most of what PostgreSQL can do." — common saying in the database community

## How to Decide

Ask these questions:

1. **Does my data have relationships?** → SQL
2. **Do I need ACID transactions?** → SQL
3. **Is my schema unpredictable or rapidly changing?** → NoSQL
4. **Am I storing documents/events/logs at massive scale?** → NoSQL
5. **Am I building a standard web app?** → PostgreSQL (default choice)

## Interview Questions

> _Q: What is the difference between SQL and NoSQL databases?_

SQL databases store data in tables with predefined schemas and support ACID transactions and joins. NoSQL databases use flexible data models (documents, key-value, graph) that scale horizontally and handle unstructured or rapidly changing data. SQL is preferred for relational, transactional data; NoSQL for flexible, high-scale workloads.

> _Q: What does ACID stand for?_

Atomicity (a transaction fully succeeds or fully fails), Consistency (data always moves from one valid state to another), Isolation (concurrent transactions don't interfere with each other), Durability (committed transactions survive system failures). ACID properties are what make relational databases reliable for financial and transactional systems.

> _Q: When would you choose MongoDB over PostgreSQL?_

Choose MongoDB when your data is naturally hierarchical or document-like, when the schema changes frequently, or when you need to scale writes horizontally across many servers. For most standard applications with relational data and transactional requirements, PostgreSQL is the better default choice.
