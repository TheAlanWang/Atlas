---
title: "Python Interview Basics"
topic: python
section: Interview Patterns
order: 1
duration: 45
date: 2026-03-24
---

## In This Chapter

- The Python traps that interviewers ask repeatedly
- How to answer comparison questions more precisely
- Where candidates tend to overstate behavior
- Which trade-offs matter more than memorizing syntax

---

## List vs Tuple

Both are ordered sequences, but they differ in mutability:

| | `list` | `tuple` |
|---|---|---|
| Mutable | Yes | No |
| Good for | Data that changes | Fixed structure |
| Can be a dict key | No | Sometimes |

A tuple can only be a dictionary key if all of its contents are hashable.

```python
coords = (37.77, -122.42)   # usable as a dict key
bad = ([1, 2], 3)           # not hashable because it contains a list
```

## Mutable vs Immutable

One of the most common Python interview themes is object mutability:

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)   # [1, 2, 3, 4]
```

`a` and `b` point to the same list object. That is why mutating through `b` also changes `a`.

When an immutable object appears to change, Python creates a new object instead:

```python
x = "hi"
y = x
x += "!"
print(y)   # "hi"
```

## `is` vs `==`

This is a very common comparison question:

```python
a = [1, 2]
b = [1, 2]

print(a == b)   # True
print(a is b)   # False
```

- `==` compares values
- `is` compares identity

The only default rule worth memorizing is: use `is` for `None`, and use `==` for almost all value comparisons.

## Mutable Default Arguments

This is one of the most famous Python gotchas:

```python
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

add_item("a")   # ["a"]
add_item("b")   # ["a", "b"]
```

Default values are evaluated once when the function is defined, not every time the function is called.

The fix is:

```python
def add_item(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```

## Shallow Copy vs Deep Copy

Interviewers also like to check whether you understand nested mutability:

```python
import copy

original = [[1, 2], [3, 4]]
shallow = copy.copy(original)
deep = copy.deepcopy(original)

original[0].append(99)

print(shallow)  # [[1, 2, 99], [3, 4]]
print(deep)     # [[1, 2], [3, 4]]
```

- shallow copy copies the outer container
- deep copy recursively copies nested objects

## Hashable vs Immutable

A lot of candidates say "dictionary keys must be immutable." That is close, but not exact.

The stronger answer is: dictionary keys must be **hashable**.

That is why:

- strings and integers can be keys
- lists cannot be keys
- tuples can be keys only if all their elements are hashable

## The GIL

The strongest concise interview framing is:

"In CPython, the GIL prevents multiple threads from executing Python bytecode in parallel. Threads can still work well for many I/O-bound workloads, but for CPU-bound parallelism I usually think about multiprocessing."

That answer is better than either extreme:

- "threads are useless"
- "I/O is unaffected"

## `__slots__`

`__slots__` is not a beginner topic, but it still comes up in interviews:

```python
class Point:
    __slots__ = ["x", "y"]
```

The safe answer is:

- `__slots__` can reduce memory usage when you create many instances
- it restricts dynamic attribute creation
- it is a trade-off, not a default recommendation

Avoid giving fixed percentage claims unless you actually measured them in a specific workload.

## Key Questions

> _Q: Is Python pass-by-value or pass-by-reference?_

Neither in the strict language-theory sense. The usual practical answer is "Python passes object references." That is why mutating a passed-in list can affect the caller, while rebinding a local name does not.

> _Q: What is the difference between `is` and `==`?_

`==` compares values. `is` compares whether two names point to the same object. Use `is` for `None`, not for normal value comparison.

> _Q: What is the mutable default argument pitfall?_

Default arguments are evaluated once when the function is defined. If the default is mutable, multiple calls can share the same object.

> _Q: What is the difference between shallow copy and deep copy?_

Shallow copy duplicates only the outer container, while deep copy recursively duplicates nested objects too.

> _Q: Can tuples always be used as dictionary keys?_

No. Tuples are only usable as keys if all their contents are hashable.

> _Q: What is the GIL?_

In CPython, it is a lock that prevents multiple threads from executing Python bytecode in parallel within one process. Threads are still useful for many I/O-bound tasks, while CPU-bound parallelism usually points you toward multiprocessing.

> _Q: What is `__slots__` and when would you mention it?_

`__slots__` restricts allowed instance attributes and can reduce memory usage for many-instance classes. Mention it as a trade-off tool, not as a universal optimization.
