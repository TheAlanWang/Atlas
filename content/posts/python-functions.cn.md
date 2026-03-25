---
title: "Functions"
topic: python
section: Fundamentals
order: 2
duration: 30
date: 2026-03-21
---

## 定义函数

用 `def` 关键字定义函数：

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

greet("Alan")  # "Hello, Alan!"
```

`name: str` 是参数的类型注解，`-> str` 是返回值的类型注解。两者都是可选的，但建议加上。

## 参数

函数可以有零个或多个参数：

```python
def add(a: int, b: int) -> int:
    return a + b

add(3, 5)   # 8
```

**默认参数**——用 `=` 设置默认值：

```python
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

greet("Alan")            # "Hello, Alan!"
greet("Alan", "Hey")     # "Hey, Alan!"
```

有默认值的参数必须放在没有默认值的参数后面。

## 返回值

如果不写 `return`，函数默认返回 `None`：

```python
def say_hi():
    print("hi")   # 打印，但返回 None

result = say_hi()
print(result)  # None
```

可以返回多个值，Python 会把它们打包成元组：

```python
def min_max(nums: list[int]) -> tuple[int, int]:
    return min(nums), max(nums)

low, high = min_max([3, 1, 4, 1, 5])
# low = 1, high = 5
```

## *args 和 **kwargs

`*args` 把多余的位置参数收集成一个元组：

```python
def total(*args: int) -> int:
    return sum(args)

total(1, 2, 3)      # 6
total(10, 20)       # 30
```

`**kwargs` 把多余的关键字参数收集成一个字典：

```python
def display(**kwargs) -> None:
    for key, value in kwargs.items():
        print(f"{key}: {value}")

display(name="Alan", age=25)
# name: Alan
# age: 25
```

## Lambda 函数

Lambda 是一种匿名的短函数，适合简单的一行逻辑：

```python
square = lambda x: x ** 2
square(4)   # 16

# 常见用途——按某个 key 排序
names = ["Charlie", "Alan", "Bob"]
names.sort(key=lambda name: len(name))
# ["Bob", "Alan", "Charlie"]
```

Lambda 适合简单且只用一次的场景。复杂逻辑还是用 `def`。

## 作用域

函数内部定义的变量是局部变量，外部访问不到：

```python
def make_greeting():
    message = "Hello"   # 局部变量
    return message

print(message)  # NameError——这里没有 message
```

在函数内读取全局变量没问题。如果要重新赋值，需要 `global` 声明：

```python
count = 0

def increment():
    global count
    count += 1
```

实际项目里 `global` 是坏味道——优先用返回值，别去改全局变量。

## 面试常问

> **Q：`*args` 和 `**kwargs` 有什么区别？**

`*args` 把任意数量的位置参数收集成元组，`**kwargs` 把任意数量的关键字参数收集成字典。两者可以同时用：`def f(*args, **kwargs)`。

> **Q：Python 函数是"一等对象"是什么意思？**

函数可以赋值给变量、作为参数传递、也可以作为返回值——和其他普通值没有区别。这让回调、装饰器、高阶函数（`map`、`filter`、`sorted`）这些模式成为可能。

> **Q：形参和实参有什么区别？**

形参是函数定义里的变量名（`def greet(name)`）。实参是调用时传入的具体值（`greet("Alan")`）。形参定义函数期望什么，实参是你实际给的。

> **Q：可变默认参数有什么常见坑？**

默认参数的值在函数**定义时**只求值一次，不是每次调用时都重新创建。如果用可变对象（比如列表）作为默认值，所有调用共享同一个对象，可能产生意外的副作用。正确做法是把默认值设为 `None`，在函数体里再创建可变对象。

> **Q：如果函数没有 `return` 语句会返回什么？**

返回 `None`。写了 `return` 但后面没有值也一样。这是 Python 的隐式返回，意味着调用函数时要确认自己是否真的需要返回值。

> **Q：lambda 和 `def` 定义的函数有什么区别？**

lambda 是单表达式的匿名函数，写在一行，适合简短的一次性逻辑，比如排序的 key。`def` 函数可以有名字、多条语句、文档字符串和完整逻辑。如果 lambda 变得复杂，或者需要在多处复用，就改用 `def`。

> **Q：局部作用域和全局作用域有什么区别？**

函数内部定义的变量是局部变量，只在函数调用期间存在，外部不可见。模块级别定义的变量是全局变量，任何地方都能访问。要在函数内给全局变量重新赋值，必须用 `global` 声明。实际项目里修改全局变量是坏味道，优先用返回值。
