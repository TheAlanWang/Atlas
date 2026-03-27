---
title: "Python Interview Basics"
topic: python
section: Interview
order: 10
duration: 45
date: 2026-03-24
---

## List vs Tuple

Both store ordered sequences, but they differ in mutability:

| | `list` | `tuple` |
|---|--------|---------|
| Mutable | ✅ | ❌ |
| Syntax | `[1, 2, 3]` | `(1, 2, 3)` |
| Use case | Data that changes | Fixed data, dict keys |

```python
lst = [1, 2, 3]
lst[0] = 99      # fine

tup = (1, 2, 3)
tup[0] = 99      # TypeError: tuple is immutable
```

Tuples are also slightly faster and use less memory than lists.

## Mutable vs Immutable Objects

Python objects are either **mutable** or **immutable**.

| Immutable | Mutable |
|-----------|---------|
| `int`, `float`, `str`, `tuple` | `list`, `dict`, `set` |

```python
a = [1, 2, 3]
b = a           # b and a point to the same object
b.append(4)
print(a)        # [1, 2, 3, 4] — a changed too!
```

> When an immutable object is "modified", Python creates a new object — the original stays unchanged.

## Decorator

A decorator is a function that wraps another function to add behavior without modifying it:

```python
def log(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Done")
        return result
    return wrapper

@log
def greet(name):
    print(f"Hello, {name}!")

greet("Alan")
# Calling greet
# Hello, Alan!
# Done
```

`@log` is syntactic sugar for `greet = log(greet)`. Decorators are widely used for logging, authentication, caching, and timing.

## Generator

A generator produces values one at a time using `yield`, instead of building a full list in memory:

```python
def count_up(n):
    for i in range(n):
        yield i   # pauses here, resumes on next call

gen = count_up(3)
next(gen)   # 0
next(gen)   # 1
next(gen)   # 2
```

Generators are memory-efficient for large datasets — they compute values on demand instead of storing them all at once.

Generator expression (like list comprehension, but lazy):

```python
squares = (x**2 for x in range(1000000))  # uses almost no memory
```

## `with` Statement

The `with` statement manages resources automatically — it guarantees cleanup runs even if an exception occurs:

```python
with open("file.txt", "r") as f:
    content = f.read()
# file is automatically closed here, even if an error occurred
```

`with` works with any object that implements `__enter__` and `__exit__` (the context manager protocol). You can write your own:

```python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self

    def __exit__(self, *args):
        print(f"Elapsed: {time.time() - self.start:.2f}s")

with Timer():
    do_something()
```

## `*args` and `**kwargs`

```python
def func(*args, **kwargs):
    print(args)    # tuple: positional arguments
    print(kwargs)  # dict: keyword arguments

func(1, 2, name="Alan")
# (1, 2)
# {'name': 'Alan'}
```

## Lambda

A lambda is a short anonymous function limited to a single expression:

```python
square = lambda x: x ** 2
square(4)   # 16

# Common use — sort by a key
people = [{"name": "Alan", "age": 25}, {"name": "Bob", "age": 22}]
people.sort(key=lambda p: p["age"])
```

## `map`, `filter`, and `reduce`

```python
nums = [1, 2, 3, 4, 5]

# map — apply a function to every element
list(map(lambda x: x ** 2, nums))      # [1, 4, 9, 16, 25]

# filter — keep elements where function returns True
list(filter(lambda x: x % 2 == 0, nums))  # [2, 4]

# reduce — fold list into a single value
from functools import reduce
reduce(lambda x, y: x + y, nums)       # 15
```

In modern Python, list comprehensions are often preferred over `map` and `filter` for readability.

## List Comprehension

```python
# Recommended
squares = [x**2 for x in range(10) if x % 2 == 0]

# Equivalent for loop
squares = []
for x in range(10):
    if x % 2 == 0:
        squares.append(x**2)
```

## `is` vs `==`

```python
a = [1, 2]
b = [1, 2]
print(a == b)   # True  — same value
print(a is b)   # False — different objects
```

- `==` compares **value**
- `is` compares **identity** (same object in memory)

## `__slots__`

By default, Python stores instance attributes in a `__dict__` (a dictionary) per object, which is flexible but uses extra memory. `__slots__` replaces this with a fixed set of attributes:

```python
class Point:
    __slots__ = ["x", "y"]   # only x and y are allowed

    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
p.z = 3   # AttributeError — z not in __slots__
```

Use `__slots__` when you're creating many instances of a class and memory is a concern. It can reduce memory usage by 40–50% for large numbers of objects.

---

## Interview Questions

> _Q: What is the difference between a list and a tuple?_

Both are ordered sequences, but lists are mutable (can be changed after creation) and tuples are immutable (cannot). Tuples are slightly faster and can be used as dictionary keys; lists cannot. Use a tuple when the data should not change.

> _Q: Is Python pass-by-value or pass-by-reference?_

Neither — it's **pass-by-object-reference**. Mutable objects can be modified inside a function and affect the caller; immutable objects cannot.

```python
def modify(lst, num):
    lst.append(99)   # affects the caller
    num += 1         # does not affect the caller

a = [1, 2]
b = 10
modify(a, b)
print(a)  # [1, 2, 99]
print(b)  # 10
```

> _Q: What is a decorator and what is it used for?_

A decorator is a function that takes another function as input and returns a new function with added behavior. `@decorator` is syntactic sugar for `func = decorator(func)`. Common uses include logging, authentication checks, rate limiting, and caching (`@functools.lru_cache`).

> _Q: What is a generator and how is it different from a list?_

A generator produces values lazily using `yield` — it computes one value at a time on demand. A list stores all values in memory at once. Generators are memory-efficient for large datasets and infinite sequences. You can't index into a generator or iterate over it more than once.

> _Q: How does the `with` statement work?_

`with` calls `__enter__` on the context manager when entering the block and `__exit__` when leaving — even if an exception occurs. It guarantees resource cleanup (closing files, releasing locks) without needing explicit try/finally blocks.

> _Q: What is the GIL?_

The Global Interpreter Lock ensures only one thread executes Python bytecode at a time. This means Python threads cannot run CPU-bound tasks in true parallel, but I/O-bound tasks (network requests, file I/O) are unaffected. For CPU-bound parallelism, use `multiprocessing` instead.

> _Q: What is the difference between `__init__` and `__new__`?_

`__new__` creates the object (allocates memory) and returns the instance. `__init__` initializes it (sets attributes) and returns nothing. You almost always only override `__init__`. `__new__` is used for singletons or when subclassing immutable types.

> _Q: What is a lambda function? When would you use one over `def`?_

A lambda is an anonymous single-expression function. Use it for short, throwaway logic — most commonly as a sort key or argument to `map`/`filter`. Use `def` when the function has a name, multiple statements, or is reused in multiple places.

> _Q: What is the difference between `map`, `filter`, and `reduce`?_

`map` applies a function to every element and returns the transformed results. `filter` keeps only the elements for which the function returns `True`. `reduce` (from `functools`) folds a list into a single value by applying a function cumulatively. In modern Python, list comprehensions are often cleaner than `map` and `filter`.

> _Q: What is `__slots__` and when would you use it?_

`__slots__` replaces the per-instance `__dict__` with a fixed set of attributes, reducing memory usage by 40–50% for classes with many instances. Use it when you're creating a large number of objects and know exactly which attributes each instance will have. The trade-off is that you can't add new attributes dynamically.

> _Q: What is list comprehension and when should you prefer it over a for loop?_

List comprehension is a concise syntax for building a list from an iterable: `[expr for item in iterable if condition]`. Prefer it when the logic is simple and fits on one line. Use a regular for loop when the logic is complex or has side effects.

> _Q: When should you use `is` vs `==`?_

Use `is` only to check identity — specifically `if x is None` and `if x is not None`. Use `==` for all value comparisons. Never use `is` to compare strings or numbers — CPython caches small integers and interned strings, so `is` may return `True` by coincidence, but this is an implementation detail and not guaranteed.
