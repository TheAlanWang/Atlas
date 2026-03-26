---
title: "Decorators"
topic: python
section: Advanced
order: 1
duration: 25
date: 2026-03-25
---

## What You'll Learn

- What a decorator is and how it works under the hood
- How to write decorators that handle any function signature
- How `functools.wraps` preserves the original function's identity
- How to write decorators that accept their own arguments
- Real-world use cases: timing, logging, retry

---

## What is a Decorator?

A **decorator** is a function that takes another function and returns a new (enhanced) version of it.

The `@deco` syntax is just shorthand — it means **"pass this function through `deco` and rebind it to the same name"**:

```python
@deco
def hello():
    print("hello")

# Exactly equivalent to:
def hello():
    print("hello")
hello = deco(hello)
```

This works because in Python, functions are objects — you can pass them around, assign them to variables, and return them from other functions.

---

## A Basic Decorator

```python
def deco(func):
    def wrapper():
        print("before")
        func()
        print("after")
    return wrapper

@deco
def hello():
    print("hello")

hello()
# before
# hello
# after
```

The outer function `deco` receives `func`. The inner function `wrapper` wraps it with extra behavior. `deco` returns `wrapper`, which replaces the original `hello`.

---

## Handling Any Function: `*args` and `**kwargs`

The basic wrapper above only works for functions with no arguments. To make a decorator that works universally, use `*args` and `**kwargs` to forward any arguments to the original function:

```python
def deco(func):
    def wrapper(*args, **kwargs):
        print("before")
        result = func(*args, **kwargs)
        print("after")
        return result
    return wrapper

@deco
def add(a, b):
    return a + b

add(3, 5)  # 8
```

This is the standard pattern for any general-purpose decorator.

---

## Preserving Identity: `@functools.wraps`

After wrapping, the function's name and docstring change to `wrapper`:

```python
print(hello.__name__)  # "wrapper" — undesirable
```

Fix this with `@functools.wraps(func)`:

```python
import functools

def deco(func):
    @functools.wraps(func)   # copies __name__, __doc__, etc. from func
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@deco
def hello():
    """Says hello."""
    print("hello")

print(hello.__name__)  # "hello"
print(hello.__doc__)   # "Says hello."
```

Always use `@functools.wraps` in production decorators. It preserves `__name__`, `__doc__`, `__annotations__`, and adds `__wrapped__` pointing to the original function.

---

## Real Example: Timing Decorator

```python
import time
import functools

def timing(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            elapsed = (time.perf_counter() - start) * 1000
            print(f"[{func.__name__}] {elapsed:.3f} ms")
    return wrapper

@timing
def slow_add(a, b):
    time.sleep(0.1)
    return a + b

slow_add(1, 2)  # [slow_add] 100.312 ms
```

`time.perf_counter()` is more precise than `time.time()` for short intervals. The `try/finally` ensures the timing is printed even if the function raises an exception.

---

## Decorators with Arguments

Sometimes you want to configure a decorator: `@repeat(3)`. This requires one more layer of nesting — the outermost function receives the configuration, returns the actual decorator:

```python
import functools

def repeat(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hi(name):
    print(f"Hi, {name}!")

say_hi("Alan")
# Hi, Alan!
# Hi, Alan!
# Hi, Alan!
```

`@repeat(3)` evaluates `repeat(3)` first (returning `decorator`), then applies `decorator` to `say_hi`.

---

## How It Works Under the Hood: Closures

When `deco` returns `wrapper`, how does `wrapper` still have access to `func` even after `deco` has returned?

The answer is **closures**. When an inner function references a variable from its enclosing scope, Python captures that variable and keeps it alive alongside the inner function. You can inspect it:

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

decorated = my_decorator(print)
print(decorated.__closure__)                    # (<cell at 0x...>,)
print(decorated.__closure__[0].cell_contents)  # <built-in function print>
```

The captured `func` lives in `wrapper.__closure__` — not on the call stack, but on the heap. This is why the decorator pattern works.

---

## Interview Questions

> _Q: What is a decorator in Python?_

A decorator is a callable that takes a function and returns a new function — usually a `wrapper` that adds behavior before and/or after the original. The `@decorator` syntax is shorthand for `func = decorator(func)`. Decorators are a clean way to implement cross-cutting concerns like logging, timing, authentication, and caching without modifying the original function.

> _Q: Why use `@functools.wraps` inside a decorator?_

Without it, the wrapped function loses its identity — `__name__` becomes `"wrapper"`, `__doc__` is gone, and introspection tools like `help()` and `inspect` show the wrong information. `@functools.wraps(func)` copies the original function's metadata onto `wrapper` and adds `__wrapped__` pointing to the original, making the decorator transparent to callers.

> _Q: How does a decorator "remember" the original function after it has returned?_

Through a **closure**. When `wrapper` is defined inside `decorator(func)`, it captures `func` from the enclosing scope. Python keeps this captured variable alive in `wrapper.__closure__`, even after `decorator` has returned. So every call to `wrapper` can still access the original `func`.

> _Q: What is the difference between `@deco` and `@deco(arg)`?_

`@deco` applies `deco` directly as a decorator — `func = deco(func)`. `@deco(arg)` first *calls* `deco(arg)` to produce a decorator, then applies that decorator — `func = deco(arg)(func)`. The latter requires an extra layer of nesting in the implementation.

> _Q: How would you implement a retry decorator?_

```python
import functools, time

def retry(times=3, delay=0.5):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == times:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(times=3, delay=1.0)
def flaky_request():
    ...
```
