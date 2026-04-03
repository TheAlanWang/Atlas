---
title: "闭包"
topic: python
section: Functions & Scope
order: 3
duration: 20
date: 2026-03-25
---

## 本章内容

- 什么是闭包，Python 如何捕获外层变量
- 为什么外层函数返回后变量还在
- `nonlocal` 如何修改外层变量
- 循环闭包 bug 是怎么来的
- 闭包和类分别适合什么场景

---

## 什么是闭包？

闭包就是：**内部函数记住了外层函数作用域里的变量**，即使外层函数已经返回。

```python
def outer():
    message = "hello"

    def inner():
        print(message)

    return inner

greet = outer()
greet()   # "hello"
```

## 成为闭包的条件

通常你可以这样理解：

1. 有嵌套函数
2. 内部函数引用了外层变量
3. 内部函数被返回或保存下来

## `nonlocal`

默认情况下，内部函数只能读取外层变量。要修改它，需要 `nonlocal`：

```python
def make_counter():
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count

    return counter
```

## 工厂函数

闭包很适合做“返回定制函数”的工厂函数：

```python
def make_greeting(prefix):
    def greet(name):
        return f"{prefix}, {name}!"
    return greet
```

## 经典坑：循环闭包

```python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])  # [2, 2, 2]
```

原因是它们捕获的是同一个 `i`，不是每次循环时的值拷贝。

常见修复是用默认参数把当前值锁住：

```python
funcs = [lambda i=i: i for i in range(3)]
```

## 闭包 vs 类

简单状态和单个操作时，闭包很轻量。状态更多、行为更多时，类通常更清晰。

## 关键问题

> _Q：什么是闭包？_

闭包是一个内部函数，它捕获并保留了外层作用域里的变量，即使外层函数已经返回。

> _Q：闭包和类有什么区别？_

两者都能保存状态。闭包更轻量，类在状态和行为变复杂时更清晰。

> _Q：`nonlocal` 是做什么的？_

它让内部函数可以重绑定外层函数作用域里的变量。

> _Q：循环闭包 bug 是什么？怎么修？_

在循环里创建多个 lambda 时，它们经常捕获的是同一个循环变量。修法通常是用默认参数把当前值固化下来。

> _Q：怎么查看闭包捕获了什么？_

可以看函数的 `__closure__`，里面是 cell 对象，`cell_contents` 就是捕获的值。
