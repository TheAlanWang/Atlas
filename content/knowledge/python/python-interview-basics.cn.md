---
title: "Python Interview Basics"
topic: python
section: Interview Patterns
order: 1
duration: 45
date: 2026-03-24
---

## 本章内容

- Python 面试里最常反复出现的陷阱
- 如何更精确地回答比较类问题
- 哪些说法最容易讲得过满
- 比起背语法，哪些 trade-off 更重要

---

## List vs Tuple

两者都是有序序列，但核心区别是可变性：

| | `list` | `tuple` |
|---|---|---|
| 可变 | 是 | 否 |
| 适合 | 会变化的数据 | 固定结构的数据 |
| 能否做字典键 | 不能 | 有时可以 |

tuple 只有在其内部所有元素都可哈希时，才能作为字典键。

```python
coords = (37.77, -122.42)
bad = ([1, 2], 3)
```

## 可变 vs 不可变

Python 面试最常考的底层直觉之一就是对象可变性：

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)   # [1, 2, 3, 4]
```

因为 `a` 和 `b` 指向的是同一个列表对象。

对不可变对象来说，看起来像“修改”，实际上往往是在创建新对象：

```python
x = "hi"
y = x
x += "!"
print(y)   # "hi"
```

## `is` vs `==`

这是最经典的比较题之一：

```python
a = [1, 2]
b = [1, 2]

print(a == b)   # True
print(a is b)   # False
```

- `==` 比较值
- `is` 比较是否是同一个对象

默认最稳的规则就是：`is` 主要用来判断 `None`，普通值比较优先用 `==`。

## 可变默认参数

这是 Python 最有名的坑之一：

```python
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

add_item("a")   # ["a"]
add_item("b")   # ["a", "b"]
```

默认参数是在函数定义时求值一次，不是每次调用都重新创建。

更稳的写法是：

```python
def add_item(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```

## 浅拷贝 vs 深拷贝

面试里也很常见：

```python
import copy

original = [[1, 2], [3, 4]]
shallow = copy.copy(original)
deep = copy.deepcopy(original)

original[0].append(99)
```

- 浅拷贝只复制外层容器
- 深拷贝会递归复制内部对象

## Hashable vs Immutable

很多人会说“字典键必须不可变”，这个说法不够精确。

更准确的答案是：字典键必须**可哈希**。

所以：

- 字符串、整数可以做键
- list 不行
- tuple 只有在内部元素都可哈希时才行

## GIL

更强的简洁回答是：

“在 CPython 里，GIL 会阻止多个线程并行执行 Python 字节码。线程对很多 I/O 密集任务仍然有效，但如果我要做 CPU 密集并行，通常会想到 multiprocessing。”

这个说法比两个极端都更稳：

- “线程没用”
- “I/O 完全不受影响”

## `__slots__`

`__slots__` 不算入门知识，但很适合作为面试加分点：

```python
class Point:
    __slots__ = ["x", "y"]
```

更稳的回答是：

- 它可以在大量实例场景下减少内存占用
- 它会限制动态添加属性
- 它是一种 trade-off，不是默认优化

不要在没有实测的情况下给出固定百分比。

## 关键问题

> _Q：Python 是值传递还是引用传递？_

严格说都不是。实务上最常见也最稳的回答是：Python 传递的是对象引用。这也是为什么修改传入的 list 可能影响调用方，而在函数里重新绑定变量不会。

> _Q：`is` 和 `==` 有什么区别？_

`==` 比较值，`is` 比较是否是同一个对象。`is` 主要用于判断 `None`，不要用它做普通值比较。

> _Q：可变默认参数的坑是什么？_

默认参数在函数定义时只求值一次。如果默认值是可变对象，多次调用就可能共享同一个对象。

> _Q：浅拷贝和深拷贝有什么区别？_

浅拷贝只复制外层容器，深拷贝会递归复制内部对象。

> _Q：tuple 一定能做字典键吗？_

不一定。只有当 tuple 里面的所有元素都可哈希时，它才能作为字典键。

> _Q：GIL 是什么？_

在 CPython 里，GIL 是一个锁，它会阻止多个线程在同一进程内并行执行 Python 字节码。线程对很多 I/O 密集任务仍然有效，而 CPU 密集并行通常更适合 multiprocessing。

> _Q：`__slots__` 是什么？什么时候提它？_

`__slots__` 会限制实例允许的属性集合，并且在大量实例场景下可能降低内存占用。它更像一个 trade-off 工具，不是通用优化。
