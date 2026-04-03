---
title: "PostgreSQL: Core Concepts"
topic: postgresql
section: Fundamentals
order: 1
duration: 15
date: 2026-03-26
---

## What is PostgreSQL?

**PostgreSQL** (often called "Postgres") is an open-source relational database that has been in active development since 1996. It's widely considered the most advanced open-source SQL database, known for reliability, standards compliance, and extensibility.

Used by: Apple, Instagram, Spotify, Reddit, and most serious backend applications.

## Core Concepts

### Tables, Rows, Columns

Data is organized in **tables**. Each row is a record; each column is a field with a defined type.

```sql
CREATE TABLE users (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Data Types

| Type | Use Case |
|------|----------|
| `INTEGER`, `BIGINT` | Whole numbers |
| `NUMERIC`, `DECIMAL` | Exact decimals (money) |
| `VARCHAR(n)`, `TEXT` | Strings |
| `BOOLEAN` | True/false |
| `TIMESTAMP` | Date + time |
| `UUID` | Unique identifiers |
| `JSONB` | JSON data (indexed) |
| `ARRAY` | Arrays of any type |

### Primary Key & Foreign Key

```sql
CREATE TABLE orders (
    id      SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),  -- foreign key
    amount  NUMERIC(10, 2) NOT NULL
);
```

A **primary key** uniquely identifies each row. A **foreign key** links a row to a row in another table, enforcing referential integrity.

## ACID Transactions

PostgreSQL guarantees **ACID** properties:

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;  -- both updates succeed together
-- or ROLLBACK; to undo both
```

If anything fails between `BEGIN` and `COMMIT`, the entire transaction is rolled back. This is why PostgreSQL is trusted for financial systems.

## Essential Queries

```sql
-- Select with filter and sort
SELECT name, email FROM users
WHERE created_at > '2026-01-01'
ORDER BY name ASC
LIMIT 10;

-- Join
SELECT u.name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.amount > 100;

-- Aggregate
SELECT user_id, COUNT(*), SUM(amount)
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 500;

-- Insert
INSERT INTO users (name, email) VALUES ('Alan', 'alan@example.com');

-- Update
UPDATE users SET name = 'Alan Wang' WHERE id = 1;

-- Delete
DELETE FROM orders WHERE id = 5;
```

## Indexes

An **index** speeds up queries by letting PostgreSQL find rows without scanning the entire table.

```sql
-- Create index on frequently queried column
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multi-column queries
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
```

Without an index, PostgreSQL does a **sequential scan** (reads every row). With an index, it does an **index scan** (jumps directly to matching rows).

Rule of thumb: index columns you filter (`WHERE`), join (`JOIN ON`), or sort (`ORDER BY`) frequently.

## JSONB — The Best of Both Worlds

PostgreSQL's `JSONB` column lets you store flexible JSON data while still supporting indexing and querying:

```sql
CREATE TABLE products (
    id      SERIAL PRIMARY KEY,
    name    TEXT,
    details JSONB
);

INSERT INTO products (name, details)
VALUES ('Laptop', '{"brand": "Apple", "ram": 16, "tags": ["m3", "pro"]}');

-- Query inside JSON
SELECT name FROM products
WHERE details->>'brand' = 'Apple'
AND (details->>'ram')::int > 8;

-- Index on JSON field
CREATE INDEX idx_products_brand ON products((details->>'brand'));
```

## Key Questions

> _Q: What is a primary key vs a foreign key?_

A primary key uniquely identifies each row in a table — no two rows can have the same value. A foreign key is a column that references the primary key of another table, creating a relationship between them and enforcing referential integrity (you can't reference a row that doesn't exist).

> _Q: What is a database transaction and why is it important?_

A transaction is a group of SQL operations that execute as a single unit. Either all operations succeed (COMMIT) or all are undone (ROLLBACK). Transactions ensure ACID properties — for example, in a bank transfer, both the debit and credit must succeed together, or neither should happen.

> _Q: What is an index and when should you use one?_

An index is a data structure that speeds up row lookups by allowing the database to jump directly to matching rows instead of scanning the entire table. Use indexes on columns frequently used in WHERE, JOIN, and ORDER BY clauses. The tradeoff: indexes speed up reads but slow down writes (the index must be updated on every INSERT/UPDATE/DELETE).

> _Q: What is the difference between VARCHAR and TEXT in PostgreSQL?_

In PostgreSQL, both store variable-length strings and have identical performance. `VARCHAR(n)` enforces a maximum length; `TEXT` has no limit. In practice, most PostgreSQL engineers prefer `TEXT` unless there's a business reason to enforce a length constraint.
