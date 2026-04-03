---
title: "Inheritance"
topic: python
section: OOP
order: 2
duration: 25
date: 2026-03-29
---

## In This Chapter

- How subclassing works in Python
- What method overriding means
- How and when to use `super()`
- What MRO is at a high level
- When inheritance is the wrong abstraction

---

## Basic Inheritance

Inheritance lets a subclass reuse behavior from a parent class:

```python
class Animal:
    def speak(self) -> str:
        return "some sound"

class Dog(Animal):
    def speak(self) -> str:
        return "woof"
```

`Dog` inherits from `Animal`, but it can also override behavior.

## Method Overriding

When a subclass defines a method with the same name as one in the parent class, the subclass version wins:

```python
class Animal:
    def move(self) -> str:
        return "moving"

class Bird(Animal):
    def move(self) -> str:
        return "flying"
```

This is called **method overriding**.

## `super()`

Use `super()` when you want to extend parent behavior instead of rewriting it from scratch:

```python
class Employee:
    def __init__(self, name: str):
        self.name = name

class Manager(Employee):
    def __init__(self, name: str, team_size: int):
        super().__init__(name)
        self.team_size = team_size
```

`super()` is especially common in constructors and cooperative multiple inheritance.

## MRO at a High Level

MRO stands for **method resolution order**. It is the order Python uses to search parent classes when looking up attributes or methods.

```python
class A:
    ...

class B(A):
    ...

class C(A):
    ...

class D(B, C):
    ...
```

In multiple inheritance, MRO matters because Python needs a predictable order for lookup.

You do not need to memorize the full algorithm for most interviews, but you should know that:

- Python uses a deterministic MRO
- `super()` follows that order
- multiple inheritance should be used carefully

## When Inheritance Is a Bad Fit

Inheritance is not just a code reuse tool. It works best when there is a true `is-a` relationship.

Bad inheritance often causes:

- brittle class hierarchies
- awkward parent classes with too much responsibility
- subclasses that inherit methods they do not really want

If one object merely uses another object, composition is often the better design.

## Key Questions

> _Q: What is the difference between inheritance and composition?_

Inheritance models an `is-a` relationship. Composition models a `has-a` relationship. Composition is often more flexible because it avoids rigid class hierarchies.

> _Q: What does method overriding mean?_

It means a subclass provides its own implementation of a method that already exists on the parent class.

> _Q: Why use `super()`?_

Use `super()` to call parent behavior without hardcoding the parent class name. It is cleaner, more maintainable, and important for cooperative inheritance.

> _Q: What is MRO in Python?_

MRO is the method resolution order: the order Python uses to search classes for attributes and methods, especially in multiple inheritance.

> _Q: Is inheritance mainly for code reuse?_

Code reuse is a side effect, not the main design test. The stronger question is whether the subclass truly represents a specialized form of the parent.
