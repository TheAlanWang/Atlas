---
title: "Classes and OOP"
topic: python
section: Fundamentals
order: 4
duration: 30
date: 2026-03-25
---

## What You'll Learn

- How to define classes and create objects with `__init__`
- The difference between instance attributes and class attributes
- How inheritance and `super()` work
- When to use `@staticmethod`, `@classmethod`, and `@property`
- Key OOP concepts that come up in every Python interview

---

## What is a Class?

A class is a blueprint for creating objects. An object bundles data (attributes) and behavior (methods) together.

```python
class Dog:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def bark(self) -> str:
        return f"{self.name} says: Woof!"

dog = Dog("Rex", 3)
dog.bark()  # "Rex says: Woof!"
```

`__init__` is the constructor — it runs automatically when you create a new instance. `self` refers to the instance itself.

## Instance vs Class Attributes

```python
class Circle:
    pi = 3.14159  # class attribute — shared by all instances

    def __init__(self, radius: float):
        self.radius = radius  # instance attribute — unique to each instance

    def area(self) -> float:
        return Circle.pi * self.radius ** 2

c1 = Circle(5)
c2 = Circle(10)

c1.radius  # 5
c2.radius  # 10
Circle.pi  # 3.14159 — accessed on the class
```

## Inheritance

A subclass inherits all attributes and methods from its parent class:

```python
class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self) -> str:
        return f"{self.name} makes a sound."

class Dog(Animal):
    def speak(self) -> str:  # override parent method
        return f"{self.name} barks."

class Cat(Animal):
    def speak(self) -> str:
        return f"{self.name} meows."

dog = Dog("Rex")
cat = Cat("Mochi")
dog.speak()  # "Rex barks."
cat.speak()  # "Mochi meows."
```

Use `super()` to call the parent's method without repeating code:

```python
class Employee:
    def __init__(self, name: str, salary: float):
        self.name = name
        self.salary = salary

class Manager(Employee):
    def __init__(self, name: str, salary: float, team_size: int):
        super().__init__(name, salary)  # call Employee.__init__
        self.team_size = team_size
```

## Special Methods (Dunder Methods)

Special methods let your objects work with Python's built-in operators and functions:

```python
class Point:
    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"Point({self.x}, {self.y})"

    def __add__(self, other: "Point") -> "Point":
        return Point(self.x + other.x, self.y + other.y)

    def __eq__(self, other: "Point") -> bool:
        return self.x == other.x and self.y == other.y

p1 = Point(1, 2)
p2 = Point(3, 4)

print(p1)       # Point(1, 2)   — uses __repr__
p1 + p2         # Point(4, 6)   — uses __add__
p1 == p1        # True          — uses __eq__
```

## @staticmethod and @classmethod

```python
class MathUtils:
    multiplier = 2

    @staticmethod
    def add(a: int, b: int) -> int:
        # no access to self or cls — just a utility function attached to the class
        return a + b

    @classmethod
    def double(cls, value: int) -> int:
        # cls refers to the class itself, not an instance
        return value * cls.multiplier

MathUtils.add(3, 4)     # 7
MathUtils.double(5)     # 10
```

- `@staticmethod` — doesn't need the class or instance, just a namespaced function
- `@classmethod` — receives the class as the first argument (`cls`), often used for alternative constructors

## @property

`@property` lets you define a getter that looks like an attribute:

```python
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32

t = Temperature(100)
t.fahrenheit  # 212.0 — accessed like an attribute, not t.fahrenheit()
```

## Interview Questions

> _Q: What is the difference between a class and an instance?_

A class is the blueprint — it defines the structure and behavior. An instance is a concrete object created from that blueprint. You can create many instances from one class, each with their own attribute values.

> _Q: What does `self` refer to?_

`self` is the first parameter of any instance method and refers to the specific instance the method is being called on. It gives the method access to the instance's attributes and other methods. Python passes it automatically — you don't provide it when calling the method.

> _Q: What is the difference between `__str__` and `__repr__`?_

`__repr__` is meant for developers — it should return an unambiguous representation of the object, ideally one that could recreate it. `__str__` is meant for end users — a readable, human-friendly string. `print()` and `str()` use `__str__`; `repr()` and the interactive shell use `__repr__`. If only one is defined, Python falls back to `__repr__`.

> _Q: What is method overriding?_

When a subclass defines a method with the same name as one in the parent class, the subclass version takes precedence. This allows subclasses to customize inherited behavior without changing the parent class.

> _Q: What is the difference between `@staticmethod` and `@classmethod`?_

A `@staticmethod` receives no implicit first argument — it has no access to the class or instance. A `@classmethod` receives the class (`cls`) as the first argument, giving it access to class-level attributes. Use `@classmethod` when the method needs to work with the class itself, for example to create an alternative constructor.

> _Q: What is encapsulation?_

Encapsulation is the practice of bundling data and the methods that operate on it inside a class, and controlling access to internal state. In Python, a leading underscore (`_name`) signals "internal use" by convention, and double underscores (`__name`) trigger name mangling to make accidental access harder. Python does not enforce private access at the language level.

> _Q: What is the difference between inheritance and composition?_

Inheritance models an "is-a" relationship — `Dog` is an `Animal`. Composition models a "has-a" relationship — a `Car` has an `Engine`. Composition is often preferred because it is more flexible: you can swap components without restructuring the class hierarchy. A common rule is "favor composition over inheritance."
