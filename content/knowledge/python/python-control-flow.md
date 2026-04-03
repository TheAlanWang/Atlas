---
title: "Control Flow"
topic: python
section: Python Basics
order: 2
duration: 20
date: 2026-03-28
---

## In This Chapter

- How `if / elif / else` works and how Python evaluates conditions
- How `for` and `while` loops work
- What `break`, `continue`, and `pass` do
- How `range()` behaves
- The `for / else` pattern

---

## if / elif / else

```python
score = 85

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("C")
# B
```

Python evaluates conditions top to bottom and stops at the first `True` branch. Only one branch runs.

**Truthiness** — Python treats these as `False`: `0`, `""`, `[]`, `{}`, `None`. Everything else is `True`.

```python
name = ""
if name:
    print("has name")
else:
    print("empty")   # prints this
```

---

## for Loops

`for` iterates over any iterable — list, string, range, dict, etc.

```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```

Use `enumerate()` when you need both index and value:

```python
for i, fruit in enumerate(fruits):
    print(i, fruit)
# 0 apple
# 1 banana
# 2 cherry
```

Use `zip()` to loop over two sequences together:

```python
names = ["Alice", "Bob"]
scores = [90, 85]
for name, score in zip(names, scores):
    print(name, score)
```

---

## range()

`range(stop)`, `range(start, stop)`, `range(start, stop, step)`:

```python
for i in range(5):       # 0 1 2 3 4
for i in range(1, 6):    # 1 2 3 4 5
for i in range(0, 10, 2): # 0 2 4 6 8
for i in range(5, 0, -1): # 5 4 3 2 1
```

`range` is lazy — it generates numbers on demand, not all at once.

---

## while Loops

Runs as long as the condition is `True`:

```python
n = 10
total = 0
while n > 0:
    total += n
    n -= 1
print(total)  # 55
```

Always make sure the condition eventually becomes `False`, or you get an infinite loop.

---

## break, continue, pass

```python
# break — exit the loop immediately
for i in range(10):
    if i == 5:
        break
    print(i)   # prints 0 1 2 3 4

# continue — skip the rest of this iteration
for i in range(5):
    if i == 2:
        continue
    print(i)   # prints 0 1 3 4

# pass — do nothing (placeholder)
for i in range(5):
    pass   # valid empty loop
```

---

## for / else

The `else` block on a loop runs if the loop completed without hitting `break`:

```python
def find_prime(nums):
    for n in nums:
        for i in range(2, n):
            if n % i == 0:
                break
        else:
            print(f"{n} is prime")

find_prime([4, 5, 6, 7])
# 5 is prime
# 7 is prime
```

This pattern avoids a flag variable.

---

## Key Questions

> _Q: What is the difference between `break` and `continue`?_

`break` exits the loop entirely — no more iterations run. `continue` skips the rest of the current iteration and moves to the next one. The loop itself keeps going after `continue`.

> _Q: What values are falsy in Python?_

`False`, `None`, `0`, `0.0`, `""` (empty string), `[]` (empty list), `{}` (empty dict/set), `()` (empty tuple). Any object with `__bool__` returning `False` or `__len__` returning `0` is also falsy.

> _Q: What does `for / else` do?_

The `else` clause on a `for` or `while` loop runs only if the loop finished normally — i.e., without hitting a `break`. It's commonly used to signal "nothing was found" after a search loop, avoiding a separate boolean flag.

> _Q: What is the difference between `range(5)` and `list(range(5))`?_

`range(5)` is a lazy range object — it doesn't store all values in memory, just computes them on demand. `list(range(5))` materializes all values into a list `[0, 1, 2, 3, 4]`. For loops, use `range` directly; only convert to a list if you need random access or slicing.

> _Q: How do you iterate over a dictionary?_

`for key in d` iterates over keys. `for key, value in d.items()` iterates over key-value pairs. `for value in d.values()` iterates over values only. In Python 3.7+, dictionaries maintain insertion order.
