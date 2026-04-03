---
title: "生成器"
topic: python
section: Advanced Python
order: 2
duration: 25
date: 2026-03-25
---

## 本章内容

- 什么是生成器，为什么它更省内存
- `yield` 如何让函数暂停和恢复
- 生成器表达式和列表推导式的区别
- `yield from` 是做什么的
- 生成器和迭代器协议之间的关系

---

## 为什么需要生成器

如果一次把大量数据都读进内存，会很浪费：

```python
def read_all(filename):
    with open(filename) as f:
        return f.readlines()
```

生成器的价值就在于：**按需产出值，而不是一次性建完整集合**。

## `yield`

只要函数里出现了 `yield`，它就会变成生成器函数：

```python
def count_up(n):
    for i in range(n):
        yield i
```

调用 `count_up(3)` 时不会立刻执行函数体，而是返回一个生成器对象。

## `for` 循环里的生成器

```python
for value in count_up(5):
    print(value)
```

`for` 循环会自动帮你反复调用 `next()`，直到生成器抛出 `StopIteration`。

## 生成器表达式

```python
total = sum(x * x for x in range(1_000_000))
```

没有方括号时，就是生成器表达式。它比列表推导式更省内存。

## `yield from`

`yield from` 用来把一个可迭代对象里的值继续往外转发：

```python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item
```

## 迭代器协议

生成器天然实现了迭代器协议，所以它们可以直接用于 `for` 循环。

要点是：

- 生成器是迭代器
- 迭代器一般只能遍历一次
- 列表是可迭代对象，但不是迭代器本身

## 关键问题

> _Q：生成器和列表有什么区别？_

列表会立刻把所有元素存进内存；生成器按需生成值，通常会更省前期内存，但通常也只能遍历一次。

> _Q：`yield` 是做什么的？_

它会暂停函数执行、产出一个值，并保留当前状态，等下一次继续执行。

> _Q：`yield` 和 `return` 有什么区别？_

`return` 会直接结束函数；`yield` 会暂停函数，之后还能继续恢复执行。

> _Q：`yield from` 是做什么的？_

它把另一个可迭代对象里的值继续向外产出，常用于组合多个生成器。

> _Q：什么时候该用生成器而不是列表推导式？_

当数据很大、只需要遍历一次，或者序列本身是按需产生时，生成器更合适。
