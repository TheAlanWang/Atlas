---
title: "上下文管理器"
topic: python
section: Advanced Python
order: 3
duration: 25
date: 2026-03-29
---

## 本章内容

- 什么是上下文管理器
- 为什么 `with` 比手动清理更安全
- `__enter__` 和 `__exit__` 是怎么工作的
- `contextlib.contextmanager` 如何简化自定义上下文管理器
- 面试里问上下文管理器时真正想考什么

---

## 为什么需要上下文管理器

有些资源必须在任何情况下都被正确释放：

- 文件要关闭
- 锁要释放
- 数据库事务可能要回滚

如果不用上下文管理器，很容易忘记清理：

```python
f = open("data.txt")
data = f.read()
f.close()
```

一旦 `open()` 和 `close()` 之间抛异常，清理逻辑就可能漏掉。

## `with`

`with` 语句可以保证进入和退出时的处理逻辑：

```python
with open("data.txt") as f:
    data = f.read()
```

离开代码块时，Python 会自动关闭文件。

## `__enter__` 和 `__exit__`

一个上下文管理器对象需要实现 `__enter__` 和 `__exit__`：

```python
class Demo:
    def __enter__(self):
        print("enter")
        return self

    def __exit__(self, exc_type, exc, tb):
        print("exit")
```

- `__enter__` 在进入代码块时执行
- `__exit__` 在离开代码块时执行，即使中间发生了异常

如果 `__exit__` 返回 `True`，它会吞掉异常。除非你非常确定要这么做，否则一般不要随便返回 `True`。

## `contextlib.contextmanager`

对简单场景来说，`contextlib.contextmanager` 往往比写完整类更轻：

```python
from contextlib import contextmanager

@contextmanager
def open_file(path: str):
    f = open(path)
    try:
        yield f
    finally:
        f.close()
```

它可以把一个带 `yield` 的函数包装成上下文管理器。

## 面试里真正想考什么

最重要的不是语法，而是这个抽象解决了什么问题：**让清理逻辑变成确定性的**。

只要某个资源必须在异常发生时也被正确释放，上下文管理器通常就是合适抽象。

## 关键问题

> _Q：上下文管理器解决什么问题？_

它让资源的初始化和清理更可靠，尤其是在发生异常的时候。

> _Q：一个上下文管理器由哪两个方法定义？_

`__enter__` 和 `__exit__`。

> _Q：为什么 `with open(...)` 比手动 `open()` / `close()` 更好？_

因为 `with` 能保证无论代码块里是否抛异常，文件最终都会被关闭。

> _Q：`__exit__` 会收到什么参数？_

它会收到异常类型、异常对象和 traceback。如果没有异常，这三个值都是 `None`。

> _Q：什么时候适合用 `contextlib.contextmanager`？_

当你只想快速写一个轻量级自定义上下文管理器，而不想专门定义一个完整类的时候。
