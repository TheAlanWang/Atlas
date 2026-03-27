---
title: "Functions"
topic: python
section: Fundamentals
order: 2
duration: 30
date: 2026-03-21
---

## What You'll Learn

- How to define functions with parameters, defaults, and return values
- How `*args` and `**kwargs` work for flexible function signatures
- What lambda functions are and when to use them
- How Python's scope rules work (local vs global)
- Why functions are first-class objects in Python

---

## Defining Functions

Use the `def` keyword to define a function:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

greet("Alan")  # "Hello, Alan!"
```

The `name: str` is a type hint for the parameter, `-> str` is the return type hint. Both are optional but good practice.

## Parameters and Arguments

Functions can take zero or more parameters:

```python
def add(a: int, b: int) -> int:
    return a + b

add(3, 5)   # 8
```

**Default parameters** — use `=` to set a fallback value:

```python
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

greet("Alan")            # "Hello, Alan!"
greet("Alan", "Hey")     # "Hey, Alan!"
```

Parameters with defaults must come after parameters without defaults.

## Return Values

A function returns `None` by default if you don't use `return`:

```python
def say_hi():
    print("hi")   # prints, but returns None

result = say_hi()
print(result)  # None
```

You can return multiple values as a tuple:

```python
def min_max(nums: list[int]) -> tuple[int, int]:
    return min(nums), max(nums)

low, high = min_max([3, 1, 4, 1, 5])
# low = 1, high = 5
```

## *args and **kwargs

`*args` collects extra positional arguments into a tuple:

```python
def total(*args: int) -> int:
    return sum(args)

total(1, 2, 3)      # 6
total(10, 20)       # 30
```

`**kwargs` collects extra keyword arguments into a dict:

```python
def display(**kwargs) -> None:
    for key, value in kwargs.items():
        print(f"{key}: {value}")

display(name="Alan", age=25)
# name: Alan
# age: 25
```

## Lambda Functions

A lambda is a short, anonymous function for simple one-liners:

```python
square = lambda x: x ** 2
square(4)   # 16

# Common use — sorting by a key
names = ["Charlie", "Alan", "Bob"]
names.sort(key=lambda name: len(name))
# ["Bob", "Alan", "Charlie"]
```

Use lambdas when the function is simple and only needed once. For anything more complex, use a regular `def`.

## Scope

Variables defined inside a function are local — they don't exist outside:

```python
def make_greeting():
    message = "Hello"   # local variable
    return message

print(message)  # NameError — message doesn't exist here
```

To read a global variable inside a function is fine. To reassign it, use `global`:

```python
count = 0

def increment():
    global count
    count += 1
```

In practice, `global` is a code smell — prefer returning values instead of mutating globals.

## Interview Questions

> _Q: What is the difference between `*args` and `**kwargs`?_

`*args` captures any number of positional arguments as a tuple. `**kwargs` captures any number of keyword arguments as a dictionary. They let you write functions that accept a variable number of inputs. You can use both together: `def f(*args, **kwargs)`.

> _Q: What does it mean that Python functions are first-class objects?_

Functions can be assigned to variables, passed as arguments, and returned from other functions — just like any other value. This is what makes patterns like callbacks, decorators, and higher-order functions (like `map`, `filter`, `sorted`) possible.

> _Q: What is the difference between a parameter and an argument?_

A parameter is the variable name in the function definition (`def greet(name)`). An argument is the actual value passed when calling the function (`greet("Alan")`). Parameters define what a function expects; arguments are what you give it.

> _Q: What is a common pitfall with mutable default parameters?_

Default parameter values are evaluated once when the function is defined, not each time it is called. If you use a mutable object (like a list) as a default, all calls share the same object, which can lead to unexpected behavior. The fix is to use `None` as the default and create the mutable object inside the function body.

> _Q: What does a function return if there is no `return` statement?_

It returns `None`. The same is true if you write `return` with no value. This is Python's implicit return, and it means you should always check whether you actually need a return value when calling a function.

> _Q: What is the difference between a lambda and a `def` function?_

A lambda is a single-expression anonymous function written in one line — useful for short, throwaway logic like sort keys. A `def` function can have a name, multiple statements, docstrings, and full logic. If a lambda is getting complex or you need it in more than one place, use `def` instead.

> _Q: What is the difference between local and global scope?_

Variables defined inside a function are local — they only exist for the duration of that call and are invisible outside. Variables defined at module level are global and accessible anywhere. To reassign a global variable from inside a function, you must declare it with `global`. In practice, mutating globals is considered a code smell; prefer returning values.
