---
title: "Scope and LEGB"
topic: python
section: Functions & Scope
order: 2
duration: 20
date: 2026-03-29
---

## In This Chapter

- How Python resolves names with the LEGB rule
- The difference between local, enclosing, global, and built-in scope
- When `global` and `nonlocal` are needed
- Why assignment can trigger `UnboundLocalError`
- Common scope mistakes that show up in interviews

---

## The LEGB Rule

When Python looks up a name, it searches in this order:

1. Local
2. Enclosing
3. Global
4. Built-in

That search order is usually called **LEGB**.

```python
x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        return x

    return inner()
```

Inside `inner()`, Python finds the local `x` first, so it never needs to look outward.

## Local, Enclosing, Global, Built-in

```python
len = "oops"   # shadows the built-in len

def outer():
    count = 10

    def inner():
        return count

    return inner()
```

- **Local**: names defined inside the current function
- **Enclosing**: names from an outer function
- **Global**: names defined at module level
- **Built-in**: names Python provides, like `len`, `sum`, `print`

Shadowing is legal, but it often hurts readability.

## Why Assignment Changes Scope

If Python sees assignment inside a function, it treats that name as local to that function unless told otherwise:

```python
count = 0

def bump():
    count += 1
```

This raises `UnboundLocalError` because Python decides `count` is local, but it gets read before it is assigned.

## `global`

Use `global` when you intentionally want to rebind a module-level variable:

```python
count = 0

def bump():
    global count
    count += 1
```

This works, but in production code mutating globals is usually a smell. Returning values or using objects is often cleaner.

## `nonlocal`

Use `nonlocal` when you want to rebind a variable from an enclosing function:

```python
def counter():
    n = 0

    def inc():
        nonlocal n
        n += 1
        return n

    return inc
```

Without `nonlocal`, assignment would create a new local `n` inside `inc()`.

## Interview Traps

- Shadowing built-ins like `list`, `dict`, or `len`
- Forgetting that assignment makes a name local
- Using `global` when a return value would be simpler
- Confusing closure capture with `nonlocal`

## Key Questions

> _Q: What does LEGB stand for in Python?_

It stands for Local, Enclosing, Global, and Built-in. That is the order Python uses for name lookup.

> _Q: What is the difference between `global` and `nonlocal`?_

`global` rebinds a module-level name. `nonlocal` rebinds a name from the nearest enclosing function scope.

> _Q: Why can assignment inside a function cause `UnboundLocalError`?_

Because Python treats that name as local for the whole function body once it sees an assignment. If the code reads the name before the local assignment happens, it fails.

> _Q: Are globals always bad?_

Not always, but they increase hidden coupling. For interview answers, say globals are sometimes fine for constants or module-wide state, but mutating them freely usually makes code harder to reason about.

> _Q: What is variable shadowing?_

Shadowing means reusing a name from an outer scope or from a built-in name. It is allowed, but it often makes code harder to read and debug.
