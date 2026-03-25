---
title: "Python 简介"
topic: python
section: Introduction
order: 1
duration: 10
date: 2026-03-25
---

## Python 是什么？

Python 是一门通用编程语言，以简洁、易读、上手快著称。由 Guido van Rossum 创建，1991 年首次发布，如今已成为全球使用最广泛的编程语言之一。

Python 代码读起来几乎像英文：

```python
names = ["Alice", "Bob", "Charlie"]
for name in names:
    print(f"Hello, {name}!")
```

和 Java 的等效代码比一比——Python 去掉了大量样板代码，让你专注于逻辑本身。

## Python 用在哪里？

Python 无处不在：

- **Web 后端** — Django、FastAPI、Flask
- **数据科学和机器学习** — NumPy、Pandas、PyTorch、scikit-learn
- **自动化和脚本** — 文件处理、爬虫、CI 流水线
- **AI / LLM 应用** — 大多数 AI 工具（LangChain、OpenAI SDK）都优先支持 Python
- **API 和微服务** — 轻量、开发快

如果你想做后端工程或者任何 AI 相关的方向，Python 是绕不开的。

## 安装 Python

检查是否已安装：

```bash
python3 --version
```

没有的话去 [python.org](https://python.org) 下载。一定要装 Python 3——Python 2 已经停止维护了。

## 运行 Python

**交互模式** — 适合快速试验：

```bash
python3
>>> 2 + 2
4
>>> print("hello")
hello
```

**运行文件：**

```bash
python3 hello.py
```

## 第一个程序

创建 `hello.py`：

```python
name = input("你叫什么名字？")
print(f"你好，{name}！欢迎来到 Python 的世界。")
```

运行：

```bash
python3 hello.py
```

就这样。不需要 `main()`，不需要类，不需要分号。

## 为什么面试用 Python？

大多数面试可以用任意语言。Python 是个好选择，因为：

- 语法负担小——可以专注在算法本身
- 内置数据结构（`list`、`dict`、`set`）强大且易用
- 列表推导式等写法让代码更简洁
- 大多数面试官都能看懂 Python

这个 Python 模块后续的内容会覆盖你在面试和工作中需要的核心基础。
