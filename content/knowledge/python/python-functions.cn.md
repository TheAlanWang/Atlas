---
title: "Functions"
topic: python
section: Functions & Scope
order: 1
duration: 30
date: 2026-03-21
---

## 本章内容

- 如何定义函数、传参数、返回结果
- `*args` 和 `**kwargs` 怎么处理可变参数
- 为什么 Python 函数是一等对象
- lambda 适合什么场景，不适合什么场景
- 一个经典面试坑：可变默认参数

---

## 定义函数

用 `def` 定义函数：

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

greet("Alan")
```

类型注解不是强制的，但会让函数约束更清楚。

## 参数和默认值

函数可以接收零个或多个参数：

```python
def add(a: int, b: int) -> int:
    return a + b

add(3, 5)   # 8
```

默认参数可以提供兜底值：

```python
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

greet("Alan")
greet("Alan", "Hey")
```

有默认值的参数必须放在必填参数后面。

Python 还支持仅限关键字参数：

```python
def connect(host: str, *, timeout: int = 5, retries: int = 2) -> None:
    ...

connect("db.local", timeout=10, retries=3)
```

## 返回值

如果函数没有显式 `return`，Python 会返回 `None`：

```python
def say_hi():
    print("hi")

result = say_hi()
print(result)  # None
```

Python 也可以一次返回多个值，本质上是打包成元组：

```python
def min_max(nums: list[int]) -> tuple[int, int]:
    return min(nums), max(nums)
```

## `*args` 和 `**kwargs`

`*args` 会把多余的位置参数收集成元组：

```python
def total(*args: int) -> int:
    return sum(args)
```

`**kwargs` 会把多余的关键字参数收集成字典：

```python
def display(**kwargs) -> None:
    for key, value in kwargs.items():
        print(f"{key}: {value}")
```

也可以和普通参数一起使用：

```python
def log(event: str, *args, level: str = "INFO", **kwargs) -> None:
    ...
```

## 函数是一等对象

在 Python 里，函数本身就是值。你可以把函数赋给变量、传给别的函数，也可以从函数里返回函数。

```python
def shout(text: str) -> str:
    return text.upper()

formatter = shout
formatter("hello")   # "HELLO"
```

这也是回调、装饰器和高阶函数能够自然成立的原因。

## Lambda 函数

lambda 是一种简短匿名函数写法：

```python
square = lambda x: x ** 2

names = ["Charlie", "Alan", "Bob"]
names.sort(key=lambda name: len(name))
```

如果逻辑开始变复杂，或者你需要更清晰的名字，就应该换成 `def`。

## 可变默认参数

Python 最常见的面试坑之一是：

```python
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

add_item("a")   # ["a"]
add_item("b")   # ["a", "b"]
```

这里的列表不是每次调用都新建，而是在函数定义时创建一次。

更安全的写法是：

```python
def add_item(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```

更细的作用域规则、`global`、`nonlocal` 和 LEGB 会放到下一篇单独讲。

## 关键问题

> _Q：`*args` 和 `**kwargs` 有什么区别？_

`*args` 把多余的位置参数收集成元组，`**kwargs` 把多余的关键字参数收集成字典。

> _Q：Python 函数是一等对象是什么意思？_

意思是函数和普通值一样，可以赋给变量、作为参数传递、也可以作为返回值。

> _Q：形参和实参有什么区别？_

形参是函数定义里的变量名，实参是调用函数时传进去的具体值。

> _Q：可变默认参数的坑是什么？_

默认值在函数定义时只求值一次。如果默认值是可变对象，多次调用会共享同一个对象。常见修复方式是用 `None` 作为默认值，再在函数体里创建新对象。

> _Q：如果函数没有 `return` 会返回什么？_

会返回 `None`。

> _Q：lambda 和 `def` 有什么区别？_

lambda 是单表达式匿名函数；`def` 是完整的具名函数定义，适合更复杂也更可读的逻辑。
