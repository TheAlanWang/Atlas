---
title: "Functions"
topic: python
section: Functions & Scope
order: 1
duration: 30
date: 2026-03-21
---

## In This Chapter

- How to define functions with parameters, defaults, and return values
- How `*args` and `**kwargs` work for flexible signatures
- Why Python functions are first-class objects
- When lambda helps and when it hurts readability
- A classic interview pitfall: mutable default arguments

---

## Defining Functions

Use `def` to define a function:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

greet("Alan")
```

Type hints are optional, but they make the function contract easier to read.

## Parameters and Defaults

Functions can take zero or more parameters:

```python
def add(a: int, b: int) -> int:
    return a + b

add(3, 5)   # 8
```

Default parameters provide fallback values:

```python
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

greet("Alan")
greet("Alan", "Hey")
```

Parameters with defaults must come after required parameters.

Python also supports keyword-only parameters:

```python
def connect(host: str, *, timeout: int = 5, retries: int = 2) -> None:
    ...

connect("db.local", timeout=10, retries=3)
```

## Return Values

If a function does not explicitly return a value, Python returns `None`:

```python
def say_hi():
    print("hi")

result = say_hi()
print(result)  # None
```

Python can also return multiple values by packing them into a tuple:

```python
def min_max(nums: list[int]) -> tuple[int, int]:
    return min(nums), max(nums)
```

## `*args` and `**kwargs`

`*args` collects extra positional arguments into a tuple:

```python
def total(*args: int) -> int:
    return sum(args)
```

`**kwargs` collects extra keyword arguments into a dictionary:

```python
def display(**kwargs) -> None:
    for key, value in kwargs.items():
        print(f"{key}: {value}")
```

You can combine them with normal parameters:

```python
def log(event: str, *args, level: str = "INFO", **kwargs) -> None:
    ...
```

## Functions Are First-Class Objects

In Python, functions are values. You can assign them to variables, pass them to other functions, and return them from functions.

```python
def shout(text: str) -> str:
    return text.upper()

formatter = shout
formatter("hello")   # "HELLO"
```

This is why callbacks, decorators, and higher-order functions work naturally in Python.

## Lambda Functions

Lambda is a compact syntax for a tiny anonymous function:

```python
square = lambda x: x ** 2

names = ["Charlie", "Alan", "Bob"]
names.sort(key=lambda name: len(name))
```

Use lambda for short local logic. Once the function needs multiple steps or better naming, switch to `def`.

## Mutable Default Arguments

One of Python's most common interview traps looks like this:

```python
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

add_item("a")   # ["a"]
add_item("b")   # ["a", "b"]
```

The list is created once when the function is defined, not once per call.

The safer pattern is:

```python
def add_item(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```

Detailed name lookup rules, `global`, `nonlocal`, and LEGB belong in the next article.

## Key Questions

> _Q: What is the difference between `*args` and `**kwargs`?_

`*args` captures extra positional arguments as a tuple. `**kwargs` captures extra keyword arguments as a dictionary.

> _Q: What does it mean that Python functions are first-class objects?_

It means functions behave like values: they can be stored in variables, passed into other functions, and returned from them.

> _Q: What is the difference between a parameter and an argument?_

A parameter is the variable name in the function definition. An argument is the concrete value passed at call time.

> _Q: What is the mutable default argument pitfall?_

Default values are evaluated once when the function is defined. If the default is mutable, multiple calls can share the same object. Use `None` as the default and create the mutable object inside the function.

> _Q: What does a function return if there is no `return` statement?_

It returns `None`.

> _Q: What is the difference between lambda and `def`?_

Lambda is a single-expression anonymous function. `def` gives you a named function with full statements and better readability.
