---
title: "Variables & Types"
topic: java
section: Fundamentals
order: 1
duration: 25
date: 2026-03-24
---

## 静态类型

Java 是**静态类型**语言——每个变量必须声明类型，且类型不能改变：

```java
int age = 25;
String name = "Alan";
boolean isStudent = true;
```

和 Python 的 `age = 25` 相比，Java 必须写出类型声明（`int`）。如果类型不匹配，编译器在程序运行之前就会报错。

## 基本类型（Primitive Types）

Java 有 8 种内置的基本类型，它们不是对象，直接在内存中存储值：

| 类型 | 大小 | 示例 | 说明 |
|------|------|------|------|
| `int` | 32位 | `42`, `-7` | 最常用的整数类型 |
| `long` | 64位 | `123456789L` | 需要加 `L` 后缀 |
| `double` | 64位 | `3.14` | 最常用的小数类型 |
| `float` | 32位 | `3.14f` | 需要加 `f` 后缀 |
| `boolean` | 1位 | `true`, `false` | 只有两个值 |
| `char` | 16位 | `'A'` | 单个字符，用单引号 |
| `byte` | 8位 | `127` | 较少直接使用 |
| `short` | 16位 | `32000` | 较少直接使用 |

```java
int score = 95;
double gpa = 3.8;
boolean graduated = false;
char grade = 'A';
```

## 引用类型（Reference Types）

除基本类型以外的都是**引用类型**——变量存储的是指向堆内存中对象的引用，不是值本身。

最重要的引用类型是 `String`：

```java
String major = "Computer Science";
String greeting = "Hello, " + major;  // 用 + 拼接字符串
```

`String` 是类，不是基本类型。这有一个实际影响：

```java
String a = "hello";
String b = "hello";

a == b         // 不可靠——比较的是引用，不是内容
a.equals(b)    // true——比较 String 永远用 .equals()
```

## 类型转换

**自动转换（Widening）**——从小类型到大类型，安全，自动发生：

```java
int x = 42;
double d = x;   // int → double，自动转换
```

**强制转换（Narrowing）**——从大类型到小类型，需要显式写出：

```java
double pi = 3.14159;
int truncated = (int) pi;   // 3——小数部分直接丢弃，不四舍五入
```

## `var`（Java 10+）

Java 10 引入了 `var`，让编译器自动推断变量类型：

```java
var name = "Alan";    // 推断为 String
var age = 25;         // 推断为 int
var gpa = 3.8;        // 推断为 double
```

`var` 只能用于方法内部的局部变量，不能用于字段或参数。类型依然是静态的，只是由编译器推断而不是手动写出。

## 常量

用 `final` 声明不可重新赋值的变量。按惯例，常量名全部大写：

```java
final int MAX_SCORE = 100;
final String APP_NAME = "Atlas";

MAX_SCORE = 99;  // 编译报错
```

## 面试常问

> **Q：Java 中基本类型和引用类型有什么区别？**

基本类型（`int`、`double`、`boolean` 等）直接在栈上存储值。引用类型存储的是指向堆上对象的内存地址。基本类型不能为 `null`，引用类型可以。基本类型用 `==` 比较，引用类型用 `.equals()` 比较。

> **Q：为什么比较 String 要用 `.equals()` 而不是 `==`？**

`==` 比较的是引用——两个变量是否指向内存中同一个对象。两个内容相同的 `String` 可能是不同的对象，`==` 会返回 `false`。`.equals()` 比较的是字符内容，几乎所有情况下这才是你想要的。

> **Q：`int` 和 `Integer` 有什么区别？**

`int` 是基本类型，直接存储值，不能为 `null`。`Integer` 是包装类，把 `int` 包装成对象，可以为 `null`，提供了 `Integer.parseInt()` 等工具方法。Java 会自动在两者之间转换（自动装箱/拆箱），但 `Integer` 是堆对象，开销更大。

> **Q：自动类型转换（widening）和强制类型转换（narrowing）有什么区别？**

自动转换是从小类型到大类型（如 `int` → `double`），不会丢失数据，Java 自动完成。强制转换是从大类型到小类型（如 `double` → `int`），需要显式写出转型语法，小数部分会被截断（不是四舍五入），可能丢失数据。

> **Q：Java 中的 `var` 是什么？什么时候能用？**

`var` 是 Java 10 引入的关键字，让编译器根据赋值自动推断局部变量的类型。它只能用于方法内部的局部变量，不能用于字段、方法参数或返回类型。类型依然是静态的，由编译器在编译时确定，只是不需要手动写出来。

> **Q：变量加 `final` 是什么意思？**

`final` 表示该变量只能被赋值一次，之后再赋值会报编译错误。对基本类型来说，这意味着值不可变。对引用类型来说，引用不能指向别的对象，但对象的内容本身还是可以修改的。按惯例，`final` 常量用全大写加下划线命名（`ALL_CAPS`）。

> **Q：Java 的 8 种基本类型是什么？**

整数类型：`byte`、`short`、`int`、`long`（精度依次递增）；浮点类型：`float`、`double`；字符类型：`char`；布尔类型：`boolean`。最常用的是 `int`、`double`、`boolean` 和 `char`。`long` 字面量需要加 `L` 后缀，`float` 字面量需要加 `f` 后缀，以区别于 `int` 和 `double`。
