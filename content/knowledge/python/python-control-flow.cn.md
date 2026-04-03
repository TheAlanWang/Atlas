---
title: "控制流"
topic: python
section: Python Basics
order: 2
duration: 20
date: 2026-03-28
---

## 本章内容

- `if / elif / else` 怎么判断分支
- `for` 和 `while` 循环怎么用
- `break`、`continue`、`pass` 的区别
- `range()` 的常见写法
- `for / else` 这种容易被忽略的语法

---

## `if / elif / else`

```python
score = 85

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("C")
```

Python 从上到下判断条件，命中第一个 `True` 分支后就停止。

**真值判断**里，`0`、`""`、`[]`、`{}`、`None` 都会被当作 `False`。

## `for` 循环

`for` 可以遍历任何可迭代对象：

```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```

如果你既要索引又要值，优先用 `enumerate()`：

```python
for i, fruit in enumerate(fruits):
    print(i, fruit)
```

## `range()`

常见形式有：

```python
range(5)
range(1, 6)
range(0, 10, 2)
range(5, 0, -1)
```

`range` 是惰性的，不会一次性把所有数字都放进内存。

## `while` 循环

```python
n = 3
while n > 0:
    print(n)
    n -= 1
```

要确保条件最终会变成 `False`，否则就会进入死循环。

## `break`、`continue`、`pass`

```python
for i in range(5):
    if i == 2:
        continue
    if i == 4:
        break
    print(i)
```

- `break`：直接结束整个循环
- `continue`：跳过当前轮，进入下一轮
- `pass`：什么都不做，占位用

## `for / else`

如果循环没有碰到 `break`，`else` 才会执行：

```python
for n in [4, 5, 6]:
    if n % 2 == 1:
        print("found odd")
        break
else:
    print("no odd number")
```

这个写法经常用于“搜了一圈没找到”的逻辑。

## 关键问题

> _Q：`break` 和 `continue` 有什么区别？_

`break` 直接结束整个循环；`continue` 只跳过当前这一轮。

> _Q：Python 里哪些值会被当成假值？_

常见的有 `False`、`None`、`0`、空字符串、空列表、空字典、空元组等。

> _Q：`for / else` 是什么意思？_

只有在循环正常结束、没有碰到 `break` 时，`else` 才会执行。

> _Q：`range(5)` 和 `list(range(5))` 有什么区别？_

`range(5)` 是惰性的 range 对象；`list(range(5))` 会把它立刻展开成列表。

> _Q：如何遍历字典？_

`for key in d` 遍历键；`for key, value in d.items()` 遍历键值对；`for value in d.values()` 遍历值。
