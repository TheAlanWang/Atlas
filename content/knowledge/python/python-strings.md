---
title: "Strings"
topic: python
section: Data Structures
order: 3
duration: 20
date: 2026-03-28
---

## In This Chapter

- How strings work in Python (immutable sequences)
- Slicing and indexing
- The most important string methods
- f-strings and other formatting options
- String encoding basics

---

## Strings Are Immutable Sequences

A string is an ordered, immutable sequence of Unicode characters.

```python
s = "hello"
s[0]       # "h"
s[-1]      # "o"
s[1:4]     # "ell"
s[::-1]    # "olleh" — reversed
len(s)     # 5
```

Because strings are immutable, you can't change a character in place:

```python
s[0] = "H"   # TypeError
```

To "modify" a string, you create a new one.

---

## Common String Methods

```python
s = "  Hello, World!  "

s.strip()          # "Hello, World!"     — remove whitespace
s.lower()          # "  hello, world!  "
s.upper()          # "  HELLO, WORLD!  "
s.replace("World", "Python")   # "  Hello, Python!  "
s.split(",")       # ["  Hello", " World!  "]
",".join(["a","b","c"])        # "a,b,c"

"hello".startswith("he")  # True
"hello".endswith("lo")    # True
"hello".find("ll")        # 2 (index), -1 if not found
"hello".count("l")        # 2
"  ".isspace()            # True
"abc123".isalnum()        # True
```

---

## f-strings (Recommended)

f-strings evaluate expressions inside `{}` at runtime:

```python
name = "Alan"
score = 95.5

print(f"Hello, {name}!")           # Hello, Alan!
print(f"Score: {score:.1f}")       # Score: 95.5
print(f"Double: {score * 2}")      # Double: 191.0
print(f"{name!r}")                 # 'Alan' — repr
print(f"{score:>10.2f}")           # right-aligned, 2 decimal places
```

f-strings are the preferred way to format strings in modern Python (3.6+).

---

## Other Formatting Options

```python
# .format() — older style
"Hello, {}!".format("Alan")
"Hello, {name}!".format(name="Alan")

# % formatting — legacy, avoid in new code
"Hello, %s!" % "Alan"
```

---

## Splitting and Joining

```python
csv = "alice,bob,charlie"
names = csv.split(",")        # ["alice", "bob", "charlie"]

# join is the inverse of split
",".join(names)               # "alice,bob,charlie"

# split on whitespace by default
"hello world".split()         # ["hello", "world"]

# splitlines — split on line breaks
"line1\nline2\nline3".splitlines()  # ["line1", "line2", "line3"]
```

---

## Checking Contents

```python
s = "Hello123"
s.isalpha()    # False  — not all alpha (has digits)
s.isdigit()    # False
s.isalnum()    # True   — all alphanumeric
s.islower()    # False
s.isupper()    # False
"  \t\n".isspace()  # True
```

---

## String Multiplication and Concatenation

```python
"ha" * 3           # "hahaha"
"hello" + " world" # "hello world"

# avoid += in a loop — creates a new string each time
# use join instead:
parts = ["a", "b", "c"]
result = "".join(parts)   # "abc" — O(n) total
```

---

## Key Questions

> _Q: Why is string concatenation with `+=` in a loop inefficient?_

Strings are immutable, so `+=` creates a brand new string on every iteration — copying all previous characters plus the new one. In a loop of n iterations, this is O(n²) total. The fix is to collect parts in a list and call `"".join(parts)` once at the end, which is O(n).

> _Q: What is the difference between `find()` and `index()`?_

Both search for a substring and return the starting index. `find()` returns `-1` if not found. `index()` raises a `ValueError` if not found. Use `find()` when absence is expected and you'll check the return value; use `index()` when you expect the substring to always be present.

> _Q: Are strings mutable in Python?_

No. Strings are immutable — you cannot change a character in place. Any method that appears to modify a string (like `replace()`, `upper()`, `strip()`) actually returns a **new** string. The original is unchanged.

> _Q: What is the difference between `str` and `bytes`?_

`str` is a sequence of Unicode characters (text). `bytes` is a sequence of raw bytes (binary data). You convert between them with `encode()` and `decode()`, specifying an encoding like `"utf-8"`. When reading files or network data, you usually deal with `bytes` first, then decode to `str`.

> _Q: How do you reverse a string in Python?_

The idiomatic way is slicing with a step of -1: `s[::-1]`. This creates a new reversed string. You can also use `"".join(reversed(s))`, but slicing is more Pythonic and faster.
