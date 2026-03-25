---
title: "Testing with pytest"
topic: python
section: Testing
order: 1
duration: 30
date: 2026-03-24
---

## 学完这章你会掌握

- 用 pytest 写和运行基本测试
- 按规范组织测试文件的目录结构
- 用 `pytest.raises` 验证函数是否抛出了正确的异常
- 用 fixture 设置可复用的测试数据
- 用 `@pytest.mark.parametrize` 对同一个测试跑多组输入

---

## 为什么要写测试？

测试验证你的代码是否按预期运行——而且在你改动代码之后依然如此。没有测试，每次修改都是猜测。

pytest 是 Python 的主流测试库，写起来简洁，读起来清晰，大型项目也能用。

```bash
pip install pytest
```

## 第一个测试

测试就是一个以 `test_` 开头的函数，pytest 会自动找到并运行它：

```python
# test_math.py
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
```

运行：

```bash
pytest test_math.py
```

`assert` 是每个测试的核心——如果表达式为 `False`，测试就失败。

## 项目结构

把测试放在单独的 `tests/` 目录里：

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

每个模块对应一个测试文件，文件名加 `test_` 前缀。

## 测试异常

用 `pytest.raises` 验证代码是否抛出了正确的异常：

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

## Fixture

Fixture 用来设置可复用的测试数据或状态。`@pytest.fixture` 是 pytest 自带的装饰器，装了 pytest 就能用，不需要额外安装：

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

测试函数的参数名和 fixture 函数名一致，pytest 会自动注入。这套注入机制由 pytest 提供，fixture 本身（比如 `sample_list`）是你自己写的。

pytest 也内置了一些开箱即用的 fixture，不需要自己定义，直接在参数里写名字就行：

| Fixture | 作用 |
|---------|------|
| `tmp_path` | 提供一个测试专用的临时目录 |
| `capsys` | 捕获 stdout/stderr，可以对 `print()` 输出做断言 |
| `monkeypatch` | 临时替换函数、环境变量或属性 |
| `capfd` | 和 `capsys` 类似，但在文件描述符层面工作 |

```python
def test_write_file(tmp_path):
    f = tmp_path / "hello.txt"
    f.write_text("hello")
    assert f.read_text() == "hello"
```

加上内置 fixture 的参数名，pytest 自动处理剩下的事。

### 用 `yield` 做清理（Teardown）

把 `return` 换成 `yield`，就可以在测试结束后执行清理代码：

```python
@pytest.fixture
def db_connection():
    conn = open_database()   # setup——在测试之前执行
    yield conn               # 测试拿到 conn
    conn.close()             # teardown——测试结束后执行，即使测试失败也会跑
```

`yield` 之前是 setup，之后是 teardown。pytest 保证 teardown 一定会执行，不管测试有没有抛出异常。

## 参数化测试

用 `@pytest.mark.parametrize` 对同一个测试跑多组输入：

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

不用写四个单独的测试函数，写一个就够了。

## 运行测试

### 自动发现

在项目根目录跑 `pytest`，它会自动递归扫描所有子目录，不需要手动指定路径：

```
project/
├── tests/
│   ├── test_math.py      ← 会找到
│   └── test_database.py  ← 会找到
└── src/
    └── test_utils.py     ← 也会找到
```

pytest 按以下规则发现测试：
- 文件名匹配 `test_*.py` 或 `*_test.py`
- 函数名以 `test_` 开头
- 类名以 `Test` 开头

### 命令范围

```bash
pytest                                    # 跑全部
pytest tests/                            # 跑某个目录
pytest tests/test_math.py                # 跑某个文件
pytest tests/test_math.py::test_add      # 跑某个具体测试
pytest -k "add"                          # 只跑名字包含 "add" 的测试
pytest -v                                # 详细输出
pytest -x                                # 遇到第一个失败就停止
```

### 输出长什么样

全部通过时：

```
============================= test session starts ==============================
platform darwin -- Python 3.12.0, pytest-8.1.0
rootdir: /project
collected 4 items

tests/test_math.py ....                                                  [100%]

============================== 4 passed in 0.02s ===============================
```

每个 `.` 代表一个通过的测试。加上 `-v` 后看到每个测试的名字：

```
============================= test session starts ==============================
collected 4 items

tests/test_math.py::test_add PASSED                                      [ 25%]
tests/test_math.py::test_add_negative PASSED                             [ 50%]
tests/test_math.py::test_subtract PASSED                                 [ 75%]
tests/test_math.py::test_divide PASSED                                   [100%]

============================== 4 passed in 0.02s ===============================
```

有测试失败时：

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

`F` 表示失败，`.` 表示通过。pytest 会显示具体哪一行出错、实际值（`2`）和期望值（`3`）。

## 面试常问

> **Q：pytest 和 unittest 有什么区别？**

`unittest` 是 Python 内置的测试框架，风格参考 Java 的 JUnit，测试写在继承 `unittest.TestCase` 的类里。`pytest` 是第三方库，语法更简洁，测试就是普通函数加 `assert`。pytest 也能运行 `unittest` 风格的测试，两者兼容。

> **Q：pytest 里的 fixture 是什么？**

Fixture 是用 `@pytest.fixture` 装饰的函数，提供可复用的测试准备工作。不需要在每个测试里重复写 setup 代码，定义一次，按名字注入即可。Fixture 也可以用 `yield` 处理清理逻辑（teardown）。

> **Q：pytest 测试里的 `assert` 是什么？**

`assert` 检查一个表达式是否为 `True`。如果为 `False`，pytest 捕获 `AssertionError`，标记测试失败，并显示实际值和期望值的对比。pytest 会对 `assert` 做特殊处理，让失败信息比原生 Python 更易读。

> **Q：`@pytest.mark.parametrize` 有什么用？**

它让你用多组输入和期望输出跑同一个测试函数，不需要重复写代码。你声明参数名和一个值元组的列表，pytest 会为每行生成一个独立的测试用例。这让测试保持简洁，也方便添加边界情况。

> **Q：pytest 里怎么测试函数是否抛出了异常？**

用 `pytest.raises` 作为上下文管理器：`with pytest.raises(SomeException): call_that_raises()`。如果代码块没有抛出预期的异常，测试就失败。也可以用 `as exc_info` 捕获异常信息，对错误消息内容做断言。

> **Q：pytest 对测试文件和测试函数的命名有什么规范？**

测试文件必须以 `test_` 开头（如 `test_calculator.py`）。测试函数和方法也必须以 `test_` 开头（如 `def test_add()`）。pytest 会自动按这套命名规范发现测试，不需要额外配置。

> **Q：pytest fixture 里怎么做清理（teardown）？**

在 fixture 里用 `yield` 替代 `return`。`yield` 之前的代码是 setup，之后的代码是 teardown，在测试完成后执行——即使测试失败也会执行。比如可以在 `yield` 前打开数据库连接，在 `yield` 后关闭。
