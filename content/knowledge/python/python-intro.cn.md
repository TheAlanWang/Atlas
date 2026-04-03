---
title: "Python 简介"
topic: python
section: Introduction
order: 1
duration: 10
date: 2026-03-25
---

## 本章内容

- Python 是什么，为什么它仍然被广泛使用
- Python 在后端、自动化和 AI 里的常见位置
- 继续往下学之前最值得先建立的基本直觉

---


## Python 是什么？

Python 是一门通用编程语言，以语法清晰、迭代速度快著称。它由 Guido van Rossum 创建，1991 年首次发布，如今依然是全球使用最广泛的编程语言之一。

Python 代码读起来几乎像英文：

```python
names = ["Alice", "Bob", "Charlie"]
for name in names:
    print(f"Hello, {name}!")
```

这也是 Python 在面试和脚本场景里很受欢迎的原因之一：少写样板，多写逻辑。

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

这就是它的特点：不需要 `main()`，不需要类包装，也不需要先写一堆样板代码才能开始。

## 为什么面试用 Python？

大多数面试可以用任意语言。Python 是个好选择，因为：

- 语法负担小——可以专注在算法本身
- 内置数据结构（`list`、`dict`、`set`）强大且易用
- 列表推导式等写法让代码更简洁
- 大多数面试官都能看懂 Python

后面的 roadmap 会继续把 Python 里最常见、最常被问到的核心基础补完整。
