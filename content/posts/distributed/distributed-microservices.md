---
title: "Microservices vs Monolith"
topic: distributed
section: Architecture
order: 1
duration: 15
date: 2026-03-26
---

## What is a Monolith?

A **monolith** is a single deployable unit where all functionality lives in one codebase — user management, payments, orders, notifications all bundled together.

```
┌─────────────────────────────────┐
│           Monolith              │
│  Users │ Orders │ Payments │ …  │
│         Single Database         │
└─────────────────────────────────┘
```

Simple to develop early on, but becomes painful as the codebase grows.

## What are Microservices?

**Microservices** split the application into small, independent services — each with its own codebase, database, and deployment pipeline.

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Users   │  │  Orders  │  │ Payments │
│ Service  │  │ Service  │  │ Service  │
│  DB      │  │  DB      │  │  DB      │
└──────────┘  └──────────┘  └──────────┘
      ↕              ↕             ↕
           API / Message Queue
```

Each service:
- Owns its own data
- Deploys independently
- Communicates via APIs or message queues
- Can be written in different languages

## Monolith vs Microservices

| | Monolith | Microservices |
|--|---------|---------------|
| **Deployment** | One unit | Independent per service |
| **Scaling** | Scale everything | Scale only what needs it |
| **Development** | Simple early on | Complex but parallelizable |
| **Failure** | One bug can crash all | Failures are isolated |
| **Data** | Shared database | Each service owns its DB |
| **Latency** | Low (in-process calls) | Higher (network calls) |
| **Suitable for** | Small teams, early stage | Large teams, high scale |

## When to Use Each

**Start with a monolith when:**
- Team is small (< 10 engineers)
- Product is still finding product-market fit
- You don't know your service boundaries yet

**Move to microservices when:**
- Different parts of the system need to scale differently
- Multiple teams need to deploy independently
- A single service is becoming a bottleneck

> "Don't start with microservices. Start with a monolith, then extract services when you feel the pain." — Martin Fowler

## Common Microservices Patterns

### API Gateway
A single entry point for all client requests. Routes requests to the appropriate service, handles auth, rate limiting, and logging.

```
Client → API Gateway → Users Service
                     → Orders Service
                     → Payments Service
```

### Service Discovery
Services register themselves in a registry (e.g., Consul, Kubernetes DNS). Others look up the address dynamically instead of hardcoding IPs.

### Circuit Breaker
If a downstream service keeps failing, stop calling it temporarily to prevent cascading failures.

```
Normal:   A → B (success)
Failing:  A → B (fail) → A → B (fail) → circuit opens
Open:     A → fallback (no calls to B for 30s)
Half-open: try B again → if ok, close circuit
```

## Interview Questions

> _Q: What is the main difference between a monolith and microservices?_

A monolith is a single deployable unit with a shared codebase and database. Microservices split the application into independent services, each with its own codebase, database, and deployment lifecycle. Microservices enable independent scaling and deployment but introduce network complexity and distributed systems challenges.

> _Q: What are the downsides of microservices?_

Microservices introduce operational complexity: distributed tracing, network latency between services, data consistency across databases, service discovery, and the need for more sophisticated deployment infrastructure. They also make local development harder and increase the surface area for failures.

> _Q: What is an API Gateway and why is it useful?_

An API Gateway is a single entry point that sits in front of all microservices. It handles cross-cutting concerns like authentication, rate limiting, request routing, and logging — so individual services don't need to implement these themselves. It also simplifies the client interface, exposing one endpoint instead of dozens.

> _Q: What is a circuit breaker pattern?_

A circuit breaker monitors calls to a downstream service. If failures exceed a threshold, it "opens" the circuit — stopping calls to the failing service for a period and returning a fallback response. This prevents cascading failures where one slow service causes all upstream services to pile up and fail too.
