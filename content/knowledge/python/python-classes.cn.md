---
title: "类与面向对象编程"
topic: python
section: OOP
order: 1
duration: 30
date: 2026-03-25
---

## 本章内容

- 如何用 `__init__` 定义类并创建对象
- 实例属性和类属性的区别
- 方法和 `self` 是怎么工作的
- 什么时候用 `@staticmethod`、`@classmethod`、`@property`
- 为什么组合经常比继承更干净

---

## 什么是类？

类是创建对象的蓝图。对象把状态和行为封装在一起。

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

`__init__` 负责初始化实例，`self` 指向当前这个具体对象。

## 实例属性 vs 类属性

```python
class Circle:
    pi = 3.14159  # 所有实例共享

    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        return Circle.pi * self.radius ** 2

c1 = Circle(5)
c2 = Circle(10)
```

类属性适合共享状态，实例属性适合每个对象自己独有的状态。

## 方法和 `self`

实例方法操作的是某个具体对象，Python 会把这个对象自动作为第一个参数传进去：

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

这就是为什么方法定义里要写 `self`，但调用时不用手动传。

## 封装和组合

Python 不像 Java 那样强制私有访问，但它仍然有按约定的封装方式：

```python
class User:
    def __init__(self, username: str):
        self.username = username
        self._login_count = 0

    def record_login(self) -> None:
        self._login_count += 1
```

组合也是核心设计概念：

```python
class Engine:
    ...

class Car:
    def __init__(self, engine: Engine):
        self.engine = engine
```

如果一个对象只是“使用”另一个对象，组合通常比继承更清晰。

## `@staticmethod` 和 `@classmethod`

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

- `@staticmethod` 不会接收 `self` 或 `cls`
- `@classmethod` 会接收类本身 `cls`

## `@property`

`@property` 可以把一个方法暴露得像属性一样：

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

继承和魔术方法本身也是高频面试点，不过这条 roadmap 里已经拆成独立文章。

## 关键问题

> _Q：类和实例有什么区别？_

类是蓝图，实例是根据这个蓝图创建出来的具体对象。

> _Q：`self` 是什么？_

`self` 指向当前调用方法的那个实例。Python 调用实例方法时会自动把它传进去。

> _Q：`@staticmethod` 和 `@classmethod` 有什么区别？_

`@staticmethod` 没有隐式的第一个参数；`@classmethod` 会接收类本身 `cls`，适合操作类级别状态。

> _Q：什么是封装？_

封装就是把状态和操作这些状态的方法放到同一个类里，并控制外部如何使用这些状态。在 Python 里更多依赖约定，而不是强制语法。

> _Q：继承和组合有什么区别？_

继承表示 `is-a` 关系，组合表示 `has-a` 关系。组合通常更灵活，因为它不会把类层级绑得太死。
