---
title: "Sets and Tuples"
topic: python
section: Data Structures
order: 2
duration: 20
date: 2026-03-28
---

## In This Chapter

- What tuples are and when to use them over lists
- How to pack and unpack tuples
- What sets are and how they enforce uniqueness
- Set operations: union, intersection, difference
- The performance characteristics of sets vs lists

---

## Tuples

A tuple is an **immutable**, ordered sequence. Once created, its contents can't change.

```python
point = (3, 4)
rgb = (255, 128, 0)
single = (42,)   # trailing comma required for single-element tuple
empty = ()
```

You can also create tuples without parentheses — Python infers them from the commas:

```python
coords = 3, 4    # same as (3, 4)
```

Access elements the same way as lists (index, slice):

```python
point[0]    # 3
point[-1]   # 4
point[0:2]  # (3, 4)
```

---

## When to Use Tuples vs Lists

Use a **tuple** when the collection is fixed and its position has meaning:

```python
# Good uses of tuples
rgb = (255, 128, 0)           # fixed 3-component color
coordinates = (lat, lon)       # positional meaning
return x, y                    # returning multiple values
```

Use a **list** when the collection is mutable or homogeneous:

```python
scores = [88, 92, 75]          # may change
names = ["Alice", "Bob"]       # may grow/shrink
```

Tuples are also slightly faster in many cases and can be used as dictionary keys when all of their contents are hashable (lists can't).

---

## Unpacking

Unpacking assigns tuple elements to variables in one line:

```python
x, y = (3, 4)
name, age, city = ("Alan", 25, "Boston")

# swap two variables without a temp
a, b = 1, 2
a, b = b, a
```

Use `*` to capture the rest:

```python
first, *rest = (1, 2, 3, 4, 5)
# first = 1, rest = [2, 3, 4, 5]

*head, last = (1, 2, 3, 4, 5)
# head = [1, 2, 3, 4], last = 5
```

---

## Sets

A set is an **unordered** collection of **unique** elements. Duplicates are automatically removed.

```python
tags = {"python", "backend", "python"}
print(tags)   # {"python", "backend"} — duplicate removed
```

Create an empty set with `set()` (not `{}` — that's an empty dict):

```python
empty = set()
```

Common operations:

```python
s = {1, 2, 3}
s.add(4)         # {1, 2, 3, 4}
s.discard(2)     # {1, 3, 4} — no error if missing
s.remove(3)      # {1, 4}   — KeyError if missing
3 in s           # False — O(1) lookup
```

---

## Set Operations

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b   # union:        {1, 2, 3, 4, 5, 6}
a & b   # intersection: {3, 4}
a - b   # difference:   {1, 2}
a ^ b   # symmetric diff: {1, 2, 5, 6}
```

These also work as methods: `a.union(b)`, `a.intersection(b)`, etc.

---

## Sets for Deduplication and Fast Lookup

```python
# deduplicate a list (order not preserved)
unique = list(set([1, 2, 2, 3, 3, 3]))
# [1, 2, 3]

# O(1) membership test vs O(n) for list
valid_ids = {101, 102, 103}
if user_id in valid_ids:   # fast
    ...
```

---

## Key Questions

> _Q: What is the difference between a list and a tuple?_

Lists are mutable — you can add, remove, or change elements. Tuples are immutable — once created, they can't be modified. Use tuples for fixed data where position has meaning (e.g., coordinates, RGB values, function return values). Tuples can be used as dictionary keys; lists cannot. Tuples are also marginally faster to iterate and create.

> _Q: Why can't you use a list as a dictionary key?_

Dictionary keys must be **hashable** — they need a stable hash value that doesn't change over time. Lists are mutable, so their contents (and thus their hash) could change, breaking the dictionary's internal structure. Tuples are immutable and hashable, so they can be used as keys.

> _Q: How does a set enforce uniqueness?_

A set is implemented as a hash table. When you add an element, Python computes its hash and checks if that hash already exists. If so, the element is not added. This means all elements in a set must be hashable, and membership testing is O(1) regardless of set size.

> _Q: What is the time complexity of `in` for a list vs a set?_

For a list, `x in list` is O(n) — it scans every element until it finds a match. For a set, `x in set` is O(1) on average because sets use a hash table for direct lookup. If you're doing many membership checks, convert the list to a set first.

> _Q: What is the difference between `discard()` and `remove()` on a set?_

Both remove an element. `remove()` raises a `KeyError` if the element isn't in the set. `discard()` does nothing if the element is missing. Use `discard()` when the element may or may not be present; use `remove()` when its absence would be a bug.
