---
title: "Variables & Types"
topic: python
section: Python Basics
order: 1
duration: 20
date: 2026-03-21
---

## In This Chapter

- How Python's dynamic typing works and how to use type hints
- The core built-in types: `str`, `int`, `float`, `bool`, `None`
- How string formatting with f-strings works
- Type conversion and what happens when it fails
- Why Python's type system is different from Java or C++

---

## Variables

In Python, names are created by assignment. You do not declare the type first:

```python
name = "Alan"
age = 25
height = 1.80
is_student = True
```

Python is **dynamically typed** — the type belongs to the value at runtime, not to the variable name. The same name can point to different types of objects at different times:

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

Use `type()` to inspect a value and `isinstance()` to check whether it behaves like the type you expect:

```python
type(42)         # <class 'int'>
type("hello")    # <class 'str'>

isinstance(42, int)      # True
isinstance(42, float)    # False
isinstance(True, int)    # True — bool is a subclass of int
```

Prefer `isinstance()` over `type()` in real code — it handles inheritance correctly.

## Type Conversion

Type conversion in Python is explicit:

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

Python supports optional type annotations. They do not enforce types at runtime, but they help editors and static analysis tools catch mistakes and make code easier to read:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

age: int = 25
scores: list[int] = [90, 85, 92]   # modern built-in generic syntax
```

In older typing style, you may also see `List[int]` imported from `typing`.

In interview code, type hints are optional. In production code, they are increasingly common because they make intent clearer and tooling stronger.

## Mutable vs Immutable

This distinction matters any time you pass values into functions or share data across multiple parts of a program:

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

## Key Questions

> _Q: What is the difference between `is` and `==`?_

`==` checks if two values are equal. `is` checks if two variables point to the exact same object in memory. For most comparisons use `==`. Use `is` only for `None` checks: `if x is None`.

> _Q: Why is `bool` a subclass of `int` in Python?_

Historically, Python added `bool` as a subclass of `int` so `True` and `False` can be used directly in arithmetic (`True + True == 2`). It also means `isinstance(True, int)` returns `True`.

> _Q: What does "dynamically typed" mean?_

The type is attached to the value, not the variable. A variable is just a name that points to an object. The same name can point to objects of different types at different times. This is in contrast to statically typed languages like Java, where the type is declared on the variable itself and cannot change.

> _Q: What are Python's falsy values?_

The falsy values in Python are: `0`, `0.0`, `""` (empty string), `[]` (empty list), `{}` (empty dict), `set()` (empty set), `None`, and `False`. Everything else is truthy. This matters any time a value is used in a boolean context, such as an `if` condition.

> _Q: What is the difference between mutable and immutable types? Why does it matter?_

Immutable types (`int`, `float`, `str`, `tuple`) cannot be changed after creation — operations on them return new objects. Mutable types (`list`, `dict`, `set`) can be modified in place. This matters when passing values to functions: mutating a mutable argument inside a function affects the caller's object, whereas reassigning an immutable one does not.

> _Q: What are type hints for in Python, and do they enforce types at runtime?_

Type hints (e.g., `name: str`, `-> int`) document the expected types for variables, parameters, and return values. They do not enforce anything at runtime — Python ignores them during execution. Their value is for static analysis tools (like mypy, Pyright) and IDEs that use them to catch type errors before the code runs.

> _Q: What is the difference between `type()` and `isinstance()`?_

`type(x)` returns the exact type of `x`. `isinstance(x, T)` returns `True` if `x` is an instance of `T` or any subclass of `T`. Prefer `isinstance()` in most cases — for example, `isinstance(True, int)` returns `True` because `bool` is a subclass of `int`, while `type(True) == int` returns `False`.
