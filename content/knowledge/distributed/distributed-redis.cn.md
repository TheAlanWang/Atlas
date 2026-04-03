---
title: "Redis：核心概念"
topic: distributed
section: Caching
order: 1
duration: 18
date: 2026-03-26
---

## 什么是 Redis？

**Redis**（Remote Dictionary Server）是一个内存数据存储，用作缓存、数据库和消息代理。它将数据存储在内存中，读写速度极快——通常在 1 毫秒以内。

Redis 最常见的用途是**缓存**：将频繁访问的数据存入 Redis，避免每次都查数据库。

## 为什么要用缓存？

没有缓存：
```
用户请求 → 应用服务器 → 数据库（慢）→ 响应
```

有了 Redis：
```
用户请求 → 应用服务器 → Redis（快速命中）→ 响应
                      → 数据库（仅缓存未命中时）
```

好处：
- **速度** — 内存访问比磁盘快约 100 倍
- **减轻数据库压力** — 大幅减少数据库查询次数
- **可扩展性** — 用同样的基础设施处理更多请求

## 核心数据结构

Redis 不只是键值存储——它支持丰富的数据类型：

| 类型 | 适用场景 | 示例 |
|------|---------|------|
| **String** | 简单缓存、计数器 | `SET user:1:name "Alan"` |
| **Hash** | 对象存储 | `HSET user:1 name "Alan" age 25` |
| **List** | 队列、动态消息流 | `LPUSH notifications "msg1"` |
| **Set** | 唯一元素、标签 | `SADD online-users "user:1"` |
| **Sorted Set** | 排行榜、排名 | `ZADD leaderboard 100 "user:1"` |
| **TTL** | 任意带过期时间的 key | `EXPIRE user:1:session 3600` |

## 缓存策略

### Cache-Aside（旁路缓存 / 懒加载）
最常见的模式。应用先查缓存，未命中时从数据库取数据并写入缓存。

```python
def get_user(user_id):
    # 1. 查缓存
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)

    # 2. 缓存未命中 — 查数据库
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)

    # 3. 写入缓存并设置过期时间
    redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    return user
```

### Write-Through（写穿）
每次写数据库时同步更新缓存。缓存始终是最新的，但每次写操作都要同时写两处。

### Write-Behind（写回）
先写缓存，再异步写数据库。写入更快，但如果缓存崩溃可能丢失数据。

## 缓存失效

缓存最难的问题：何时清除过期数据。

- **TTL（生存时间）**：key 在 N 秒后自动过期
- **主动删除**：数据库记录更新时，直接删除对应缓存 key
- **LRU 淘汰**：内存满时，Redis 自动淘汰最近最少使用的 key

## 常见问题

### 缓存击穿（Cache Stampede）
热点 key 过期 → 大量请求同时打到数据库 → 数据库过载。

**解决**：使用分布式锁，或提前随机刷新即将过期的 key。

### 缓存穿透（Cache Penetration）
查询缓存和数据库中都不存在的 key（如非法 ID）——每次请求都直接打到数据库。

**解决**：缓存空结果（`SET user:99999 "null" EX 60`）。

### 缓存雪崩（Cache Avalanche）
大量 key 同时过期 → 数据库请求量突然暴增。

**解决**：TTL 加随机抖动，避免集中过期。

## 基本用法（Python）

```python
import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

# String
r.set('key', 'value', ex=3600)    # 1小时后过期
r.get('key')                       # b'value'

# Hash
r.hset('user:1', mapping={'name': 'Alan', 'age': '25'})
r.hgetall('user:1')                # {b'name': b'Alan', b'age': b'25'}

# Sorted Set（排行榜）
r.zadd('leaderboard', {'user:1': 100, 'user:2': 85})
r.zrevrange('leaderboard', 0, -1, withscores=True)  # 按分数从高到低
```

## 关键问题

> _Q: 什么是 Redis？为什么它快？_

Redis 是内存数据存储——所有数据存在 RAM 里，读写通常在 1ms 以内。主要用作缓存来减轻数据库压力，同时也支持发布/订阅、Session 存储和限流等场景。

> _Q: Cache-Aside 和 Write-Through 有什么区别？_

Cache-Aside（懒加载）只在读取未命中时填充缓存——先从数据库取，再写入缓存。Write-Through 每次写操作都同步更新缓存，保持缓存与数据库始终一致。Cache-Aside 更简单常见，Write-Through 数据更新及时但写延迟更高。

> _Q: 缓存的三大经典问题是什么？_

缓存击穿：热点 key 过期瞬间大量请求同时打到数据库。缓存穿透：持续查询不存在的 key，绕过缓存直接查库。缓存雪崩：大量 key 同时过期，数据库瞬间承受大量请求。解决方案分别是：分布式锁/提前续期、缓存空结果、TTL 加随机抖动。

> _Q: 排行榜应该用 Redis 的哪种数据结构？_

**有序集合（Sorted Set / ZSET）**。每个成员有一个分数，Redis 自动保持排序。用 `ZADD` 添加/更新分数，用 `ZREVRANGE` 获取前 N 名。操作复杂度为 O(log N)，即使数据量大也很高效。

> _Q: Redis 和 Memcached 的区别是什么？_

两者都是内存缓存，但 Redis 支持更丰富的数据结构（列表、集合、有序集合、哈希）、持久化（快照和 AOF 日志）、发布/订阅和 Lua 脚本。Memcached 更简单——纯键值存储、多线程，简单字符串缓存场景下稍快。现代系统大多选 Redis。
