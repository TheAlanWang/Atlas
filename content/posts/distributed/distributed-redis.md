---
title: "Redis: Core Concepts"
topic: distributed
section: Caching
order: 1
duration: 18
date: 2026-03-26
---

## What is Redis?

**Redis** (Remote Dictionary Server) is an in-memory data store used as a cache, database, and message broker. It stores data in RAM, making reads and writes extremely fast — typically under 1 millisecond.

Redis is most commonly used as a **cache**: store frequently accessed data in Redis so you don't hit the database every time.

## Why Use a Cache?

Without caching:
```
User Request → App Server → Database (slow) → Response
```

With Redis:
```
User Request → App Server → Redis (fast hit) → Response
                          → Database (only on cache miss)
```

Benefits:
- **Speed** — memory access is ~100x faster than disk
- **Reduced DB load** — fewer queries to your database
- **Scalability** — handle more requests with the same infrastructure

## Core Data Structures

Redis isn't just key-value — it supports rich data types:

| Type | Use Case | Example |
|------|----------|---------|
| **String** | Simple cache, counters | `SET user:1:name "Alan"` |
| **Hash** | Object storage | `HSET user:1 name "Alan" age 25` |
| **List** | Queues, activity feeds | `LPUSH notifications "msg1"` |
| **Set** | Unique items, tags | `SADD online-users "user:1"` |
| **Sorted Set** | Leaderboards, rankings | `ZADD leaderboard 100 "user:1"` |
| **TTL** | Any key with expiry | `EXPIRE user:1:session 3600` |

## Cache Strategies

### Cache-Aside (Lazy Loading)
The most common pattern. The app checks the cache first; on a miss, it fetches from DB and populates the cache.

```python
def get_user(user_id):
    # 1. Check cache
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)

    # 2. Cache miss — fetch from DB
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)

    # 3. Store in cache with TTL
    redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    return user
```

### Write-Through
Every DB write also updates the cache immediately. Cache is always fresh, but every write hits both DB and cache.

### Write-Behind (Write-Back)
Writes go to cache first, then asynchronously to DB. Faster writes, but risk of data loss if cache crashes.

## Cache Invalidation

The hardest problem in caching: when to evict stale data.

- **TTL (Time-To-Live)**: automatically expire keys after N seconds
- **Explicit delete**: delete the cache key whenever the DB record changes
- **LRU eviction**: Redis automatically evicts least-recently-used keys when memory is full

## Common Problems

### Cache Stampede
Cache expires → many requests hit DB simultaneously → DB overloads.

**Fix**: use a lock or probabilistic early expiration.

### Cache Penetration
Requests for keys that don't exist in cache **or** DB (e.g., invalid IDs) — every request hits DB.

**Fix**: cache negative results (`SET user:99999 "null" EX 60`).

### Cache Avalanche
Many keys expire at the same time → sudden DB overload.

**Fix**: add random jitter to TTL values.

## Basic Usage (Python)

```python
import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

# String
r.set('key', 'value', ex=3600)   # expires in 1 hour
r.get('key')                      # b'value'

# Hash
r.hset('user:1', mapping={'name': 'Alan', 'age': '25'})
r.hgetall('user:1')               # {b'name': b'Alan', b'age': b'25'}

# Sorted Set (leaderboard)
r.zadd('leaderboard', {'user:1': 100, 'user:2': 85})
r.zrevrange('leaderboard', 0, -1, withscores=True)  # top users
```

## Interview Questions

> _Q: What is Redis and why is it fast?_

Redis is an in-memory data store — all data lives in RAM, so reads and writes are typically under 1ms. It's used primarily as a cache to reduce database load, but also supports pub/sub messaging, session storage, and rate limiting.

> _Q: What is the difference between cache-aside and write-through caching?_

Cache-aside (lazy loading) only populates the cache on a read miss — data is fetched from DB and then stored in cache. Write-through updates the cache on every write, keeping it always in sync with the DB. Cache-aside is simpler and more common; write-through ensures freshness at the cost of write latency.

> _Q: What are the main cache invalidation problems?_

Cache stampede: many requests hit the DB when a popular key expires simultaneously. Cache penetration: repeated requests for non-existent keys bypass the cache entirely. Cache avalanche: many keys expire at once, flooding the DB. Solutions include TTL jitter, negative caching, and distributed locks.

> _Q: What Redis data structure would you use for a leaderboard?_

A **Sorted Set** (ZSET). Each member has a score, and Redis keeps them sorted automatically. `ZADD` to add/update scores, `ZREVRANGE` to get top-N users. Operations are O(log N), making it efficient even for large leaderboards.

> _Q: What is the difference between Redis and Memcached?_

Both are in-memory caches, but Redis supports richer data structures (lists, sets, sorted sets, hashes), persistence (snapshots and AOF logs), pub/sub messaging, and Lua scripting. Memcached is simpler — pure key-value, multi-threaded, slightly faster for simple string caching. Redis is preferred in most modern systems.
