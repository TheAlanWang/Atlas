---
title: "Introduction to Python"
topic: python
section: Introduction
order: 1
duration: 10
date: 2026-03-25
---

## What is Python?

Python is a general-purpose programming language known for being readable, concise, and beginner-friendly. It was created by Guido van Rossum and first released in 1991, but it has become one of the most widely used languages in the world today.

Python code reads almost like English:

```python
names = ["Alice", "Bob", "Charlie"]
for name in names:
    print(f"Hello, {name}!")
```

Compare that to the equivalent Java — Python removes a lot of boilerplate and lets you focus on the logic.

## Where is Python Used?

Python is everywhere:

- **Web backends** — Django, FastAPI, Flask
- **Data science & ML** — NumPy, Pandas, PyTorch, scikit-learn
- **Automation & scripting** — file processing, web scraping, CI pipelines
- **AI / LLM applications** — most AI tooling (LangChain, OpenAI SDK) is Python-first
- **APIs and microservices** — lightweight, fast to build

If you're heading into backend engineering or anything AI-related, Python is unavoidable.

## Installing Python

Check if Python is already installed:

```bash
python3 --version
```

If not, download it from [python.org](https://python.org). Always install Python 3 — Python 2 is end-of-life.

## Running Python

**Interactive mode** — great for quick experiments:

```bash
python3
>>> 2 + 2
4
>>> print("hello")
hello
```

**Run a file:**

```bash
python3 hello.py
```

## Your First Program

Create a file called `hello.py`:

```python
name = input("What's your name? ")
print(f"Hello, {name}! Welcome to Python.")
```

Run it:

```bash
python3 hello.py
```

That's it. No `main()`, no class wrapper, no semicolons.

## Why Python for Interviews?

Most coding interviews allow any language. Python is a strong choice because:

- Less syntax overhead — you can focus on the algorithm
- Built-in data structures (`list`, `dict`, `set`) are powerful and easy to use
- One-liners like list comprehensions keep code concise
- It's the language most interviewers are comfortable reading

The rest of this section covers the fundamentals you need to write clean, correct Python — both in interviews and on the job.
