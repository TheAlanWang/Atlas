---
title: "基本类型"
topic: typescript
section: Foundations
order: 2
duration: 20
date: 2026-03-25
---

## 类型注解

在变量名或参数后面写 `: 类型` 就是类型注解。

```typescript
let name: string = "Alan"
let age: number = 25
let isStudent: boolean = true
```

TypeScript 也可以从值**推断**出类型，所以很多时候不需要显式写注解：

```typescript
let name = "Alan"    // TypeScript 推断为：string
let age = 25         // TypeScript 推断为：number
```

只有 TypeScript 无法自动推断类型时，才需要手动加注解。

## 基本类型

最常用的三种类型：

```typescript
let username: string = "alan123"
let score: number = 98.5       // 整数和浮点数都是 number
let isActive: boolean = true
```

## 数组

两种写法：

```typescript
let scores: number[] = [90, 85, 92]
let names: Array<string> = ["Alice", "Bob", "Carol"]  // 泛型写法
```

两种完全等价，`number[]` 更常见。

## 元组（Tuple）

元组是固定长度的数组，每个位置有自己的类型。

```typescript
let point: [number, number] = [10, 20]
let entry: [string, number] = ["Alice", 95]

// 顺序很重要，这样写会报错：
let wrong: [string, number] = [95, "Alice"]  // 错误
```

适合用在结构固定的场景，比如坐标或键值对。

## any

`any` 会关闭对该变量的类型检查，可以接受任何值，也可以赋给任何东西。

```typescript
let value: any = "hello"
value = 42          // 正常
value = true        // 正常
value.foo.bar.baz   // 不报错，但运行时会崩溃
```

尽量避免使用 `any`，用了就等于放弃了 TypeScript 的意义。

## unknown

`unknown` 是安全版的 `any`。它也接受任何值，但在使用之前必须先检查它的实际类型。

```typescript
let input: unknown = "hello"

// 不能直接使用
input.toUpperCase()   // 错误：对象的类型为 "unknown"

// 必须先检查类型
if (typeof input === "string") {
  input.toUpperCase()  // 在检查内部，正常
}
```

真的不知道类型时，优先用 `unknown` 而不是 `any`。

## null 和 undefined

默认情况下，TypeScript 把 `null` 和 `undefined` 视为独立的类型。

```typescript
let empty: null = null
let notSet: undefined = undefined
```

开启 `strictNullChecks`（推荐）后，不能把 `null` 赋给 `string` 变量：

```typescript
let name: string = null   // 开启 strictNullChecks 后报错
```

要允许 null，用联合类型：

```typescript
let name: string | null = null   // 正常
```

## void

`void` 用于没有返回值的函数。

```typescript
function logMessage(msg: string): void {
  console.log(msg)
  // 不需要 return
}
```

## 类型别名

用 `type` 给类型起一个名字：

```typescript
type UserID = number
type Username = string

let id: UserID = 101
let user: Username = "alan"
```

对于简单类型作用不大，但对复杂类型很有用，后面的 Interfaces 章节会深入讲。

## 面试常问

> _Q: TypeScript 中 `any` 和 `unknown` 有什么区别？_

两者都接受任何值，但 `unknown` 更安全。用 `any` 时，你可以不做任何检查直接调用方法或访问属性，相当于悄悄关掉了类型安全。用 `unknown` 时，TypeScript 强制你在使用值之前先收窄类型，比如用 `typeof` 或 `instanceof`。真的不确定类型时用 `unknown`，尽量避免 `any`。

> _Q: 什么是 TypeScript 的类型推断？_

类型推断是指 TypeScript 根据赋值自动判断变量类型，不需要显式写注解。比如 `let x = 5` 会被推断为 `number`。推断减少了需要手写的类型注解数量，同时仍然保持完整的类型安全。

> _Q: TypeScript 中数组和元组有什么区别？_

数组长度可变，所有元素共享同一类型（如 `number[]`）。元组长度固定，每个位置有自己特定的类型（如 `[string, number]`）。元组适合用在结构固定的场景，比如函数返回多个不同类型的值。

> _Q: 为什么要避免使用 `any`？_

`any` 会关掉 TypeScript 对该变量的类型检查，编译器不再捕获错误，自动补全也失效，你失去了 TypeScript 带来的所有安全保障。对那个值来说，相当于退回到了普通 JavaScript。唯一合理的使用场景是把 JavaScript 迁移到 TypeScript 时的临时过渡。
