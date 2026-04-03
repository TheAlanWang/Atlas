---
title: "GIL 与并发"
topic: python
section: Advanced Python
order: 4
duration: 25
date: 2026-03-29
---

## 本章内容

- GIL 在实践层面到底是什么
- 为什么线程在 CPU 密集和 I/O 密集任务上的表现不同
- 什么时候选线程、进程或 `asyncio`
- 关于 GIL 的常见过度简化说法
- 如何更清楚地回答并发里的 trade-off

---

## 什么是 GIL？

GIL 是 **Global Interpreter Lock**。在 CPython 里，它意味着同一个进程中的多个线程，任一时刻通常只有一个线程能执行 Python 字节码。

最关键的限定词是 **CPython**。大多数面试语境说 GIL，默认指的是标准 Python 解释器。

## 为什么 GIL 很重要

对 CPU 密集任务来说，多个 Python 线程通常不能真正并行执行 Python 字节码：

```python
def compute():
    total = 0
    for i in range(10_000_000):
        total += i
```

但对 I/O 密集任务，线程仍然很有用，因为一个线程在等待网络或磁盘时，另一个线程可以继续运行。

因此常见经验是：

- CPU 密集：通常更适合多进程
- I/O 密集：通常更适合线程或 `asyncio`

## 线程 vs 进程 vs `asyncio`

### 线程

适合网络请求、文件等待这类 I/O 密集任务。共享内存方便，但同步和竞态问题更难处理。

### 进程

适合 CPU 密集任务，因为不同进程可以跑在不同 CPU 核心上。代价是开销更高，进程间通信更贵。

### `asyncio`

适合大量并发 I/O。它不是 CPU 密集任务的通用加速器。

## 常见误区

下面这些说法都太绝对：

- “Python 线程没用” — 对 I/O 密集任务并不对
- “GIL 让 Python 无法并发” — 也不对
- “所有并发都应该上 `asyncio`” — 同样不对

更好的回答一定要结合任务类型和代价。

## 面试里的更强回答

比较稳的说法是：

“在 CPython 里，GIL 会阻止多个线程并行执行 Python 字节码。所以对 CPU 密集任务我通常优先考虑 multiprocessing；对 I/O 密集任务，线程或 `asyncio` 仍然都很有效。”

## 关键问题

> _Q：Python 里的 GIL 是什么？_

在 CPython 里，它是一个锁，使得同一进程里任一时刻通常只有一个线程能执行 Python 字节码。

> _Q：GIL 会不会让线程完全没用？_

不会。对 I/O 密集任务，线程仍然有价值，因为等待 I/O 时别的线程可以继续执行。

> _Q：为什么 CPU 密集任务常常更适合多进程？_

因为不同进程可以在不同 CPU 核心上运行，不会竞争同一个 GIL。

> _Q：什么时候会选 `asyncio` 而不是线程？_

当你有大量并发 I/O 任务，并且希望用协作式并发来降低线程数量和调度开销时。

> _Q：谈 GIL 时最重要的限定条件是什么？_

要明确自己通常说的是 CPython，而不是所有可能的 Python 运行时。
