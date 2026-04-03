---
title: "Testing with unittest"
topic: python
section: Testing
order: 2
duration: 20
date: 2026-03-24
---

## In This Chapter

- How to write tests using Python's built-in `unittest` framework
- How to organize test classes and use `setUp` / `tearDown`
- The most common assertion methods and when to use each
- How to run tests from the command line
- When to use `unittest` vs `pytest`

---

## What is unittest?

`unittest` is Python's built-in testing framework, so there is nothing extra to install. It is modeled after Java's JUnit, which is why tests are written as classes that inherit from `unittest.TestCase`.

```python
import unittest

class TestMath(unittest.TestCase):

    def test_add(self):
        self.assertEqual(1 + 1, 2)

    def test_subtract(self):
        self.assertEqual(5 - 3, 2)

if __name__ == "__main__":
    unittest.main()
```

Run the file directly:

```bash
python test_math.py
```

## Structure

Every test class inherits from `unittest.TestCase`, and every test method must start with `test_`.

```python
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):

    def test_positive(self):
        self.assertEqual(add(2, 3), 5)

    def test_negative(self):
        self.assertEqual(add(-1, -1), -2)

    def test_zero(self):
        self.assertEqual(add(0, 0), 0)
```

## setUp and tearDown

`setUp` runs before each test. `tearDown` runs after each test, even if the test fails:

```python
class TestDatabase(unittest.TestCase):

    def setUp(self):
        self.db = connect_database()   # runs before every test

    def tearDown(self):
        self.db.close()                # runs after every test

    def test_insert(self):
        self.db.insert("item")
        self.assertEqual(self.db.count(), 1)
```

## Assertion Methods

`unittest` uses assertion methods instead of plain `assert`:

| Method | Checks |
|--------|--------|
| `assertEqual(a, b)` | `a == b` |
| `assertNotEqual(a, b)` | `a != b` |
| `assertTrue(x)` | `bool(x) is True` |
| `assertFalse(x)` | `bool(x) is False` |
| `assertIsNone(x)` | `x is None` |
| `assertIn(a, b)` | `a in b` |
| `assertRaises(Error, func, *args)` | func raises Error |

```python
def test_raises(self):
    with self.assertRaises(ValueError):
        int("not a number")
```

## pytest vs unittest

| | pytest | unittest |
|---|--------|---------|
| Installation | `pip install pytest` | Built-in |
| Test style | Plain functions | Classes inheriting `TestCase` |
| Assertions | Plain `assert` | `self.assertEqual(...)` etc. |
| Setup/teardown | `@pytest.fixture` | `setUp` / `tearDown` |
| Output | Detailed, readable | Minimal |
| Runs unittest tests | ✅ Yes | — |

pytest can discover and run `unittest`-style tests automatically, so the two work well together. Most new projects prefer pytest; `unittest` still shows up often in older codebases, internal tooling, and standard library code.

## Key Questions

> _Q: What is the difference between pytest and unittest?_

`unittest` is Python's built-in framework, modeled after Java's JUnit — tests are written as methods inside a class that inherits from `unittest.TestCase`, and assertions use methods like `self.assertEqual()`. `pytest` is a third-party library where tests are plain functions using `assert`. pytest produces more readable output and has more powerful features (fixtures, parametrize). pytest can also run `unittest` tests, so they're compatible.

> _Q: What is the purpose of `setUp` and `tearDown` in unittest?_

`setUp` runs before each individual test method to prepare the test environment (e.g., create a database connection, initialize objects). `tearDown` runs after each test to clean up — even if the test failed. They're the `unittest` equivalent of pytest's fixture setup and teardown with `yield`.

> _Q: Why does unittest use `self.assertEqual()` instead of plain `assert`?_

`self.assertEqual()` and other `TestCase` assertion methods provide better failure messages — they show you the actual vs. expected values when a test fails. Plain `assert` just raises `AssertionError` with no details. pytest works around this by rewriting `assert` statements at collection time to produce similarly detailed output.
