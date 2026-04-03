---
title: "魔术方法"
topic: python
section: OOP
order: 3
duration: 25
date: 2026-03-29
---

## 本章内容

- 什么是魔术方法，Python 为什么会用它们
- `__repr__` 和 `__str__` 的区别
- `__len__`、`__eq__`、`__iter__` 这类方法如何改变对象行为
- 为什么魔术方法本质上是在接入 Python 协议
- 面试里关于 dunder methods 的常见误区

---

## 什么是魔术方法？

魔术方法，也叫 **dunder methods**，就是名字形如 `__init__`、`__repr__`、`__len__` 的特殊方法。

Python 会在特定场景里自动调用它们：

```python
class Box:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

box = Box([1, 2, 3])
len(box)   # 3
```

正常代码里你不会手动去写 `box.__len__()`，而是让 Python 在 `len(box)` 时自动调用。

## `__repr__` vs `__str__`

这两个是最常被问到的：

```python
class User:
    def __init__(self, name: str):
        self.name = name

    def __repr__(self) -> str:
        return f"User(name={self.name!r})"

    def __str__(self) -> str:
        return self.name
```

- `__repr__` 面向开发者
- `__str__` 面向用户展示

如果没写 `__str__`，Python 会退回去用 `__repr__`。

## 比较相关的方法

像 `__eq__`、`__lt__` 这种方法决定了对象如何比较：

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

对不支持的类型返回 `NotImplemented`，比强行比较更符合协议。

## 容器和迭代相关的方法

Python 也会用魔术方法定义“像容器一样”的行为：

- `__len__` 对应 `len(obj)`
- `__contains__` 对应 `x in obj`
- `__iter__` 对应 `for x in obj`
- `__getitem__` 对应 `obj[key]`

这也是为什么自定义类可以表现得像内置类型。

## 更重要的理解：协议

最值得记住的不是一长串方法名，而是：魔术方法让你的类接入 Python 的协议。

如果对象实现了 `__iter__`，它就可以像可迭代对象一样被遍历；如果实现了 `__enter__` 和 `__exit__`，它就能当上下文管理器。

## 关键问题

> _Q：Python 里的魔术方法是什么？_

它们是带双下划线的特殊方法，Python 会自动调用它们来支持打印、比较、迭代、算术等语言特性。

> _Q：`__repr__` 和 `__str__` 有什么区别？_

`__repr__` 面向开发者，最好是明确、无歧义的表示；`__str__` 面向用户，偏可读展示。

> _Q：为什么自定义类也能用 `len(obj)`？_

因为 Python 会检查这个类是否实现了 `__len__`，如果实现了就调用它。

> _Q：为什么 `__eq__` 有时应该返回 `NotImplemented`？_

因为这表示当前这对类型不支持这种比较，比随便给出一个错误结论更符合 Python 的协议设计。

> _Q：理解魔术方法更大的意义是什么？_

它们让自定义类接入 Python 协议，使对象在合适的时候表现得像内置对象。
