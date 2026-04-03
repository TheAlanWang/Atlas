---
title: "字符串"
topic: python
section: Data Structures
order: 3
duration: 20
date: 2026-03-28
---

## 本章内容

- Python 字符串为什么是不可变序列
- 索引和切片的常见写法
- 最常用的字符串方法
- 为什么现代 Python 推荐 f-string
- `str` 和 `bytes` 的区别

---

## 字符串是不可变序列

字符串是有序、不可变的 Unicode 字符序列：

```python
s = "hello"
s[0]       # "h"
s[-1]      # "o"
s[1:4]     # "ell"
s[::-1]    # "olleh"
```

因为它不可变，不能原地改某个字符：

```python
s[0] = "H"   # TypeError
```

## 常用字符串方法

```python
s = "  Hello, World!  "

s.strip()
s.lower()
s.upper()
s.replace("World", "Python")
s.split(",")
",".join(["a", "b", "c"])
```

这些方法都会返回新字符串，不会修改原字符串。

## f-string

现代 Python 里最推荐的字符串格式化方式是 f-string：

```python
name = "Alan"
score = 95.5

print(f"Hello, {name}!")
print(f"Score: {score:.1f}")
```

它可读性高，也方便嵌入表达式。

## `str` vs `bytes`

- `str` 表示文本，是 Unicode 字符序列
- `bytes` 表示原始字节数据

二者通过 `encode()` 和 `decode()` 转换：

```python
"hello".encode("utf-8")
b"hello".decode("utf-8")
```

## 拼接和性能

```python
"ha" * 3
"hello" + " world"
```

但如果你在循环里不断用 `+=` 拼接字符串，性能会变差，因为每次都会创建新字符串。更稳的做法是先收集到列表，最后用 `"".join(parts)`。

## 关键问题

> _Q：为什么在循环里用 `+=` 拼接字符串会慢？_

因为字符串不可变，每次 `+=` 都会创建一个新字符串并复制旧内容。

> _Q：`find()` 和 `index()` 有什么区别？_

都能查找子串位置，但 `find()` 找不到时返回 `-1`，`index()` 找不到时会抛 `ValueError`。

> _Q：Python 字符串可变吗？_

不可变。任何看起来像“修改”的操作，本质上都是返回新字符串。

> _Q：`str` 和 `bytes` 有什么区别？_

`str` 是文本，`bytes` 是原始字节。文件、网络、编码问题里经常会碰到二者转换。

> _Q：如何反转字符串？_

最常见写法是切片 `s[::-1]`。
