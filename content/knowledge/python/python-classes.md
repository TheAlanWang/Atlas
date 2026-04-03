---
title: "Classes and OOP"
topic: python
section: OOP
order: 1
duration: 30
date: 2026-03-25
---

## In This Chapter

- How to define classes and create objects with `__init__`
- The difference between instance attributes and class attributes
- How methods and `self` work
- When to use `@staticmethod`, `@classmethod`, and `@property`
- Why composition is often cleaner than inheritance

---

## What is a Class?

A class is a blueprint for creating objects. An object bundles state and behavior together.

```python
class Dog:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def bark(self) -> str:
        return f"{self.name} says: Woof!"

dog = Dog("Rex", 3)
dog.bark()
```

`__init__` initializes the instance. `self` refers to the specific object being used.

## Instance vs Class Attributes

```python
class Circle:
    pi = 3.14159  # shared by all instances

    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        return Circle.pi * self.radius ** 2

c1 = Circle(5)
c2 = Circle(10)
```

Use class attributes for shared state. Use instance attributes for per-object state.

## Methods and `self`

Instance methods operate on a specific object, and Python passes that object as the first argument:

```python
class BankAccount:
    def __init__(self, owner: str, balance: float = 0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: float) -> None:
        self.balance += amount

acct = BankAccount("Alan")
acct.deposit(100)
```

This is why `self` appears in the method definition but not in the call.

## Encapsulation and Composition

Python does not enforce private access like Java, but it still has encapsulation by convention:

```python
class User:
    def __init__(self, username: str):
        self.username = username
        self._login_count = 0

    def record_login(self) -> None:
        self._login_count += 1
```

Composition is another core design idea:

```python
class Engine:
    ...

class Car:
    def __init__(self, engine: Engine):
        self.engine = engine
```

If one object simply uses another object, composition is often clearer than inheritance.

## `@staticmethod` and `@classmethod`

```python
class MathUtils:
    multiplier = 2

    @staticmethod
    def add(a: int, b: int) -> int:
        return a + b

    @classmethod
    def double(cls, value: int) -> int:
        return value * cls.multiplier
```

- `@staticmethod` does not receive `self` or `cls`
- `@classmethod` receives the class as `cls`

## `@property`

`@property` lets you expose a method like an attribute:

```python
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32

t = Temperature(100)
t.fahrenheit  # 212.0
```

Inheritance and magic methods are both important interview topics, but this roadmap covers them in their own articles.

## Key Questions

> _Q: What is the difference between a class and an instance?_

A class is the blueprint. An instance is a concrete object created from that blueprint.

> _Q: What does `self` refer to?_

`self` refers to the specific instance the method is operating on. Python passes it automatically for instance methods.

> _Q: What is the difference between `@staticmethod` and `@classmethod`?_

A `@staticmethod` receives no implicit first argument. A `@classmethod` receives the class as `cls`, which is useful when the method needs class-level state.

> _Q: What is encapsulation in Python?_

Encapsulation means bundling state and behavior together and limiting how internal state is used. In Python this is mostly enforced by convention, not strict access modifiers.

> _Q: What is the difference between inheritance and composition?_

Inheritance models an `is-a` relationship. Composition models a `has-a` relationship. Composition is often more flexible because it avoids deep coupling between classes.
