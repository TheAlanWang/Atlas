---
title: "装饰器"
topic: python
section: Advanced Python
order: 1
duration: 25
date: 2026-03-25
---

## 本章内容

- 装饰器本质上是什么
- 为什么 `@deco` 等价于 `func = deco(func)`
- 如何用 `*args` 和 `**kwargs` 写通用装饰器
- 为什么生产代码里要用 `functools.wraps`
- 带参数的装饰器为什么要多一层函数

---

## 什么是装饰器？

装饰器本质上是：接收一个函数，再返回一个新函数。

```python
@deco
def hello():
    print("hello")
```

等价于：

```python
def hello():
    print("hello")

hello = deco(hello)
```

## 一个基础装饰器

```python
def deco(func):
    def wrapper():
        print("before")
        func()
        print("after")
    return wrapper
```

外层函数接收原函数，内部 `wrapper` 加上前后逻辑，再把它返回。

## 通用装饰器：`*args` 和 `**kwargs`

```python
def deco(func):
    def wrapper(*args, **kwargs):
        print("before")
        result = func(*args, **kwargs)
        print("after")
        return result
    return wrapper
```

这才是更通用的写法。

## `functools.wraps`

如果不加 `wraps`，被装饰后的函数名字、文档字符串等元信息会丢掉：

```python
import functools

def deco(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

## 带参数的装饰器

如果你想写 `@repeat(3)` 这种形式，就需要多一层函数：

```python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator
```

## 闭包视角

装饰器本质上依赖闭包：`wrapper` 能记住外层的 `func`，即使外层函数已经返回。

## 关键问题

> _Q：Python 里的装饰器是什么？_

它是一个接收函数并返回新函数的可调用对象，常用于给函数附加额外行为。

> _Q：为什么要用 `functools.wraps`？_

因为它能保留原函数的名字、文档字符串和其他元信息，避免包装后函数“失去身份”。

> _Q：装饰器是如何记住原函数的？_

靠闭包。内部 `wrapper` 捕获了外层作用域里的 `func`。

> _Q：`@deco` 和 `@deco(arg)` 有什么区别？_

`@deco` 是直接把函数传给装饰器；`@deco(arg)` 是先调用一次工厂函数，得到真正的装饰器，再去装饰目标函数。
