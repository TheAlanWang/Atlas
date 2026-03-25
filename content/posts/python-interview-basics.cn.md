---
title: "Python Interview Basics"
topic: python
section: Interview
order: 10
duration: 45
date: 2026-03-24
---

## 列表 List vs 元组 Tuple

两者都存储有序序列，区别在于可变性：

| | `list` | `tuple` |
|---|--------|---------|
| 可变 | ✅ | ❌ |
| 语法 | `[1, 2, 3]` | `(1, 2, 3)` |
| 使用场景 | 会变化的数据 | 固定数据、字典键 |

```python
lst = [1, 2, 3]
lst[0] = 99      # 没问题

tup = (1, 2, 3)
tup[0] = 99      # TypeError: tuple 不可修改
```

tuple 速度略快，内存占用也比 list 少。

## 可变 vs 不可变对象

Python 对象分为**可变（mutable）**和**不可变（immutable）**两类。

| 不可变 | 可变 |
|--------|------|
| `int`, `float`, `str`, `tuple` | `list`, `dict`, `set` |

```python
a = [1, 2, 3]
b = a           # b 和 a 指向同一个对象
b.append(4)
print(a)        # [1, 2, 3, 4] —— a 也变了！
```

> 不可变对象被"修改"时，Python 会创建一个新对象，原对象不变。

## 装饰器 Decorator

装饰器是一个函数，它包裹另一个函数，在不修改原函数的情况下添加额外行为：

```python
def log(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        result = func(*args, **kwargs)
        print(f"完成")
        return result
    return wrapper

@log
def greet(name):
    print(f"Hello, {name}!")

greet("Alan")
# 调用 greet
# Hello, Alan!
# 完成
```

`@log` 是 `greet = log(greet)` 的语法糖。装饰器广泛用于日志、权限校验、缓存、计时等场景。

## 生成器 Generator

生成器用 `yield` 逐个产生值，而不是把所有值一次性存入内存：

```python
def count_up(n):
    for i in range(n):
        yield i   # 暂停在这里，下次调用时继续

gen = count_up(3)
next(gen)   # 0
next(gen)   # 1
next(gen)   # 2
```

生成器适合处理大数据集——按需计算，不会一次性占用大量内存。

生成器表达式（像列表推导式，但是懒加载）：

```python
squares = (x**2 for x in range(1000000))  # 几乎不占内存
```

## `with` 语句

`with` 语句自动管理资源——即使发生异常，也保证清理代码能执行：

```python
with open("file.txt", "r") as f:
    content = f.read()
# 文件在这里自动关闭，即使出错也一样
```

`with` 适用于任何实现了 `__enter__` 和 `__exit__` 的对象（上下文管理器协议）。也可以自己写：

```python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self

    def __exit__(self, *args):
        print(f"耗时：{time.time() - self.start:.2f}s")

with Timer():
    do_something()
```

## `*args` 和 `**kwargs`

```python
def func(*args, **kwargs):
    print(args)    # tuple：位置参数
    print(kwargs)  # dict：关键字参数

func(1, 2, name="Alan")
# (1, 2)
# {'name': 'Alan'}
```

## Lambda 函数

lambda 是只包含单个表达式的匿名函数：

```python
square = lambda x: x ** 2
square(4)   # 16

# 常见用法——按某个 key 排序
people = [{"name": "Alan", "age": 25}, {"name": "Bob", "age": 22}]
people.sort(key=lambda p: p["age"])
```

## `map`、`filter` 和 `reduce`

```python
nums = [1, 2, 3, 4, 5]

# map——对每个元素应用函数
list(map(lambda x: x ** 2, nums))         # [1, 4, 9, 16, 25]

# filter——保留函数返回 True 的元素
list(filter(lambda x: x % 2 == 0, nums))  # [2, 4]

# reduce——把列表归约成一个值
from functools import reduce
reduce(lambda x, y: x + y, nums)          # 15
```

现代 Python 里，列表推导式通常比 `map` 和 `filter` 更易读。

## 列表推导式

```python
# 推荐写法
squares = [x**2 for x in range(10) if x % 2 == 0]

# 等价的 for 循环
squares = []
for x in range(10):
    if x % 2 == 0:
        squares.append(x**2)
```

## `is` vs `==`

```python
a = [1, 2]
b = [1, 2]
print(a == b)   # True  —— 值相等
print(a is b)   # False —— 不是同一个对象
```

- `==` 比较**值**
- `is` 比较**内存地址**（是否同一个对象）

## `__slots__`

默认情况下，Python 用 `__dict__`（一个字典）存储每个实例的属性，灵活但占内存。`__slots__` 用固定的属性列表替代它：

```python
class Point:
    __slots__ = ["x", "y"]   # 只允许 x 和 y

    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
p.z = 3   # AttributeError——z 不在 __slots__ 里
```

当需要创建大量实例且内存敏感时使用 `__slots__`，可以减少 40–50% 的内存占用。

---

## 面试常问

> **Q: 列表和元组有什么区别？**

两者都是有序序列，但列表可变（创建后可以修改），元组不可变。元组速度略快，可以作为字典的键，列表不行。当数据不需要改变时用元组。

> **Q: Python 是值传递还是引用传递？**

都不是，是 **pass-by-object-reference**。传入可变对象时，函数内修改会影响外部；传入不可变对象时不会。

```python
def modify(lst, num):
    lst.append(99)   # 会影响外部
    num += 1         # 不会影响外部

a = [1, 2]
b = 10
modify(a, b)
print(a)  # [1, 2, 99]
print(b)  # 10
```

> **Q: 装饰器是什么？有什么用？**

装饰器是一个接受函数作为参数、返回新函数的函数。`@decorator` 是 `func = decorator(func)` 的语法糖。常见用途包括日志记录、权限校验、限流和缓存（`@functools.lru_cache`）。

> **Q: 生成器是什么？和列表有什么区别？**

生成器用 `yield` 懒加载产生值——按需计算，每次产生一个。列表一次性把所有值存入内存。生成器适合大数据集和无限序列，内存效率高。生成器不支持下标索引，也只能遍历一次。

> **Q: `with` 语句是如何工作的？**

`with` 进入代码块时调用 `__enter__`，离开时调用 `__exit__`——即使发生异常也会执行。它保证资源一定被清理（关闭文件、释放锁），不需要手写 try/finally。

> **Q: GIL 是什么？**

全局解释器锁（Global Interpreter Lock），保证同一时刻只有一个线程执行 Python 字节码。Python 多线程无法真正并行处理 CPU 密集型任务，但 I/O 密集型任务不受影响。需要 CPU 并行时用 `multiprocessing`。

> **Q: `__init__` 和 `__new__` 的区别？**

`__new__` 创建对象（分配内存），返回实例。`__init__` 初始化对象（设置属性），无返回值。通常只需要重写 `__init__`，`__new__` 在实现单例模式或继承不可变类型时才用到。

> **Q: lambda 函数是什么？什么时候用 lambda，什么时候用 `def`？**

lambda 是单表达式的匿名函数。用于简短的一次性逻辑，最常见的是排序的 key 或传给 `map`/`filter` 的参数。当函数需要名字、多条语句或在多处复用时，用 `def`。

> **Q: `map`、`filter`、`reduce` 分别是什么？**

`map` 对每个元素应用函数，返回转换后的结果。`filter` 只保留函数返回 `True` 的元素。`reduce`（来自 `functools`）把列表归约成一个值，累积地应用函数。现代 Python 里列表推导式通常比 `map` 和 `filter` 更清晰。

> **Q: `__slots__` 是什么？什么时候用？**

`__slots__` 用固定的属性列表替代每个实例的 `__dict__`，可以减少 40–50% 的内存占用。适合需要创建大量实例且属性固定的类。代价是不能动态添加新属性。

> **Q: 列表推导式和 for 循环有什么区别？什么时候用哪个？**

列表推导式是从可迭代对象构建列表的简洁语法：`[expr for item in iterable if condition]`。逻辑简单、能写在一行时用推导式，速度也更快。逻辑复杂、有副作用或需要多条语句时用 for 循环。

> **Q: 什么时候用 `is`，什么时候用 `==`？**

`is` 只用于判断同一性，具体就是 `if x is None` 和 `if x is not None`。所有值的比较用 `==`。不要用 `is` 比较字符串或数字——CPython 缓存了小整数和驻留字符串，`is` 有时会返回 `True`，但这是实现细节，不能依赖。
