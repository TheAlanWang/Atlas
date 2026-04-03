---
title: "Closures"
topic: python
section: Functions & Scope
order: 3
duration: 20
date: 2026-03-25
---

## In This Chapter

- What a closure is and how Python captures variables
- How to inspect closure variables at runtime
- How `nonlocal` lets inner functions modify outer variables
- The classic loop-closure bug and how to fix it
- Real-world use cases: counters, factory functions, memoization

---

## What is a Closure?

A **closure** is an inner function that "remembers" variables from its enclosing scope, even after the outer function has returned.

```python
def outer():
    message = "hello"

    def inner():
        print(message)   # references outer's variable

    return inner

greet = outer()
greet()   # "hello" — outer() already returned, but message is still accessible
```

`inner` is a closure because it captures `message` from `outer`'s scope.

---

## The Three Requirements for a Closure

1. There must be a **nested function** (function inside a function)
2. The inner function must **reference a variable** from the outer function's scope
3. The outer function must **return the inner function**

---

## How Python Stores Captured Variables

When Python detects that a variable is referenced by an inner function, it stores it in a special **cell object** rather than a plain stack frame. This cell is shared between the outer and inner function — and it outlives the outer function's return.

You can inspect the captured variables directly:

```python
def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)

print(double.__closure__)                    # (<cell at 0x...>,)
print(double.__closure__[0].cell_contents)  # 2
```

`double.__closure__` is a tuple of cell objects. Each cell holds one captured variable.

---

## `nonlocal`: Modifying the Outer Variable

By default, you can only *read* a captured variable from inside the inner function. To *assign to it*, you need `nonlocal`:

```python
def make_counter():
    count = 0

    def counter():
        nonlocal count    # "I want to write to count in the outer scope"
        count += 1
        return count

    return counter

c = make_counter()
print(c())  # 1
print(c())  # 2
print(c())  # 3
```

Each call to `counter()` modifies the shared `count` cell. The state persists between calls because `count` lives in the closure, not on the call stack.

Without `nonlocal`, `count += 1` would raise `UnboundLocalError` — Python would treat `count` as a new local variable, which hasn't been assigned yet.

---

## Factory Functions

Closures are the foundation of **factory functions** — functions that return customized functions:

```python
def make_greeting(prefix):
    def greet(name):
        return f"{prefix}, {name}!"
    return greet

hello = make_greeting("Hello")
hey   = make_greeting("Hey")

print(hello("Alan"))  # "Hello, Alan!"
print(hey("Alan"))    # "Hey, Alan!"
```

`hello` and `hey` are two separate closures, each capturing a different `prefix`. No class needed.

---

## Classic Pitfall: Loop Closures

This is one of the most common Python gotchas:

```python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])  # [2, 2, 2] — all return 2!
```

Why? All three lambdas capture the *same* `i` variable (by reference). By the time you call them, the loop has finished and `i` is `2`.

**Fix — capture by value using a default argument:**

```python
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2]
```

Default parameter values are evaluated at the time the lambda is created, not when it is called. So each lambda captures its own copy of `i`.

---

## Closures vs Classes

A closure with `nonlocal` is often a lighter alternative to a class for simple stateful objects:

```python
# Closure version
def make_accumulator():
    total = 0
    def add(n):
        nonlocal total
        total += n
        return total
    return add

acc = make_accumulator()
acc(5)   # 5
acc(3)   # 8

# Class version — same behavior, more boilerplate
class Accumulator:
    def __init__(self):
        self.total = 0
    def add(self, n):
        self.total += n
        return self.total
```

Use closures when you need one or two pieces of state and a single operation. Use a class when the state or behavior grows more complex.

---

## Closures Power Decorators

Every decorator you write relies on closures. The `wrapper` function captures `func` from the decorator's scope:

```python
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")   # func is captured here
        return func(*args, **kwargs)
    return wrapper
```

When `log_calls(greet)` returns, `func` (which is `greet`) lives in `wrapper.__closure__`. This is why `wrapper` can still call it later.

---

## Key Questions

> _Q: What is a closure?_

A closure is an inner function that captures and retains references to variables from its enclosing scope, even after the outer function has returned. Python stores the captured variables in cell objects attached to the inner function via `__closure__`. This lets you create stateful functions without classes, and is the mechanism behind decorators and factory functions.

> _Q: What is the difference between a closure and a class?_

Both can hold state. A closure is lighter — it's just a function with captured variables. A class is more explicit and scales better when you need multiple methods or more complex state. For simple cases (a counter, a factory function), closures are more concise. For complex cases, a class is clearer.

> _Q: What does `nonlocal` do?_

`nonlocal` lets an inner function assign to a variable from an enclosing (but non-global) scope. Without it, Python treats the assignment as creating a new local variable in the inner function, which causes `UnboundLocalError` if you also try to read it before assigning. `nonlocal` tells Python: "this variable lives one scope up — use the shared cell."

> _Q: What is the classic loop-closure bug and how do you fix it?_

When you create multiple lambdas (or inner functions) inside a loop, they all capture the same loop variable by reference, not by value. After the loop, that variable holds its final value, so all functions return the same result. Fix: use a default argument (`lambda i=i: i`) to capture the current value at creation time, since default values are evaluated immediately.

> _Q: How can you inspect what a closure has captured?_

Access `func.__closure__` — it's a tuple of cell objects. Each cell's `.cell_contents` attribute holds the captured value. If a function has no closures, `__closure__` is `None`.
