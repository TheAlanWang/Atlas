---
title: "PostgreSQL：核心概念"
topic: postgresql
section: Fundamentals
order: 1
duration: 15
date: 2026-03-26
---

## 什么是 PostgreSQL？

**PostgreSQL**（通常简称 "Postgres"）是一个开源关系型数据库，自 1996 年起持续迭代。它被广泛认为是最先进的开源 SQL 数据库，以可靠性、标准兼容性和可扩展性著称。

使用者包括：Apple、Instagram、Spotify、Reddit，以及大多数严肃的后端应用。

## 核心概念

### 表、行、列

数据组织在**表**中。每行是一条记录，每列是一个有类型定义的字段。

```sql
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 数据类型

| 类型 | 适用场景 |
|------|---------|
| `INTEGER`、`BIGINT` | 整数 |
| `NUMERIC`、`DECIMAL` | 精确小数（金额）|
| `VARCHAR(n)`、`TEXT` | 字符串 |
| `BOOLEAN` | 布尔值 |
| `TIMESTAMP` | 日期 + 时间 |
| `UUID` | 唯一标识符 |
| `JSONB` | JSON 数据（支持索引）|
| `ARRAY` | 任意类型的数组 |

### 主键与外键

```sql
CREATE TABLE orders (
    id      SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),  -- 外键
    amount  NUMERIC(10, 2) NOT NULL
);
```

**主键**唯一标识每一行。**外键**将一行关联到另一张表中的行，强制引用完整性（不能引用不存在的行）。

## ACID 事务

PostgreSQL 保证 **ACID** 特性：

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;  -- 两个操作一起成功
-- 或 ROLLBACK; 一起撤销
```

如果 `BEGIN` 和 `COMMIT` 之间有任何失败，整个事务都会回滚。这就是为什么 PostgreSQL 被金融系统所信任。

## 常用查询

```sql
-- 条件查询与排序
SELECT name, email FROM users
WHERE created_at > '2026-01-01'
ORDER BY name ASC
LIMIT 10;

-- Join 关联查询
SELECT u.name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.amount > 100;

-- 聚合查询
SELECT user_id, COUNT(*), SUM(amount)
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 500;

-- 插入
INSERT INTO users (name, email) VALUES ('Alan', 'alan@example.com');

-- 更新
UPDATE users SET name = 'Alan Wang' WHERE id = 1;

-- 删除
DELETE FROM orders WHERE id = 5;
```

## 索引

**索引**让 PostgreSQL 无需扫描整张表就能快速找到行，大幅提升查询速度。

```sql
-- 在常用查询列上创建索引
CREATE INDEX idx_users_email ON users(email);

-- 多列复合索引
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
```

没有索引时，PostgreSQL 做**全表扫描**（逐行读取）。有索引时，做**索引扫描**（直接跳到匹配的行）。

经验法则：对频繁出现在 `WHERE`、`JOIN ON`、`ORDER BY` 中的列建索引。

## JSONB — 兼顾两个世界

PostgreSQL 的 `JSONB` 列让你存储灵活的 JSON 数据，同时支持索引和查询：

```sql
CREATE TABLE products (
    id      SERIAL PRIMARY KEY,
    name    TEXT,
    details JSONB
);

INSERT INTO products (name, details)
VALUES ('笔记本', '{"brand": "Apple", "ram": 16, "tags": ["m3", "pro"]}');

-- 查询 JSON 内部字段
SELECT name FROM products
WHERE details->>'brand' = 'Apple'
AND (details->>'ram')::int > 8;

-- 对 JSON 字段建索引
CREATE INDEX idx_products_brand ON products((details->>'brand'));
```

## 关键问题

> _Q: 主键和外键的区别是什么？_

主键唯一标识表中的每一行——不能有两行拥有相同的主键值。外键是引用另一张表主键的列，建立两表之间的关系，并强制引用完整性（不能引用不存在的行）。

> _Q: 什么是数据库事务？为什么重要？_

事务是一组作为单一单元执行的 SQL 操作。要么所有操作成功（COMMIT），要么全部撤销（ROLLBACK）。事务保证了 ACID 特性——例如银行转账中，借记和贷记必须同时成功，否则都不发生。

> _Q: 什么是索引？什么时候该用？_

索引是一种数据结构，让数据库直接跳到匹配的行，而不必扫描整张表。在频繁用于 WHERE、JOIN、ORDER BY 的列上建索引。代价是：索引加速了读取，但拖慢了写入（每次 INSERT/UPDATE/DELETE 都要更新索引）。

> _Q: PostgreSQL 中 VARCHAR 和 TEXT 有什么区别？_

在 PostgreSQL 中，两者都存储可变长度字符串，性能完全相同。`VARCHAR(n)` 强制最大长度限制，`TEXT` 没有限制。实践中，大多数 PostgreSQL 工程师倾向于用 `TEXT`，除非业务上有强制长度限制的需求。
