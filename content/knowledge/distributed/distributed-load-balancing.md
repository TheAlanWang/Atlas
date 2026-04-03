---
title: "Load Balancing"
topic: distributed
section: Architecture
order: 2
duration: 12
date: 2026-03-26
---

## What is Load Balancing?

A **load balancer** distributes incoming requests across multiple servers to prevent any single server from being overwhelmed.

```
                    ┌─ Server A
Client → Load Balancer ─┼─ Server B
                    └─ Server C
```

Without load balancing, all traffic hits one server — adding more servers doesn't help.

## Load Balancing Algorithms

### Round Robin
Distribute requests in order: A → B → C → A → B → C…

Simple and even, but doesn't account for server load or request complexity.

### Least Connections
Route to the server with the fewest active connections.

Better for requests with variable processing time (some requests take 1ms, others 500ms).

### IP Hashing
Hash the client's IP address to always route them to the same server.

Useful for session affinity — the same user always hits the same server.

### Weighted Round Robin
Assign weights to servers. A server with weight 3 gets 3x more requests than one with weight 1.

Useful when servers have different capacities.

## Layer 4 vs Layer 7 Load Balancing

| | L4 (Transport) | L7 (Application) |
|--|----------------|-----------------|
| **Works at** | TCP/UDP level | HTTP level |
| **Routing based on** | IP + port | URL, headers, cookies |
| **Speed** | Faster | Slower |
| **Smart routing** | No | Yes |
| **Example** | AWS NLB | AWS ALB, Nginx |

**L4**: blindly forwards packets — fast but dumb.

**L7**: reads the request — can route `/api/*` to one cluster and `/static/*` to another, or route based on `Authorization` headers.

## Health Checks

Load balancers continuously ping servers to check they're alive. If a server fails the health check, it's removed from the pool.

```
Load Balancer → GET /health → Server A (200 OK) ✓
             → GET /health → Server B (timeout) ✗ removed
             → GET /health → Server C (200 OK) ✓
```

## Sticky Sessions

Some apps store session state on the server. If a user hits a different server each time, they lose their session.

**Sticky sessions** (session affinity) ensure the same user always routes to the same server.

Better solution: store sessions externally in Redis so any server can handle any user.

## High Availability with Load Balancers

The load balancer itself can be a single point of failure. Solutions:
- **Active-passive**: one load balancer is active, another is standby
- **Active-active**: multiple load balancers share traffic (DNS round-robin)
- **Managed services**: AWS ALB, GCP Load Balancer handle HA for you

## Key Questions

> _Q: What is a load balancer and why do we need one?_

A load balancer distributes incoming traffic across multiple servers to prevent overload, improve availability, and enable horizontal scaling. Without it, adding more servers provides no benefit — all traffic still hits one machine. It also improves fault tolerance: if one server goes down, the load balancer stops routing to it.

> _Q: What is the difference between L4 and L7 load balancing?_

L4 load balancing operates at the transport layer — it forwards TCP/UDP packets based on IP and port without inspecting the content. L7 load balancing operates at the application layer — it can inspect HTTP headers, URLs, and cookies to make smarter routing decisions, like routing API traffic to one cluster and static assets to another.

> _Q: What are sticky sessions and when are they problematic?_

Sticky sessions route a user to the same server on every request, typically using IP hashing or a session cookie. They're needed when session state is stored locally on the server. They're problematic because they reduce load balancing effectiveness — if one server is slow, its "sticky" users are stuck waiting. The better solution is to store session state externally (e.g., Redis).

> _Q: What is the difference between round-robin and least-connections load balancing?_

Round-robin distributes requests evenly in order, regardless of server load. Least-connections routes to the server with the fewest active connections, which is more adaptive when request processing times vary significantly. Use round-robin for uniform workloads; use least-connections when some requests are much heavier than others.
