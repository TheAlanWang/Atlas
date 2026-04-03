---
title: "推导式"
topic: python
section: Data Structures
order: 4
duration: 20
date: 2026-03-28
---

## 本章内容

- list、dict、set 推导式的基本写法
- 如何在推导式里做过滤
- 生成器表达式和列表推导式的区别
- 嵌套推导式怎么理解
- 什么时候该用普通循环而不是推导式

---

## 列表推导式

```python
squares = [x ** 2 for x in range(10)]
```

它适合把一个可迭代对象转换成一个新列表。

## 带过滤条件

```python
evens = [x for x in range(20) if x % 2 == 0]
```

这类写法本质上是“遍历 + 过滤 + 产出新集合”。

## 字典和集合推导式

```python
name_lengths = {name: len(name) for name in ["Alice", "Bob"]}
first_letters = {w[0] for w in ["apple", "banana", "avocado"]}
```

当你想把一个集合映射成另一个集合时，推导式通常比先建空容器再 `append` / 赋值更直观。

## 生成器表达式

```python
total = sum(x ** 2 for x in range(1_000_000))
```

这里没有方括号，所以它不是一次性建完整列表，而是惰性地产生值。

## 嵌套推导式

```python
matrix = [[1, 2], [3, 4]]
flat = [n for row in matrix for n in row]
```

从左到右读，它等价于嵌套循环。

如果推导式已经难到需要停下来解析，就该改回普通循环。

## 关键问题

> _Q：列表推导式和生成器表达式有什么区别？_

列表推导式会立刻创建完整列表；生成器表达式是惰性的，按需产生值，更省内存。

> _Q：嵌套推导式的执行顺序是什么？_

从左到右，和嵌套 `for` 循环一致。

> _Q：推导式里可以写多个条件吗？_

可以，既可以链多个 `if`，也可以在一个 `if` 里用逻辑运算组合条件。

> _Q：什么时候不该用推导式？_

当逻辑过于复杂、有副作用、需要 `break` / `continue`，或者代码明显变难读时，就该换普通循环。
