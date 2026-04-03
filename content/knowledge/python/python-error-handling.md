---
title: "Error Handling"
topic: python
section: Python Basics
order: 3
duration: 20
date: 2026-03-28
---

## In This Chapter

- How `try / except / else / finally` works
- How to catch specific exceptions vs broad ones
- How to raise exceptions with `raise`
- How to define custom exceptions
- Common built-in exception types

---

## try / except

Wrap code that might fail in a `try` block. If an exception is raised, execution jumps to the matching `except` block:

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("can't divide by zero")
```

Always catch the most specific exception you can. Catching `Exception` or bare `except:` hides bugs.

---

## Catching Multiple Exceptions

```python
try:
    val = int(input("enter number: "))
    print(10 / val)
except ValueError:
    print("not a number")
except ZeroDivisionError:
    print("can't be zero")
```

Or group them in a tuple:

```python
except (ValueError, ZeroDivisionError) as e:
    print(f"bad input: {e}")
```

The `as e` binds the exception object so you can inspect its message.

---

## else and finally

```python
try:
    f = open("data.txt")
except FileNotFoundError:
    print("file not found")
else:
    # runs only if no exception was raised
    content = f.read()
    f.close()
finally:
    # always runs — even if an exception occurred
    print("done")
```

- `else` → success path (only runs if `try` succeeded)
- `finally` → cleanup that must always run (closing files, releasing locks)

---

## Raising Exceptions

Use `raise` to trigger an exception yourself:

```python
def set_age(age: int):
    if age < 0:
        raise ValueError(f"age must be non-negative, got {age}")
    return age
```

Re-raise the current exception with bare `raise`:

```python
try:
    risky()
except Exception as e:
    log(e)
    raise   # re-raises the same exception
```

---

## Custom Exceptions

Subclass `Exception` to create domain-specific errors:

```python
class InsufficientFundsError(Exception):
    def __init__(self, balance: float, amount: float):
        self.balance = balance
        self.amount = amount
        super().__init__(f"need {amount}, have {balance}")

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    withdraw(50, 100)
except InsufficientFundsError as e:
    print(e)  # need 100, have 50
```

Custom exceptions let callers catch your errors specifically without catching everything.

---

## Common Built-in Exceptions

| Exception | When it occurs |
|---|---|
| `ValueError` | Right type, wrong value (`int("abc")`) |
| `TypeError` | Wrong type (`"a" + 1`) |
| `KeyError` | Dict key doesn't exist |
| `IndexError` | List index out of range |
| `AttributeError` | Object has no such attribute |
| `FileNotFoundError` | File doesn't exist |
| `ZeroDivisionError` | Division by zero |
| `StopIteration` | Iterator exhausted |

---

## Key Questions

> _Q: What is the difference between `except Exception` and bare `except:`?_

`except Exception` catches all exceptions that inherit from `Exception`, which covers most runtime errors. Bare `except:` also catches `SystemExit`, `KeyboardInterrupt`, and `GeneratorExit` — things you almost never want to suppress. Always prefer `except Exception` at minimum, and prefer catching specific exceptions when possible.

> _Q: When does the `else` clause in a try/except run?_

The `else` block runs only if the `try` block completed without raising any exception. It's useful for code that should only run on success but shouldn't be inside the `try` block itself — keeping the `try` block minimal makes it clearer which line you expect to fail.

> _Q: What is the difference between `raise` and `raise e`?_

Bare `raise` re-raises the current active exception, preserving the original traceback. `raise e` raises the exception but resets the traceback to the current line, losing the original context. Prefer bare `raise` when re-raising inside an `except` block.

> _Q: How do you create a custom exception in Python?_

Subclass `Exception` (or a more specific exception class). Override `__init__` to accept domain-specific arguments and call `super().__init__(message)` to set the message. Custom exceptions let callers catch your errors by name rather than parsing error messages.

> _Q: What is the purpose of `finally`?_

`finally` always runs — whether the `try` block succeeded, raised an exception, or even hit a `return`. It's used for cleanup that must happen regardless of outcome: closing files, releasing database connections, unlocking resources. In modern Python, `with` statements handle most of these cases automatically.
