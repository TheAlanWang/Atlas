---
title: "GIL and Concurrency"
topic: python
section: Advanced Python
order: 4
duration: 25
date: 2026-03-29
---

## In This Chapter

- What the GIL is at a practical level
- Why threads behave differently for CPU-bound and I/O-bound work
- When to use threads, processes, or `asyncio`
- Common interview oversimplifications about the GIL
- How to answer concurrency trade-off questions more clearly

---

## What Is the GIL?

The **Global Interpreter Lock** is a lock in CPython that allows only one thread to execute Python bytecode at a time within a process.

The most important qualifier is **CPython**. The GIL is usually discussed in the context of the standard Python interpreter.

## Why the GIL Matters

For CPU-bound work, multiple Python threads do not usually give true parallel execution of Python bytecode:

```python
# CPU-bound example
def compute():
    total = 0
    for i in range(10_000_000):
        total += i
```

For I/O-bound work, threads can still help because while one thread is waiting on I/O, another thread can run.

That leads to the standard interview rule:

- CPU-bound: processes are often a better fit
- I/O-bound: threads or `asyncio` are often a better fit

## Threads vs Processes vs `asyncio`

### Threads

Good for I/O-heavy workloads such as network requests or file waiting. Shared memory is convenient, but coordination is harder.

### Processes

Good for CPU-heavy workloads because separate processes can run on separate CPU cores. The trade-off is higher overhead and more expensive communication.

### `asyncio`

Good for high-concurrency I/O when tasks spend a lot of time waiting. It is not a magic speed-up for CPU-heavy work.

## Common Oversimplifications

These answers are too strong:

- "Python threads are useless" — false for I/O-bound work
- "The GIL means Python cannot do concurrency" — false
- "Use `asyncio` for everything" — also false

A better answer is always tied to workload type and trade-offs.

## Interview Framing

A strong answer sounds like this:

"In CPython, the GIL prevents multiple threads from executing Python bytecode in parallel. So for CPU-bound work I usually reach for multiprocessing, while for I/O-bound work threads or `asyncio` can still be effective."

## Key Questions

> _Q: What is the GIL in Python?_

In CPython, it is a lock that allows only one thread at a time to execute Python bytecode within a process.

> _Q: Does the GIL make threading useless?_

No. Threads are still useful for I/O-bound workloads because waiting on I/O gives other threads time to run.

> _Q: Why is multiprocessing often better for CPU-bound work?_

Because separate processes can run on separate CPU cores without competing for the same GIL.

> _Q: When would you choose `asyncio` instead of threads?_

When you have many concurrent I/O-bound tasks and want structured cooperative concurrency without the overhead of many threads.

> _Q: What is the most important caveat when discussing the GIL?_

Be explicit that you are usually talking about CPython, not every possible Python runtime.
