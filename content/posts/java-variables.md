---
title: "Variables & Types"
topic: java
section: Fundamentals
order: 1
duration: 25
date: 2026-03-24
---

## Static Typing

Java is **statically typed** — every variable must have a declared type, and that type cannot change:

```java
int age = 25;
String name = "Alan";
boolean isStudent = true;
```

Compare this to Python, where you just write `age = 25`. In Java, the type declaration (`int`) is required. If you try to assign the wrong type, the compiler catches it before the program ever runs.

## Primitive Types

Java has 8 primitive types built into the language. These are not objects — they hold values directly in memory:

| Type | Size | Example | Notes |
|------|------|---------|-------|
| `int` | 32-bit | `42`, `-7` | Most common integer type |
| `long` | 64-bit | `123456789L` | Use `L` suffix |
| `double` | 64-bit | `3.14` | Most common decimal type |
| `float` | 32-bit | `3.14f` | Use `f` suffix |
| `boolean` | 1-bit | `true`, `false` | Only two values |
| `char` | 16-bit | `'A'` | Single character, single quotes |
| `byte` | 8-bit | `127` | Rarely used directly |
| `short` | 16-bit | `32000` | Rarely used directly |

```java
int score = 95;
double gpa = 3.8;
boolean graduated = false;
char grade = 'A';
```

## Reference Types

Everything that is not a primitive is a **reference type** — the variable holds a reference (pointer) to an object in memory, not the value itself.

The most important reference type to know first is `String`:

```java
String major = "Computer Science";
String greeting = "Hello, " + major;  // concatenation with +
```

`String` is a class, not a primitive. This has practical consequences:

```java
String a = "hello";
String b = "hello";

a == b       // unreliable — compares references, not values
a.equals(b)  // true — always use .equals() for String comparison
```

## Type Conversion

**Widening** (safe, automatic) — going from smaller to larger type:

```java
int x = 42;
double d = x;   // int → double, automatic
```

**Narrowing** (requires explicit cast) — going from larger to smaller type:

```java
double pi = 3.14159;
int truncated = (int) pi;   // 3 — decimal part is dropped, not rounded
```

## `var` (Java 10+)

Java 10 introduced `var` for local variable type inference — the compiler infers the type from the value:

```java
var name = "Alan";    // inferred as String
var age = 25;         // inferred as int
var gpa = 3.8;        // inferred as double
```

`var` only works for local variables (inside methods), not for fields or parameters. The type is still static — it's just inferred at compile time instead of written out.

## Constants

Use `final` to declare a variable that cannot be reassigned. By convention, constants use ALL_CAPS:

```java
final int MAX_SCORE = 100;
final String APP_NAME = "Atlas";

MAX_SCORE = 99;  // compile error
```

## Interview Questions

> _Q: What is the difference between primitive types and reference types in Java?_

Primitives (`int`, `double`, `boolean`, etc.) hold their value directly in memory and are stored on the stack. Reference types hold a memory address pointing to an object on the heap. Primitives cannot be `null`; reference types can. Primitives are compared with `==`; reference types should be compared with `.equals()`.

> _Q: Why should you use `.equals()` instead of `==` for String comparison?_

`==` compares references — whether two variables point to the same object in memory. Two `String` variables with the same content may be different objects, so `==` can return `false` even when the values are identical. `.equals()` compares the actual character content, which is almost always what you want.

> _Q: What is the difference between `int` and `Integer` in Java?_

`int` is a primitive type — it holds the value directly and cannot be `null`. `Integer` is a wrapper class — it wraps an `int` in an object, can be `null`, and provides utility methods like `Integer.parseInt()`. Java automatically converts between the two (autoboxing/unboxing), but `Integer` has more overhead since it's a heap object.

> _Q: What is the difference between widening and narrowing type conversion?_

Widening goes from a smaller type to a larger one (e.g., `int` to `double`) and happens automatically because there is no risk of data loss. Narrowing goes from a larger type to a smaller one (e.g., `double` to `int`) and requires an explicit cast — the decimal part is truncated, not rounded, so data can be lost.

> _Q: What is `var` in Java and when can you use it?_

`var` (introduced in Java 10) lets the compiler infer the type of a local variable from the assigned value. It can only be used for local variables inside methods — not for fields, method parameters, or return types. The type is still static and determined at compile time; `var` just saves you from writing it out.

> _Q: What does `final` mean when applied to a variable?_

`final` means the variable can only be assigned once — after that, any attempt to reassign it is a compile-time error. For primitives, this makes the value constant. For reference types, it means the reference cannot point to a different object, but the object's contents can still be mutated. By convention, `final` constants are named in `ALL_CAPS`.

> _Q: What are the 8 primitive types in Java?_

`byte`, `short`, `int`, `long` (integers of increasing size), `float`, `double` (decimals), `char` (single character), and `boolean`. The most commonly used are `int`, `double`, `boolean`, and `char`. `long` literals need an `L` suffix and `float` literals need an `f` suffix to distinguish them from `int` and `double`.
