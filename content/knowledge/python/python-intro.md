---
title: "Introduction to Python"
topic: python
section: Introduction
order: 1
duration: 10
date: 2026-03-25
---

## In This Chapter

- What Python is and why it is still widely used
- Where Python shows up in backend, automation, and AI work
- The basic mental model you should have before going deeper

---


## What is Python?

Python is a general-purpose programming language known for readable syntax and fast iteration. It was created by Guido van Rossum and first released in 1991, but it remains one of the most widely used languages today.

Python code reads almost like English:

```python
names = ["Alice", "Bob", "Charlie"]
for name in names:
    print(f"Hello, {name}!")
```

That style is a big part of why Python is popular in interviews and scripting-heavy work: you spend less effort on ceremony and more on the logic itself.

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

That is the appeal: no `main()`, no class wrapper, and very little ceremony before you can run something useful.

## Why Python for Interviews?

Most coding interviews allow any language. Python is a strong choice because:

- Less syntax overhead — you can focus on the algorithm
- Built-in data structures (`list`, `dict`, `set`) are powerful and easy to use
- One-liners like list comprehensions keep code concise
- It's the language most interviewers are comfortable reading

The rest of this roadmap builds the Python fundamentals that show up most often in interviews and day-to-day backend work.
