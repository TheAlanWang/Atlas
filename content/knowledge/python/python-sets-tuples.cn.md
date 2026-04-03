---
title: "集合与元组"
topic: python
section: Data Structures
order: 2
duration: 20
date: 2026-03-28
---

## 本章内容

- tuple 是什么，什么时候该用它而不是 list
- 如何做元组解包
- set 如何保证元素唯一
- 并集、交集、差集等集合操作
- set 和 list 在查找性能上的差异

---

## 元组

tuple 是**有序且不可变**的序列：

```python
point = (3, 4)
rgb = (255, 128, 0)
single = (42,)
```

它和 list 一样可以按索引访问，但创建后不能原地修改。

## 什么时候用 tuple，什么时候用 list

tuple 更适合：

- 固定结构的数据
- 位置本身有意义的数据
- 需要作为字典键、且内部元素都可哈希的数据

list 更适合：

- 还会继续增删改的数据
- 同构、会变化的集合

## 解包

```python
x, y = (3, 4)
name, age, city = ("Alan", 25, "Boston")

first, *rest = (1, 2, 3, 4)
```

解包是 Python 面试里很高频的语法点。

## set

set 是**无序且元素唯一**的集合：

```python
tags = {"python", "backend", "python"}
print(tags)   # {"python", "backend"}
```

空集合要用 `set()`，因为 `{}` 是空字典。

## 集合操作

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b
a & b
a - b
a ^ b
```

分别表示并集、交集、差集、对称差。

## 为什么 set 查找快

set 基于哈希表实现，所以成员判断通常是 O(1)：

```python
valid_ids = {101, 102, 103}
if user_id in valid_ids:
    ...
```

而 `x in list` 通常是 O(n)。

## 关键问题

> _Q：list 和 tuple 有什么区别？_

list 可变，tuple 不可变。tuple 更适合固定结构的数据，也可以作为字典键。

> _Q：为什么 list 不能做字典键？_

因为字典键必须可哈希，而 list 是可变对象，哈希值不稳定。

> _Q：set 是怎么保证唯一性的？_

因为它底层用哈希表保存元素，相同元素不会重复插入。

> _Q：`in` 在 list 和 set 上的复杂度有什么区别？_

list 通常是 O(n)，set 平均是 O(1)。

> _Q：`discard()` 和 `remove()` 有什么区别？_

两者都删除元素，但 `remove()` 在元素不存在时会抛 `KeyError`，`discard()` 不会。
