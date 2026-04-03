---
title: "Testing with unittest"
topic: python
section: Testing
order: 2
duration: 20
date: 2026-03-24
---

## 本章内容

- unittest 是什么，以及测试类的基本结构
- 常见断言、`setUp` / `tearDown` 怎么用
- unittest 和 pytest 应该如何比较

---


## 什么是 unittest？

`unittest` 是 Python 内置的测试框架，不需要额外安装。它参考了 Java 的 JUnit，所以测试通常写在继承 `unittest.TestCase` 的类里。

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

直接运行文件：

```bash
python test_math.py
```

## 结构

每个测试类都继承 `unittest.TestCase`，每个测试方法都必须以 `test_` 开头：

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

## setUp 和 tearDown

`setUp` 在每个测试方法之前运行，`tearDown` 在每个测试方法之后运行，即使测试失败也会执行：

```python
class TestDatabase(unittest.TestCase):

    def setUp(self):
        self.db = connect_database()   # 每个测试前都跑

    def tearDown(self):
        self.db.close()                # 每个测试后都跑

    def test_insert(self):
        self.db.insert("item")
        self.assertEqual(self.db.count(), 1)
```

## 断言方法

`unittest` 提供了一套专属断言方法，而不是直接写裸 `assert`：

| 方法 | 检查内容 |
|------|---------|
| `assertEqual(a, b)` | `a == b` |
| `assertNotEqual(a, b)` | `a != b` |
| `assertTrue(x)` | `bool(x) is True` |
| `assertFalse(x)` | `bool(x) is False` |
| `assertIsNone(x)` | `x is None` |
| `assertIn(a, b)` | `a in b` |
| `assertRaises(Error, func, *args)` | func 抛出 Error |

```python
def test_raises(self):
    with self.assertRaises(ValueError):
        int("not a number")
```

## pytest vs unittest 对比

| | pytest | unittest |
|---|--------|---------|
| 安装 | `pip install pytest` | 内置，无需安装 |
| 测试风格 | 普通函数 | 继承 `TestCase` 的类 |
| 断言方式 | 普通 `assert` | `self.assertEqual(...)` 等 |
| 准备/清理 | `@pytest.fixture` | `setUp` / `tearDown` |
| 输出可读性 | 详细清晰 | 较简洁 |
| 能跑 unittest 测试 | ✅ 可以 | — |

pytest 可以自动发现并运行 `unittest` 风格的测试，所以两者可以很好地共存。新项目通常更偏向 pytest，`unittest` 在老代码库、内部工具和标准库里更常见。

## 关键问题

> _Q：pytest 和 unittest 有什么区别？_

`unittest` 是内置框架，参考 Java 的 JUnit——测试写在继承 `unittest.TestCase` 的类里，断言用 `self.assertEqual()` 等方法。`pytest` 是第三方库，测试是普通函数，断言用 `assert`，输出更易读，功能也更强（fixture、parametrize）。pytest 也能运行 `unittest` 测试，两者兼容。

> _Q：`setUp` 和 `tearDown` 的作用是什么？_

`setUp` 在每个测试方法前运行，用来准备测试环境（如建立数据库连接、初始化对象）。`tearDown` 在每个测试后运行，用来清理——即使测试失败也会执行。它们等价于 pytest 里 fixture 的 `yield` 前后部分。

> _Q：为什么 unittest 用 `self.assertEqual()` 而不是 `assert`？_

`self.assertEqual()` 等断言方法在失败时能显示实际值和期望值的对比，信息更清晰。裸写 `assert` 只会抛出 `AssertionError`，没有细节。pytest 通过在收集阶段重写 `assert` 语句来解决这个问题，达到同样的效果。
