---
title: "Context Managers"
topic: python
section: Advanced Python
order: 3
duration: 25
date: 2026-03-29
---

## In This Chapter

- What a context manager is
- Why `with` is safer than manual cleanup
- How `__enter__` and `__exit__` work
- How `contextlib.contextmanager` simplifies custom managers
- What interviewers usually mean when they ask about context managers

---

## Why Context Managers Exist

Some resources must be cleaned up no matter what happens:

- files must be closed
- locks must be released
- database transactions may need rollback

Without a context manager, cleanup is easy to forget:

```python
f = open("data.txt")
data = f.read()
f.close()
```

If an exception happens between `open()` and `close()`, cleanup may never happen.

## `with`

The `with` statement guarantees setup and teardown behavior:

```python
with open("data.txt") as f:
    data = f.read()
```

When the block exits, Python automatically closes the file.

## `__enter__` and `__exit__`

A context manager is an object that implements `__enter__` and `__exit__`:

```python
class Demo:
    def __enter__(self):
        print("enter")
        return self

    def __exit__(self, exc_type, exc, tb):
        print("exit")
```

- `__enter__` runs when the block starts
- `__exit__` runs when the block ends, even if an exception occurred

If `__exit__` returns `True`, it suppresses the exception. Most of the time you should not do that unless you mean it.

## `contextlib.contextmanager`

For simple cases, `contextlib.contextmanager` is often cleaner than writing a class:

```python
from contextlib import contextmanager

@contextmanager
def open_file(path: str):
    f = open(path)
    try:
        yield f
    finally:
        f.close()
```

This creates a context manager from a generator-like function.

## Interview Angle

The most important idea is not syntax. It is that context managers make cleanup deterministic.

If a resource must be released even when code fails, a context manager is usually the right abstraction.

## Key Questions

> _Q: What problem do context managers solve?_

They make resource setup and cleanup reliable, especially when exceptions happen.

> _Q: What methods define a context manager?_

`__enter__` and `__exit__`.

> _Q: Why is `with open(...)` preferred over manual `open()` and `close()`?_

Because `with` guarantees the file is closed even if an exception is raised inside the block.

> _Q: What does `__exit__` receive?_

It receives exception information: exception type, exception instance, and traceback. If no exception happened, those values are `None`.

> _Q: When would you use `contextlib.contextmanager`?_

When you want a lightweight custom context manager without writing a full class.
