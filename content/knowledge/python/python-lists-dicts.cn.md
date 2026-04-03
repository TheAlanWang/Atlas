---
title: "列表与字典"
topic: python
section: Data Structures
order: 1
duration: 25
date: 2026-03-25
---

## 本章内容

- 用列表存储和操作有序数据
- 用列表推导式写出简洁的转换逻辑
- 用字典存储键值对数据
- `[]` 和 `.get()` 的区别——以及为什么生产代码里要用 `.get()`
- 常见列表和字典操作的时间复杂度（面试高频）

---

## 列表

列表是有序、可变的集合，元素可以是任意类型。

```python
fruits = ["apple", "banana", "cherry"]
nums = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]
```

### 访问元素

使用从 0 开始的索引。负数索引从末尾往前数：

```python
fruits = ["apple", "banana", "cherry"]

fruits[0]   # "apple"
fruits[-1]  # "cherry"
fruits[1:3] # ["banana", "cherry"]  — 切片
```

### 常用列表方法

```python
fruits = ["apple", "banana"]

fruits.append("cherry")       # 追加到末尾
fruits.insert(1, "mango")     # 在指定位置插入
fruits.remove("banana")       # 按值删除
fruits.pop()                  # 删除并返回最后一个元素
fruits.pop(0)                 # 删除并返回指定位置的元素
fruits.sort()                 # 原地排序
fruits.reverse()              # 原地反转
len(fruits)                   # 长度
"apple" in fruits             # True/False 成员检查
```

### 列表推导式

从现有列表创建新列表的简洁写法：

```python
# 基本用法
squares = [x ** 2 for x in range(5)]
# [0, 1, 4, 9, 16]

# 加条件过滤
evens = [x for x in range(10) if x % 2 == 0]
# [0, 2, 4, 6, 8]

# 转换字符串
words = ["hello", "world"]
upper = [w.upper() for w in words]
# ["HELLO", "WORLD"]
```

对简单转换来说，列表推导式通常更简洁，也往往更快。但一旦逻辑变复杂，普通 `for` 循环会更好读。

---

## 字典

字典存储键值对。键必须唯一且可哈希。

```python
person = {
    "name": "Alan",
    "age": 25,
    "city": "San Francisco"
}
```

### 访问和修改

```python
person["name"]              # "Alan"
person.get("age")           # 25
person.get("email", "N/A")  # "N/A" — 键不存在时返回默认值

person["age"] = 26          # 更新
person["email"] = "a@b.com" # 新增键
del person["city"]          # 删除键
```

当键缺失是正常情况时，用 `.get()` 更合适；当键缺失应该被视为真正 bug 时，用 `[]` 更合适。

### 常用字典方法

```python
person.keys()    # dict_keys(["name", "age"])
person.values()  # dict_values(["Alan", 26])
person.items()   # dict_items([("name", "Alan"), ("age", 26)])

"name" in person  # True — 判断键是否存在
person.pop("age") # 删除并返回对应值
```

### 遍历字典

```python
for key, value in person.items():
    print(f"{key}: {value}")
```

### 字典推导式

```python
squares = {x: x ** 2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
```

---

## 关键问题

> _Q：列表和元组有什么区别？_

两者都是有序序列，但列表可变（可以增删改元素），元组不可变（创建后不能修改）。数据不需要改变时用元组，比如坐标或函数返回值。只有当元组内部元素都可哈希时，它才能作为字典键。

> _Q：常见列表操作的时间复杂度是多少？_

追加到末尾是 O(1)。在任意位置插入或删除是 O(n)，因为后面所有元素都要移位。用 `in` 判断成员是 O(n)。需要快速成员检查时，用集合或字典——两者的查找都是 O(1)。

> _Q：`remove()` 和 `pop()` 有什么区别？_

`remove(value)` 找到第一个匹配值并删除，找不到会抛出 `ValueError`。`pop(index)` 删除并返回指定位置的元素（默认最后一个）。知道值用 `remove`，知道位置或需要拿到被删元素用 `pop`。

> _Q：`dict[key]` 和 `dict.get(key)` 有什么区别？_

`dict[key]` 在键不存在时抛出 `KeyError`。`dict.get(key)` 默认返回 `None`，也可以指定默认值。缺键属于正常控制流时用 `.get()`；缺键应该失败时用 `[]`。

> _Q：怎么合并两个字典？_

Python 3.9+ 用 `|` 运算符：`merged = dict1 | dict2`。旧版本用 `{**dict1, **dict2}`。两个字典有相同的键时，右边的值会覆盖左边的。

> _Q：什么是列表推导式，什么时候用？_

列表推导式是通过转换或过滤另一个可迭代对象来创建新列表的简洁写法——`[expr for item in iterable if condition]`。适合简单的转换逻辑。如果逻辑比较复杂或有多层嵌套，普通 `for` 循环更易读。

> _Q：Python 的字典有顺序吗？_

Python 3.7 开始，字典保持插入顺序——键的顺序就是你添加它们的顺序。3.7 之前顺序不保证。现代 Python 代码可以直接依赖这个特性。
