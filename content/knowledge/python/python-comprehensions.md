---
title: "Comprehensions"
topic: python
section: Data Structures
order: 4
duration: 20
date: 2026-03-28
---

## In This Chapter

- List, dict, and set comprehensions
- Filtering with conditions in comprehensions
- Generator expressions
- Nested comprehensions
- When to use comprehensions vs regular loops

---

## List Comprehensions

A list comprehension builds a new list by applying an expression to each element of an iterable:

```python
# regular loop
squares = []
for x in range(10):
    squares.append(x ** 2)

# list comprehension
squares = [x ** 2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

**Syntax:** `[expression for item in iterable]`

---

## Filtering with if

Add an `if` condition to filter elements:

```python
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

words = ["hello", "world", "python", "is", "great"]
long_words = [w for w in words if len(w) > 4]
# ["hello", "world", "python", "great"]
```

**Syntax:** `[expression for item in iterable if condition]`

---

## Dict Comprehensions

```python
# flip keys and values
original = {"a": 1, "b": 2, "c": 3}
flipped = {v: k for k, v in original.items()}
# {1: "a", 2: "b", 3: "c"}

# build a dict from a list
names = ["Alice", "Bob", "Charlie"]
name_lengths = {name: len(name) for name in names}
# {"Alice": 5, "Bob": 3, "Charlie": 7}
```

**Syntax:** `{key_expr: value_expr for item in iterable}`

---

## Set Comprehensions

```python
# unique first letters
words = ["apple", "avocado", "banana", "blueberry"]
first_letters = {w[0] for w in words}
# {"a", "b"}
```

**Syntax:** `{expression for item in iterable}`

---

## Generator Expressions

Generator expressions are like list comprehensions but **lazy** — they produce values one at a time without building the whole list in memory:

```python
# list comprehension — builds entire list in memory
total = sum([x ** 2 for x in range(1_000_000)])

# generator expression — produces values on demand
total = sum(x ** 2 for x in range(1_000_000))  # note: no brackets
```

When passing to a function that consumes one element at a time (like `sum`, `max`, `any`), prefer generator expressions.

---

## Nested Comprehensions

Flatten a 2D list:

```python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [n for row in matrix for n in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

Read nested comprehensions left to right — `for row in matrix` runs first, then `for n in row`.

Transpose a matrix:

```python
transposed = [[row[i] for row in matrix] for i in range(3)]
# [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
```

If it's hard to read, a regular loop is clearer.

---

## When to Use Comprehensions

**Use comprehensions when:**
- You're transforming or filtering a collection into a new one
- The logic fits in one line and reads naturally

**Use regular loops when:**
- You have multiple side effects per iteration
- The logic is complex (multi-step, nested conditions)
- You need `break` or `continue`

```python
# too complex for a comprehension — use a loop
result = []
for x in data:
    processed = step_one(x)
    if validate(processed):
        result.append(step_two(processed))
```

---

## Key Questions

> _Q: What is the difference between a list comprehension and a generator expression?_

A list comprehension `[x for x in ...]` evaluates eagerly — it builds and stores the entire list in memory immediately. A generator expression `(x for x in ...)` evaluates lazily — it yields one value at a time and uses O(1) memory. For large datasets or when only iterating once, prefer generator expressions.

> _Q: What is the order of evaluation in a nested comprehension like `[x for row in matrix for x in row]`?_

Left to right, same as nested `for` loops. `for row in matrix` is the outer loop, `for x in row` is the inner loop. It's equivalent to: `for row in matrix: for x in row: result.append(x)`.

> _Q: Can you use a comprehension with multiple conditions?_

Yes. You can chain multiple `if` clauses: `[x for x in range(100) if x % 2 == 0 if x % 3 == 0]`. Multiple `if` clauses are combined with `and`. You can also use a single `if` with `and`: `if x % 2 == 0 and x % 3 == 0` — both are equivalent.

> _Q: When would you choose a regular loop over a list comprehension?_

When the body has side effects (printing, writing to a file, modifying external state), when you need `break` or `continue`, or when the logic is complex enough that a comprehension hurts readability. Comprehensions should express a transformation clearly — if you have to think hard to parse it, use a loop.
