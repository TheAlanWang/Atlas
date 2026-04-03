---
title: "Magic Methods"
topic: python
section: OOP
order: 3
duration: 25
date: 2026-03-29
---

## In This Chapter

- What magic methods are and why Python uses them
- The difference between `__repr__` and `__str__`
- How methods like `__len__`, `__eq__`, and `__iter__` change object behavior
- Why magic methods let custom classes participate in Python protocols
- Common interview mistakes around dunder methods

---

## What Are Magic Methods?

Magic methods, also called **dunder methods**, are methods with names like `__init__`, `__repr__`, or `__len__`.

Python calls them automatically in specific situations:

```python
class Box:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

box = Box([1, 2, 3])
len(box)   # 3
```

You do not call `box.__len__()` directly in normal code. Python calls it when `len(box)` runs.

## `__repr__` vs `__str__`

These are two of the most commonly asked interview methods:

```python
class User:
    def __init__(self, name: str):
        self.name = name

    def __repr__(self) -> str:
        return f"User(name={self.name!r})"

    def __str__(self) -> str:
        return self.name
```

- `__repr__` is for developers
- `__str__` is for human-friendly display

If `__str__` is missing, Python falls back to `__repr__`.

## Comparison Methods

Methods like `__eq__` and `__lt__` define how objects compare:

```python
class Point:
    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Point):
            return NotImplemented
        return self.x == other.x and self.y == other.y
```

Returning `NotImplemented` for unsupported types is the right protocol behavior.

## Container and Iteration Methods

Python also uses magic methods for container behavior:

- `__len__` for `len(obj)`
- `__contains__` for `x in obj`
- `__iter__` for `for x in obj`
- `__getitem__` for `obj[key]`

That is why custom classes can feel like built-in types when designed well.

## Protocol Thinking

The most useful interview idea is this: magic methods let your class participate in Python's protocols.

If your object implements `__iter__`, it behaves like an iterable. If it implements `__enter__` and `__exit__`, it behaves like a context manager.

This is more important than memorizing a long list of dunder names.

## Key Questions

> _Q: What are magic methods in Python?_

They are special methods with double underscores that Python calls automatically to support language features like printing, comparison, iteration, and arithmetic.

> _Q: What is the difference between `__repr__` and `__str__`?_

`__repr__` is for developers and should ideally be unambiguous. `__str__` is for human-friendly display.

> _Q: Why does `len(obj)` work on custom classes?_

Because Python checks whether the class defines `__len__` and, if so, calls it.

> _Q: Why should `__eq__` sometimes return `NotImplemented`?_

Because that tells Python the comparison is unsupported for that type pair, which is better than making incorrect assumptions.

> _Q: What is the bigger idea behind magic methods?_

They let your class participate in Python protocols, so custom objects can behave like built-in objects when appropriate.
