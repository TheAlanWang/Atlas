---
title: "类与面向对象编程"
topic: python
section: Fundamentals
order: 4
duration: 30
date: 2026-03-25
---

## 学完你会掌握

- 如何用 `__init__` 定义类、创建对象
- 实例属性和类属性的区别
- 继承和 `super()` 的用法
- 什么时候用 `@staticmethod`、`@classmethod`、`@property`
- 每次 Python 面试都会考到的 OOP 核心概念

---

## 什么是类？

类是创建对象的蓝图。对象把数据（属性）和行为（方法）封装在一起。

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

`__init__` 是构造方法——创建新实例时自动执行。`self` 指向实例本身。

## 实例属性 vs 类属性

```python
class Circle:
    pi = 3.14159  # 类属性 — 所有实例共享

    def __init__(self, radius: float):
        self.radius = radius  # 实例属性 — 每个实例独有

    def area(self) -> float:
        return Circle.pi * self.radius ** 2

c1 = Circle(5)
c2 = Circle(10)

c1.radius  # 5
c2.radius  # 10
Circle.pi  # 3.14159 — 通过类访问
```

## 继承

子类继承父类的所有属性和方法：

```python
class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self) -> str:
        return f"{self.name} makes a sound."

class Dog(Animal):
    def speak(self) -> str:  # 重写父类方法
        return f"{self.name} barks."

class Cat(Animal):
    def speak(self) -> str:
        return f"{self.name} meows."

dog = Dog("Rex")
cat = Cat("Mochi")
dog.speak()  # "Rex barks."
cat.speak()  # "Mochi meows."
```

用 `super()` 调用父类方法，避免重复代码：

```python
class Employee:
    def __init__(self, name: str, salary: float):
        self.name = name
        self.salary = salary

class Manager(Employee):
    def __init__(self, name: str, salary: float, team_size: int):
        super().__init__(name, salary)  # 调用 Employee.__init__
        self.team_size = team_size
```

## 特殊方法（魔术方法）

特殊方法让你的对象能配合 Python 内置运算符和函数使用：

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

print(p1)       # Point(1, 2)   — 用 __repr__
p1 + p2         # Point(4, 6)   — 用 __add__
p1 == p1        # True          — 用 __eq__
```

## @staticmethod 和 @classmethod

```python
class MathUtils:
    multiplier = 2

    @staticmethod
    def add(a: int, b: int) -> int:
        # 没有 self 或 cls — 只是挂在类上的工具函数
        return a + b

    @classmethod
    def double(cls, value: int) -> int:
        # cls 指向类本身，不是实例
        return value * cls.multiplier

MathUtils.add(3, 4)     # 7
MathUtils.double(5)     # 10
```

- `@staticmethod` — 不需要类或实例，只是挂在类命名空间下的普通函数
- `@classmethod` — 第一个参数是类本身（`cls`），常用于实现备用构造方法

## @property

`@property` 让你把一个方法伪装成属性来访问：

```python
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32

t = Temperature(100)
t.fahrenheit  # 212.0 — 像属性一样访问，不是 t.fahrenheit()
```

## 面试常问

> _Q：类和实例有什么区别？_

类是蓝图——定义结构和行为。实例是根据蓝图创建的具体对象。一个类可以创建多个实例，每个实例有自己的属性值。

> _Q：`self` 是什么？_

`self` 是实例方法的第一个参数，指向调用该方法的具体实例，让方法能访问实例的属性和其他方法。Python 会自动传入，调用时不需要手动提供。

> _Q：`__str__` 和 `__repr__` 有什么区别？_

`__repr__` 面向开发者——应该返回对象的明确表示，最好能用来重新创建对象。`__str__` 面向用户——可读、人性化的字符串。`print()` 和 `str()` 用 `__str__`；`repr()` 和交互式解释器用 `__repr__`。只定义了一个时，Python 会退而使用 `__repr__`。

> _Q：什么是方法重写？_

子类定义了和父类同名的方法时，子类版本优先。这让子类可以定制继承来的行为，而不用修改父类。

> _Q：`@staticmethod` 和 `@classmethod` 有什么区别？_

`@staticmethod` 没有隐式的第一个参数——既访问不了类也访问不了实例。`@classmethod` 第一个参数是类（`cls`），可以访问类级别的属性。需要在方法里操作类本身时用 `@classmethod`，比如实现备用构造方法。

> _Q：什么是封装？_

封装是把数据和操作数据的方法打包到类里，并控制对内部状态的访问。Python 里，单下划线（`_name`）表示"仅内部使用"，双下划线（`__name`）会触发名称改写，让外部意外访问变得更难。Python 语言层面不强制私有访问。

> _Q：继承和组合有什么区别？_

继承描述的是"是一个"的关系——`Dog` 是 `Animal`。组合描述的是"有一个"的关系——`Car` 有 `Engine`。组合通常更灵活：可以替换组件而不用重构类层级。常见原则是"优先用组合，而不是继承"。
