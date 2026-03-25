---
title: "Lists and Dictionaries"
topic: python
section: Fundamentals
order: 3
duration: 25
date: 2026-03-25
---

## What You'll Learn

- How to store and manipulate ordered data with lists
- How to use list comprehensions for clean, concise transformations
- How to work with key-value pairs using dictionaries
- The difference between `[]` and `.get()` — and why it matters in production
- Time complexity of common list and dict operations (asked in interviews)

---

## Lists

A list is an ordered, mutable collection of items. Items can be of any type.

```python
fruits = ["apple", "banana", "cherry"]
nums = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]
```

### Accessing Items

Use zero-based indexing. Negative indexes count from the end:

```python
fruits = ["apple", "banana", "cherry"]

fruits[0]   # "apple"
fruits[-1]  # "cherry"
fruits[1:3] # ["banana", "cherry"]  — slicing
```

### Common List Methods

```python
fruits = ["apple", "banana"]

fruits.append("cherry")       # add to end
fruits.insert(1, "mango")     # insert at index
fruits.remove("banana")       # remove by value
fruits.pop()                  # remove and return last item
fruits.pop(0)                 # remove and return at index
fruits.sort()                 # sort in place
fruits.reverse()              # reverse in place
len(fruits)                   # length
"apple" in fruits             # True/False membership check
```

### List Comprehensions

A concise way to create a new list from an existing one:

```python
# basic
squares = [x ** 2 for x in range(5)]
# [0, 1, 4, 9, 16]

# with condition
evens = [x for x in range(10) if x % 2 == 0]
# [0, 2, 4, 6, 8]

# transform strings
words = ["hello", "world"]
upper = [w.upper() for w in words]
# ["HELLO", "WORLD"]
```

List comprehensions are more readable and faster than a `for` loop with `.append()`.

---

## Dictionaries

A dictionary stores key-value pairs. Keys must be unique and immutable (strings, numbers, tuples).

```python
person = {
    "name": "Alan",
    "age": 25,
    "city": "San Francisco"
}
```

### Accessing and Modifying

```python
person["name"]              # "Alan"
person.get("age")           # 25
person.get("email", "N/A")  # "N/A" — default if key missing

person["age"] = 26          # update
person["email"] = "a@b.com" # add new key
del person["city"]          # delete key
```

Use `.get()` instead of `[]` when the key might not exist — `[]` raises a `KeyError`, `.get()` returns `None` (or a default).

### Common Dict Methods

```python
person.keys()    # dict_keys(["name", "age"])
person.values()  # dict_values(["Alan", 26])
person.items()   # dict_items([("name", "Alan"), ("age", 26)])

"name" in person  # True — check if key exists
person.pop("age") # remove and return value
```

### Iterating

```python
for key, value in person.items():
    print(f"{key}: {value}")
```

### Dict Comprehensions

```python
squares = {x: x ** 2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
```

---

## Interview Questions

> _Q: What is the difference between a list and a tuple?_

Both are ordered sequences, but lists are mutable (you can add, remove, or change items) while tuples are immutable (fixed after creation). Use tuples for data that should not change, like coordinates or function return values. Tuples are also slightly faster and can be used as dictionary keys.

> _Q: What is the time complexity of common list operations?_

Appending to the end is O(1). Inserting or removing at an arbitrary index is O(n) because all subsequent items must shift. Checking membership with `in` is O(n). For fast membership checks, use a set or dict instead — both offer O(1) lookup.

> _Q: What is the difference between `remove()` and `pop()`?_

`remove(value)` searches for the first occurrence of a value and removes it — raises `ValueError` if not found. `pop(index)` removes and returns the item at a given index (defaults to the last item). Use `remove` when you know the value, `pop` when you know the position or need the removed item.

> _Q: What is the difference between `dict[key]` and `dict.get(key)`?_

`dict[key]` raises a `KeyError` if the key does not exist. `dict.get(key)` returns `None` by default, or a custom fallback: `dict.get(key, default)`. In production code, prefer `.get()` unless a missing key genuinely represents a bug.

> _Q: How do you merge two dictionaries?_

In Python 3.9+, use the `|` operator: `merged = dict1 | dict2`. In earlier versions, use `{**dict1, **dict2}`. If both dicts share a key, the right-hand side wins.

> _Q: What is a list comprehension and when should you use it?_

A list comprehension is a concise, readable way to create a list by transforming or filtering another iterable — `[expr for item in iterable if condition]`. Use it for simple transformations. If the logic requires multiple lines or nested conditions, a regular `for` loop is more readable.

> _Q: How is a dictionary ordered in Python?_

As of Python 3.7, dictionaries maintain insertion order — the order you add keys is the order you get them back when iterating. Before 3.7, order was not guaranteed. In practice, you can rely on this behavior in any modern Python code.
