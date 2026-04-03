---
title: "错误处理"
topic: python
section: Python Basics
order: 3
duration: 20
date: 2026-03-28
---

## 本章内容

- `try / except / else / finally` 的执行顺序
- 为什么要优先捕获具体异常
- 如何用 `raise` 主动抛错
- 如何定义自定义异常
- Python 里最常见的几类内置异常

---

## `try / except`

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("can't divide by zero")
```

把可能失败的代码放在 `try` 里，异常发生时会跳到匹配的 `except`。

尽量捕获**具体异常**，不要上来就写宽泛的 `except Exception`，更不要随便用裸 `except:`。

## 捕获多个异常

```python
try:
    val = int(input("enter number: "))
    print(10 / val)
except ValueError:
    print("not a number")
except ZeroDivisionError:
    print("can't be zero")
```

也可以组合写法：

```python
except (ValueError, ZeroDivisionError) as e:
    print(e)
```

## `else` 和 `finally`

```python
try:
    f = open("data.txt")
except FileNotFoundError:
    print("file not found")
else:
    content = f.read()
    f.close()
finally:
    print("done")
```

- `else`：只有 `try` 成功时才运行
- `finally`：无论有没有异常都会运行

## `raise`

你可以主动抛出异常：

```python
def set_age(age: int):
    if age < 0:
        raise ValueError("age must be non-negative")
```

如果你在 `except` 里只是想把当前异常重新抛出去，优先用裸 `raise`：

```python
try:
    risky()
except Exception:
    log_error()
    raise
```

## 自定义异常

```python
class InsufficientFundsError(Exception):
    pass
```

如果你的业务场景需要调用方按类型区分错误，自定义异常会比只看错误信息更清楚。

## 常见内置异常

| 异常 | 常见场景 |
|---|---|
| `ValueError` | 类型对了，但值不合法 |
| `TypeError` | 类型就不对 |
| `KeyError` | 字典键不存在 |
| `IndexError` | 索引越界 |
| `AttributeError` | 对象没有这个属性 |
| `FileNotFoundError` | 文件不存在 |

## 关键问题

> _Q：`except Exception` 和裸 `except:` 有什么区别？_

`except Exception` 只捕获大多数运行时异常；裸 `except:` 还会捕获 `KeyboardInterrupt`、`SystemExit` 这类通常不该吞掉的异常。

> _Q：`try / except` 里的 `else` 什么时候执行？_

只有当 `try` 代码块完全成功、没有抛异常时才执行。

> _Q：`raise` 和 `raise e` 有什么区别？_

裸 `raise` 会保留原始 traceback；`raise e` 会在当前这一行重新抛出，容易丢掉更原始的上下文。

> _Q：怎么定义自定义异常？_

继承 `Exception`，然后按需要补充自己的字段和消息。

> _Q：`finally` 的作用是什么？_

它保证清理逻辑一定会执行，常用于关闭文件、释放锁、断开连接。
