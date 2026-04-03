---
title: "继承"
topic: python
section: OOP
order: 2
duration: 25
date: 2026-03-29
---

## 本章内容

- Python 里的子类继承是怎么工作的
- 什么是方法重写
- `super()` 什么时候该用
- MRO 在高层上到底是什么
- 什么时候继承其实是错误抽象

---

## 基本继承

继承让子类可以复用父类的行为：

```python
class Animal:
    def speak(self) -> str:
        return "some sound"

class Dog(Animal):
    def speak(self) -> str:
        return "woof"
```

`Dog` 继承自 `Animal`，但也可以覆盖原有行为。

## 方法重写

如果子类定义了和父类同名的方法，子类版本会生效：

```python
class Animal:
    def move(self) -> str:
        return "moving"

class Bird(Animal):
    def move(self) -> str:
        return "flying"
```

这就叫 **方法重写**。

## `super()`

当你想在父类行为的基础上继续扩展时，用 `super()`：

```python
class Employee:
    def __init__(self, name: str):
        self.name = name

class Manager(Employee):
    def __init__(self, name: str, team_size: int):
        super().__init__(name)
        self.team_size = team_size
```

`super()` 最常见于构造函数，也经常出现在多重继承场景里。

## 从高层理解 MRO

MRO 是 **method resolution order**，也就是 Python 查找属性和方法时沿着父类搜索的顺序。

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

在多重继承里，MRO 很重要，因为 Python 必须有一套确定顺序来做查找。

面试里通常不要求你背完整算法，但至少要知道：

- Python 的 MRO 是确定的
- `super()` 会沿着 MRO 走
- 多重继承要谨慎使用

## 什么时候继承不合适

继承不是单纯为了复用代码。它最适合真正存在 `is-a` 关系的场景。

糟糕的继承常见后果是：

- 类层级脆弱
- 父类职责过多
- 子类被迫继承自己其实不需要的方法

如果一个对象只是“使用”另一个对象，组合通常更合理。

## 关键问题

> _Q：继承和组合有什么区别？_

继承表示 `is-a` 关系，组合表示 `has-a` 关系。组合通常更灵活，因为它不会把类层级绑死。

> _Q：什么是方法重写？_

方法重写就是子类提供了和父类同名方法的自己的实现。

> _Q：为什么要用 `super()`？_

因为它可以在不写死父类名字的前提下调用父类逻辑，代码更干净，也更适合协作式继承。

> _Q：Python 里的 MRO 是什么？_

MRO 就是方法解析顺序，也就是 Python 查找方法和属性时沿着类层级搜索的顺序。

> _Q：继承主要是为了复用代码吗？_

代码复用只是附带结果，不是最核心判断。更重要的问题是：子类到底是不是真的父类的一种。
