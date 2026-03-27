---
title: "Variables & Types"
topic: python
section: Fundamentals
order: 1
duration: 20
date: 2026-03-21
---

## 变量

Python 变量不需要声明类型，直接赋值就能用：

```python
name = "Alan"
age = 25
height = 1.80
is_student = True
```

Python 是**动态类型**语言——类型由运行时的值决定，不是由变量名决定。同一个变量可以在不同时候存放不同类型的值：

```python
x = 10      # x 是 int
x = "hello" # 现在 x 是 str——完全合法
```

## 基本类型

| 类型 | 示例 | 说明 |
|------|------|------|
| `int` | `42`, `-7` | 整数，没有大小限制 |
| `float` | `3.14`, `-0.5` | 浮点数 |
| `str` | `"hello"`, `'world'` | 字符串，不可变 |
| `bool` | `True`, `False` | `int` 的子类（`True == 1`） |
| `NoneType` | `None` | 表示"没有值" |

```python
score = 95          # int
gpa = 3.8           # float
major = "CS"        # str
graduated = False   # bool
mentor = None       # NoneType
```

## 查看类型

用 `type()` 查看值的类型，用 `isinstance()` 判断是否匹配：

```python
type(42)         # <class 'int'>
type("hello")    # <class 'str'>

isinstance(42, int)      # True
isinstance(42, float)    # False
isinstance(True, int)    # True——bool 是 int 的子类
```

实际代码里优先用 `isinstance()`，它能正确处理继承关系。

## 类型转换

显式地在类型之间转换：

```python
int("42")       # 42
float("3.14")   # 3.14
str(100)        # "100"
bool(0)         # False
bool("hello")   # True
```

**假值（Falsy）**——这些在布尔上下文中都等于 `False`：

```python
bool(0)     # False
bool(0.0)   # False
bool("")    # False
bool([])    # False
bool(None)  # False
```

其他值都是真值（Truthy）。

## 类型注解

Python 3.5+ 支持可选的类型注解。注解不会在运行时强制类型，但能帮助编辑器发现 bug，也让代码更易读：

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

age: int = 25
scores: list[int] = [90, 85, 92]
```

在大型项目中类型注解越来越普遍，生产环境的 Python 代码基本都会加。

## 可变 vs 不可变

这个区别在传参和复制数据时很重要：

| 不可变 | 可变 |
|--------|------|
| `int`, `float`, `bool` | `list` |
| `str` | `dict` |
| `tuple` | `set` |

**不可变**——不能原地修改，操作会返回新值：

```python
s = "hello"
s.upper()      # 返回 "HELLO"——s 本身还是 "hello"
s = s.upper()  # 要更新就重新赋值
```

**可变**——可以原地修改：

```python
fruits = ["apple", "banana"]
fruits.append("cherry")  # 修改的是原来那个 list
```

## 面试常问

> _Q：`is` 和 `==` 有什么区别？_

`==` 比较两个值是否相等。`is` 比较两个变量是否指向内存中**同一个对象**。大多数情况用 `==`；判断 `None` 时用 `is`：`if x is None`。

> _Q：为什么 Python 里 `bool` 是 `int` 的子类？_

历史原因——Python 把 `bool` 设计为 `int` 的子类，这样 `True` 和 `False` 可以直接参与算术运算（`True + True == 2`）。因此 `isinstance(True, int)` 返回 `True`。

> _Q："动态类型"是什么意思？_

类型附着在**值**上，不在变量上。变量只是指向对象的名字，同一个名字可以在不同时候指向不同类型的对象。这和 Java 等静态类型语言不同——在那些语言里，类型声明在变量本身，不能改变。

> _Q：Python 的假值（falsy values）有哪些？_

假值包括：`0`、`0.0`、`""`（空字符串）、`[]`（空列表）、`{}`（空字典）、`set()`（空集合）、`None` 和 `False`。其他值都是真值。在 `if` 条件等布尔上下文中，这些值都会被当作 `False` 处理。

> _Q：可变类型和不可变类型有什么区别？为什么重要？_

不可变类型（`int`、`float`、`str`、`tuple`）创建后不能修改，操作它们会返回新对象。可变类型（`list`、`dict`、`set`）可以原地修改。这在传参时很关键：函数内修改可变对象会影响调用方的原始对象，而对不可变对象重新赋值则不会。

> _Q：Python 类型注解有什么用？它们会在运行时强制检查类型吗？_

类型注解（如 `name: str`、`-> int`）用于说明变量、参数和返回值的预期类型。它们不会在运行时做任何强制检查，Python 执行时会直接忽略。它们的价值在于配合静态分析工具（mypy、Pyright）和 IDE，在运行前就发现类型错误。

> _Q：`type()` 和 `isinstance()` 有什么区别？_

`type(x)` 返回 `x` 的精确类型。`isinstance(x, T)` 在 `x` 是 `T` 或 `T` 的任意子类的实例时返回 `True`。大多数情况优先用 `isinstance()`——例如 `isinstance(True, int)` 返回 `True`（因为 `bool` 是 `int` 的子类），而 `type(True) == int` 返回 `False`。
