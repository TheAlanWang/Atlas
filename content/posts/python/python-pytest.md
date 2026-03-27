---
title: "Testing with pytest"
topic: python
section: Testing
order: 1
duration: 30
date: 2026-03-24
---

## What You'll Learn

By the end of this section, you'll be able to:

- Write and run basic tests using pytest
- Organize tests in a proper project structure
- Test that functions raise the right exceptions with `pytest.raises`
- Set up reusable test data using fixtures
- Run the same test with multiple inputs using `@pytest.mark.parametrize`

---

## Why Test?

Tests verify that your code does what you expect — and keeps doing it after you make changes. Without tests, every change is a guess.

pytest is the standard testing library in Python. It's minimal to write, easy to read, and powerful enough for large projects.

```bash
pip install pytest
```

## Your First Test

A test is just a function that starts with `test_`. pytest finds and runs them automatically:

```python
# test_math.py
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
```

Run it:

```bash
pytest test_math.py
```

`assert` is the core of every test — if the expression is `False`, the test fails.

## Project Structure

Keep tests in a separate `tests/` directory:

```
project/
├── app/
│   └── calculator.py
└── tests/
    └── test_calculator.py
```

```python
# tests/test_calculator.py
from app.calculator import add, divide

def test_add():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0
```

One file per module, prefix each file with `test_`.

## Testing Exceptions

Use `pytest.raises` to verify that code raises the right exception:

```python
import pytest

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)
```

## Fixtures

Fixtures set up reusable test data or state. `@pytest.fixture` is a built-in decorator that comes with pytest — you just need to import pytest to use it.

```python
import pytest

@pytest.fixture
def sample_list():
    return [1, 2, 3, 4, 5]

def test_length(sample_list):
    assert len(sample_list) == 5

def test_sum(sample_list):
    assert sum(sample_list) == 15
```

pytest injects the fixture automatically when the test function has a parameter with the same name. The mechanism is provided by pytest; the fixture itself (`sample_list`) is yours to write.

pytest also ships with a set of built-in fixtures you can use without defining anything:

| Fixture | What it gives you |
|---------|-------------------|
| `tmp_path` | A temporary directory unique to the test run |
| `capsys` | Captures stdout/stderr so you can assert on `print()` output |
| `monkeypatch` | Temporarily replaces functions, env variables, or attributes |
| `capfd` | Like `capsys` but works at the file descriptor level |

```python
def test_write_file(tmp_path):
    f = tmp_path / "hello.txt"
    f.write_text("hello")
    assert f.read_text() == "hello"
```

Just add the built-in fixture name as a parameter — pytest handles the rest.

### Teardown with `yield`

Use `yield` instead of `return` to run cleanup code after the test finishes:

```python
@pytest.fixture
def db_connection():
    conn = open_database()   # setup — runs before the test
    yield conn               # the test receives `conn` here
    conn.close()             # teardown — runs after the test, even if it fails
```

Everything before `yield` is setup. Everything after is teardown. pytest guarantees the teardown runs even if the test raises an exception.

## Parametrize

Run the same test with multiple inputs using `@pytest.mark.parametrize`:

```python
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (100, -50, 50),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
```

Instead of writing four separate test functions, you write one.

## Running Tests

### Test Discovery

Running `pytest` from the project root automatically scans all subdirectories recursively. You don't need to specify any paths:

```
project/
├── tests/
│   ├── test_math.py      ← discovered
│   └── test_database.py  ← discovered
└── src/
    └── test_utils.py     ← also discovered
```

pytest discovers tests by looking for:
- Files named `test_*.py` or `*_test.py`
- Functions starting with `test_`
- Classes starting with `Test`

### Scoping Commands

```bash
pytest                                    # run everything
pytest tests/                            # run all tests in a directory
pytest tests/test_math.py                # run a specific file
pytest tests/test_math.py::test_add      # run one specific test
pytest -k "add"                          # run tests whose name contains "add"
pytest -v                                # verbose output
pytest -x                                # stop on first failure
```

### What the Output Looks Like

A passing run:

```
============================= test session starts ==============================
platform darwin -- Python 3.12.0, pytest-8.1.0
rootdir: /project
collected 4 items

tests/test_math.py ....                                                  [100%]

============================== 4 passed in 0.02s ===============================
```

Each `.` is one passing test. With `-v` (verbose), you see each test name:

```
============================= test session starts ==============================
collected 4 items

tests/test_math.py::test_add PASSED                                      [ 25%]
tests/test_math.py::test_add_negative PASSED                             [ 50%]
tests/test_math.py::test_subtract PASSED                                 [ 75%]
tests/test_math.py::test_divide PASSED                                   [100%]

============================== 4 passed in 0.02s ===============================
```

When a test fails:

```
============================= test session starts ==============================
collected 4 items

tests/test_math.py .F..                                                  [ 75%]

=================================== FAILURES ===================================
_______________________________ test_subtract _______________________________

    def test_subtract():
>       assert subtract(5, 3) == 3
E       AssertionError: assert 2 == 3

tests/test_math.py:12: AssertionError
========================= 1 failed, 3 passed in 0.05s ==========================
```

`F` means failed, `.` means passed. pytest shows you the exact line, the actual value (`2`), and the expected value (`3`).

## Interview Questions

> _Q: What is the difference between `pytest` and `unittest`?_

`unittest` is Python's built-in testing framework, modeled after Java's JUnit — tests are written as classes inheriting from `unittest.TestCase`. `pytest` is a third-party library with simpler syntax: tests are plain functions using `assert`. pytest can also run `unittest`-style tests, so the two are compatible.

> _Q: What is a fixture in pytest?_

A fixture is a function decorated with `@pytest.fixture` that provides reusable setup for tests. Instead of duplicating setup code in every test, you define it once as a fixture and inject it by name. Fixtures can also handle teardown using `yield`.

> _Q: What does `assert` do in a pytest test?_

`assert` checks that an expression is `True`. If it's `False`, pytest catches the `AssertionError`, marks the test as failed, and shows you the actual vs. expected values. In regular Python code, a failed `assert` raises an exception — pytest hooks into this to produce readable failure messages.

> _Q: What is `@pytest.mark.parametrize` used for?_

It lets you run the same test function with multiple sets of inputs and expected outputs without duplicating code. You declare argument names and a list of value tuples, and pytest generates a separate test case for each row. This keeps tests concise and makes it easy to add edge cases.

> _Q: How do you test that a function raises an exception in pytest?_

Use `pytest.raises` as a context manager: `with pytest.raises(SomeException): call_that_raises()`. If the block does not raise the expected exception, the test fails. You can also capture the exception info with `as exc_info` to assert on the message.

> _Q: What is the naming convention for test files and test functions in pytest?_

Test files should be named with the `test_` prefix (e.g., `test_calculator.py`). Test functions and methods must also start with `test_` (e.g., `def test_add()`). pytest discovers tests automatically by following these naming conventions, so nothing else needs to be configured.

> _Q: How do you handle teardown (cleanup) in a pytest fixture?_

Use `yield` instead of `return` in the fixture. Everything before `yield` is setup; everything after is teardown and runs after the test completes — even if the test fails. For example, you can open a database connection before `yield` and close it after.
