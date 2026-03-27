---
title: "Generators"
topic: python
section: Advanced
order: 3
duration: 25
date: 2026-03-25
---

## What You'll Learn

- What a generator is and why it saves memory
- How `yield` pauses and resumes a function
- Generator expressions as a lighter syntax
- `yield from` for composing generators
- The iterator protocol and how generators implement it
- Real-world use cases: streaming data, infinite sequences, pipelines

---

## The Problem: Memory

Imagine processing a file with one million lines:

```python
def read_all(filename):
    with open(filename) as f:
        return f.readlines()   # loads everything into memory at once

for line in read_all("big.txt"):
    process(line)
```

`readlines()` loads the entire file into a list before you process a single line. For large files, this can exhaust memory.

Generators solve this with **lazy evaluation** — produce values one at a time, only when needed.

---

## `yield`: Pausing a Function

Adding `yield` to a function turns it into a **generator function**. Calling it returns a **generator object** — it doesn't execute the body yet.

```python
def count_up(n):
    for i in range(n):
        yield i       # pause here, hand i to the caller

gen = count_up(3)    # no code runs yet
print(next(gen))     # 0  — runs until first yield
print(next(gen))     # 1  — resumes from where it paused
print(next(gen))     # 2
print(next(gen))     # StopIteration — no more values
```

Each call to `next()` resumes from exactly where the last `yield` paused. Local variables and execution position are preserved between calls.

---

## Using Generators in a `for` Loop

A `for` loop calls `next()` for you automatically and stops at `StopIteration`:

```python
for value in count_up(5):
    print(value)
# 0 1 2 3 4
```

This is the most common way to use a generator — you rarely call `next()` manually.

---

## Generator vs List: Memory Comparison

```python
# List: computes all values immediately, stores them all in memory
squares_list = [x * x for x in range(10_000_000)]

# Generator: computes one value at a time, uses almost no memory
squares_gen = (x * x for x in range(10_000_000))
```

For `squares_list`, Python allocates roughly 80 MB for 10 million integers. `squares_gen` uses a few hundred bytes regardless of how large the range is.

When you just need to iterate once (e.g., to sum), use a generator:

```python
total = sum(x * x for x in range(10_000_000))   # memory-efficient
```

---

## Generator Expressions

The parenthesis syntax `(expr for var in iterable)` creates a generator expression — equivalent to a generator function but more compact:

```python
evens = (x for x in range(20) if x % 2 == 0)

for n in evens:
    print(n)   # 0 2 4 6 8 ...
```

Use a generator expression when the logic fits in one line. Use a full generator function when you need multiple `yield` statements or more complex logic.

---

## Infinite Sequences

Because generators are lazy, they can produce infinite sequences safely:

```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
print([next(fib) for _ in range(8)])  # [0, 1, 1, 2, 3, 5, 8, 13]
```

A list version would never finish. The generator only computes the next number when you ask for it.

---

## `yield from`: Delegating to Another Generator

`yield from` lets a generator delegate iteration to another iterable, forwarding each value to the caller:

```python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)   # delegate recursively
        else:
            yield item

print(list(flatten([1, [2, [3, 4]], 5])))  # [1, 2, 3, 4, 5]
```

Without `yield from`, you'd need an explicit inner `for` loop. `yield from` also properly handles `StopIteration` and return values from sub-generators.

---

## How Generators Work Under the Hood

A generator function returns a **generator object** with four possible states:

| State | Meaning |
|---|---|
| `GEN_CREATED` | Created, not yet started |
| `GEN_RUNNING` | Currently executing |
| `GEN_SUSPENDED` | Paused at a `yield` |
| `GEN_CLOSED` | Finished or `.close()` called |

```python
import inspect

def my_gen():
    yield 1

g = my_gen()
print(inspect.getgeneratorstate(g))  # GEN_CREATED

next(g)
print(inspect.getgeneratorstate(g))  # GEN_SUSPENDED

try:
    next(g)
except StopIteration:
    pass
print(inspect.getgeneratorstate(g))  # GEN_CLOSED
```

When a generator is suspended, its entire stack frame (local variables + execution position) is saved on the heap, not discarded. This is what makes resumption possible — and why generators use more memory per instance than a plain iterator, but far less memory than a list.

---

## The Iterator Protocol

Generators implement Python's **iterator protocol** automatically. Any object that implements both `__iter__` and `__next__` is an iterator:

```python
class CountUp:
    def __init__(self, n):
        self.i = 0
        self.n = n

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        val = self.i
        self.i += 1
        return val

for x in CountUp(3):
    print(x)   # 0 1 2
```

Generators are just a more convenient way to write iterators. The `yield` keyword handles all the `__next__` and `StopIteration` plumbing for you.

**Iterable vs Iterator:**

| | Iterable | Iterator |
|---|---|---|
| Must implement | `__iter__` | `__iter__` + `__next__` |
| Examples | `list`, `str`, `dict` | generator, file object |
| Can iterate multiple times | Yes | No — exhausted after one pass |

---

## Interview Questions

> _Q: What is the difference between a generator and a list?_

A list stores all its elements in memory immediately. A generator computes values lazily — only when requested by `next()` — and discards them after yielding. A generator uses almost no memory regardless of how many items it will produce, but can only be iterated once. Use generators for large or infinite sequences where you only need one pass.

> _Q: What does `yield` do?_

`yield` pauses the generator function and sends the yielded value to the caller. The function's local state (variables and execution position) is preserved in a saved stack frame. The next call to `next()` resumes from right after the `yield`. When the function returns (or falls off the end), `StopIteration` is raised.

> _Q: What is the difference between `return` and `yield`?_

`return` terminates the function and discards all local state. `yield` pauses the function and saves its state, allowing it to be resumed. A function with at least one `yield` is a generator function — even if the `yield` is never reached at runtime.

> _Q: What is `yield from` for?_

`yield from iterable` delegates iteration to another iterable, forwarding each value to the caller. It's equivalent to `for item in iterable: yield item`, but also properly handles `StopIteration`, `throw()`, `send()`, and `close()` on sub-generators. It's the idiomatic way to compose or chain generators.

> _Q: When would you choose a generator over a list comprehension?_

When the sequence is large (memory matters), when you only need one pass, or when the sequence is infinite or computed on-demand (e.g., reading lines from a file, streaming API results). If you need random access, multiple passes, or to know the length, use a list.

> _Q: What is the iterator protocol?_

Any object that implements `__iter__()` (returns itself) and `__next__()` (returns the next value or raises `StopIteration`) is an iterator. A `for` loop calls `iter(obj)` to get an iterator, then calls `next()` repeatedly until `StopIteration`. Generators implement this protocol automatically.
