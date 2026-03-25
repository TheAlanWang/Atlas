---
title: "Variables & Types"
topic: python
section: Fundamentals
order: 1
duration: 20
date: 2026-03-21
---

## Variables

Python variables don't need type declarations. Just assign a value and go:

```python
name = "Alan"
age = 25
height = 1.80
is_student = True
```

Python is **dynamically typed** — the type is determined by the value at runtime, not by the variable name. The same variable can hold different types at different times:

```python
x = 10      # x is an int
x = "hello" # now x is a str — perfectly valid
```

## Core Types

| Type       | Example              | Notes                           |
| ---------- | -------------------- | ------------------------------- |
| `int`      | `42`, `-7`           | Whole numbers, no size limit    |
| `float`    | `3.14`, `-0.5`       | Decimal numbers                 |
| `str`      | `"hello"`, `'world'` | Text, immutable                 |
| `bool`     | `True`, `False`      | Subclass of `int` (`True == 1`) |
| `NoneType` | `None`               | Represents absence of a value   |

```python
score = 95          # int
gpa = 3.8           # float
major = "CS"        # str
graduated = False   # bool
mentor = None       # NoneType
```

## Checking Types

Use `type()` to see what type a value is, and `isinstance()` to check if it matches:

```python
type(42)         # <class 'int'>
type("hello")    # <class 'str'>

isinstance(42, int)      # True
isinstance(42, float)    # False
isinstance(True, int)    # True — bool is a subclass of int
```

Prefer `isinstance()` over `type()` in real code — it handles inheritance correctly.

## Type Conversion

Convert between types explicitly:

```python
int("42")       # 42
float("3.14")   # 3.14
str(100)        # "100"
bool(0)         # False
bool("hello")   # True
```

**Falsy values** — these all evaluate to `False` in a boolean context:

```python
bool(0)     # False
bool(0.0)   # False
bool("")    # False
bool([])    # False
bool(None)  # False
```

Everything else is truthy.

## Type Hints

Python 3.5+ supports optional type annotations. They don't enforce types at runtime, but help editors catch bugs and make code easier to read:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

age: int = 25
scores: list[int] = [90, 85, 92]
```

Type hints are especially useful in larger codebases and are increasingly expected in production Python.

## Mutable vs Immutable

This distinction matters when you pass values to functions or copy data:

| Immutable              | Mutable |
| ---------------------- | ------- |
| `int`, `float`, `bool` | `list`  |
| `str`                  | `dict`  |
| `tuple`                | `set`   |

**Immutable** — can't be changed in place. Operations return a new value:

```python
s = "hello"
s.upper()   # returns "HELLO" — s is still "hello"
s = s.upper()  # reassign to update
```

**Mutable** — can be changed in place:

```python
fruits = ["apple", "banana"]
fruits.append("cherry")  # modifies the original list
```

## Interview Questions

> **Q: What is the difference between `is` and `==`?**

`==` checks if two values are equal. `is` checks if two variables point to the exact same object in memory. For most comparisons use `==`. Use `is` only for `None` checks: `if x is None`.

> **Q: Why is `bool` a subclass of `int` in Python?**

Historically, Python added `bool` as a subclass of `int` so `True` and `False` can be used directly in arithmetic (`True + True == 2`). It also means `isinstance(True, int)` returns `True`.

> **Q: What does "dynamically typed" mean?**

The type is attached to the value, not the variable. A variable is just a name that points to an object. The same name can point to objects of different types at different times. This is in contrast to statically typed languages like Java, where the type is declared on the variable itself and cannot change.

> **Q: What are Python's falsy values?**

The falsy values in Python are: `0`, `0.0`, `""` (empty string), `[]` (empty list), `{}` (empty dict), `set()` (empty set), `None`, and `False`. Everything else is truthy. This matters any time a value is used in a boolean context, such as an `if` condition.

> **Q: What is the difference between mutable and immutable types? Why does it matter?**

Immutable types (`int`, `float`, `str`, `tuple`) cannot be changed after creation — operations on them return new objects. Mutable types (`list`, `dict`, `set`) can be modified in place. This matters when passing values to functions: mutating a mutable argument inside a function affects the caller's object, whereas reassigning an immutable one does not.

> **Q: What are type hints for in Python, and do they enforce types at runtime?**

Type hints (e.g., `name: str`, `-> int`) document the expected types for variables, parameters, and return values. They do not enforce anything at runtime — Python ignores them during execution. Their value is for static analysis tools (like mypy, Pyright) and IDEs that use them to catch type errors before the code runs.

> **Q: What is the difference between `type()` and `isinstance()`?**

`type(x)` returns the exact type of `x`. `isinstance(x, T)` returns `True` if `x` is an instance of `T` or any subclass of `T`. Prefer `isinstance()` in most cases — for example, `isinstance(True, int)` returns `True` because `bool` is a subclass of `int`, while `type(True) == int` returns `False`.
