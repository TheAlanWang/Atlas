---
title: "作用域与 LEGB"
topic: python
section: Functions & Scope
order: 2
duration: 20
date: 2026-03-29
---

## 本章内容

- Python 如何按 LEGB 规则查找名字
- 局部、闭包外层、全局、内置作用域的区别
- 什么时候该用 `global` 和 `nonlocal`
- 为什么赋值会触发 `UnboundLocalError`
- 面试里最常见的作用域陷阱

---

## LEGB 规则

Python 查找一个名字时，顺序是：

1. Local
2. Enclosing
3. Global
4. Built-in

这套顺序就叫 **LEGB**。

```python
x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        return x

    return inner()
```

在 `inner()` 里，Python 会先找到局部变量 `x`，所以不会继续往外找。

## 局部、外层、全局、内置

```python
len = "oops"   # 覆盖了内置 len

def outer():
    count = 10

    def inner():
        return count

    return inner()
```

- **Local**：当前函数内部定义的名字
- **Enclosing**：外层函数里的名字
- **Global**：模块级定义的名字
- **Built-in**：Python 自带名字，比如 `len`、`sum`、`print`

名字覆盖是合法的，但往往会降低可读性。

## 为什么赋值会改变作用域判断

只要 Python 在函数里看到了赋值，它就会把这个名字当作该函数的局部变量：

```python
count = 0

def bump():
    count += 1
```

这里会报 `UnboundLocalError`，因为 Python 认为 `count` 是局部变量，但它在赋值前就先被读取了。

## `global`

当你确实想修改模块级变量时，可以用 `global`：

```python
count = 0

def bump():
    global count
    count += 1
```

语法上没问题，但在真实项目里频繁修改全局变量通常是坏味道。

## `nonlocal`

如果你想修改外层函数里的变量，用 `nonlocal`：

```python
def counter():
    n = 0

    def inc():
        nonlocal n
        n += 1
        return n

    return inc
```

如果没有 `nonlocal`，这里的赋值会被当作在 `inc()` 内创建新的局部变量。

## 面试高频陷阱

- 覆盖 `list`、`dict`、`len` 这种内置名字
- 忘了“只要赋值就会被当局部变量”
- 明明可以返回值，却滥用 `global`
- 把闭包捕获和 `nonlocal` 混在一起

## 关键问题

> _Q：Python 里的 LEGB 是什么？_

LEGB 指的是 Local、Enclosing、Global、Built-in，这是 Python 查找名字时的顺序。

> _Q：`global` 和 `nonlocal` 有什么区别？_

`global` 用来重绑定模块级变量；`nonlocal` 用来重绑定最近一层外部函数作用域里的变量。

> _Q：为什么函数里赋值会导致 `UnboundLocalError`？_

因为 Python 一旦看到赋值，就会把这个名字视为当前函数的局部变量。如果在赋值之前先读取它，就会报错。

> _Q：全局变量是不是一定不好？_

不一定。常量或少量模块级状态可以接受，但大量可变全局状态会增加隐藏耦合，让代码更难推理。

> _Q：什么是变量遮蔽？_

变量遮蔽就是复用了外层作用域或内置名字。语法允许，但通常会让代码更难读、更难排查问题。
