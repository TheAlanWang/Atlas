---
title: "泛型（Generics）"
topic: typescript
section: Advanced
order: 1
duration: 20
date: 2026-03-25
---

## 泛型解决了什么问题？

假设你要写一个返回数组第一个元素的函数。不用泛型的话，只能二选一：用 `any`（不安全），或者为每种类型分别写一个函数。

```typescript
// 用 any，丢失了类型安全
function first(arr: any[]): any {
  return arr[0]
}

const result = first([1, 2, 3])
result.toUpperCase()  // 不报错，但运行时会崩溃
```

泛型让你只写一次，同时保留类型信息。

## 第一个泛型

用 `<T>` 引入一个类型参数，`T` 是占位符，调用函数时会被填入实际类型。

```typescript
function first<T>(arr: T[]): T {
  return arr[0]
}

const num = first([1, 2, 3])         // T 被推断为 number
const str = first(["a", "b", "c"])   // T 被推断为 string

num.toFixed(2)    // 正常，TypeScript 知道 num 是 number
str.toUpperCase() // 正常，TypeScript 知道 str 是 string
```

TypeScript 从你传入的参数推断 `T`，也可以显式传入：

```typescript
const result = first<number>([1, 2, 3])
```

## 泛型 Interface

泛型同样可以用在 interface 上，这是构建可复用数据结构的方式。

```typescript
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

interface User {
  id: number
  name: string
}

const response: ApiResponse<User> = {
  data: { id: 1, name: "Alan" },
  status: 200,
  message: "OK"
}

console.log(response.data.name)  // "Alan"，TypeScript 知道结构
```

## 泛型约束

用 `extends` 限制 `T` 可以是哪些类型，这样可以安全访问 `T` 上的属性。

```typescript
// T 必须有 length 属性
function logLength<T extends { length: number }>(value: T): void {
  console.log(value.length)
}

logLength("hello")       // 正常，string 有 length
logLength([1, 2, 3])     // 正常，array 有 length
logLength(42)            // 错误，number 没有 length
```

## 多个类型参数

可以有不止一个类型参数。

```typescript
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value]
}

pair("id", 101)        // [string, number]
pair("name", "Alan")   // [string, string]
```

## 实际用例：包装容器

一个常见的实际场景——把值包进容器：

```typescript
interface Box<T> {
  value: T
  label: string
}

function makeBox<T>(value: T, label: string): Box<T> {
  return { value, label }
}

const numBox = makeBox(42, "一个数字")           // Box<number>
const strBox = makeBox("hello", "一个字符串")    // Box<string>

console.log(numBox.value.toFixed(2))    // "42.00"
console.log(strBox.value.toUpperCase()) // "HELLO"
```

## 关键问题

> _Q: TypeScript 中的泛型是什么？为什么有用？_

泛型让你写出能处理任意类型、同时保留类型安全的函数、interface 和类。不用 `any`（会丢失类型检查），而是用类型参数 `<T>` 作为占位符。TypeScript 在调用函数时推断出实际类型，并将其传递到返回值中。这让你写出可复用的代码，同时不牺牲类型信息。

> _Q: 泛型中的 `T extends SomeType` 是什么意思？_

这是泛型约束，把类型参数 `T` 限制为只能是满足 `SomeType` 的类型。例如 `T extends { length: number }` 意味着 `T` 可以是任何有 `length` 属性的类型，比如 `string` 或 `Array`。没有约束的话，TypeScript 不允许你访问 `T` 上的 `.length`，因为它无法保证该属性存在。

> _Q: 用 `any` 和用泛型有什么区别？_

两者都接受任意类型，但泛型在函数中保留了类型信息。用 `any` 时，类型信息丢失了：返回类型也变成 `any`，TypeScript 不再检查你如何使用结果。用泛型时，TypeScript 追踪确切的类型，返回类型与输入匹配。泛型给了你 `any` 的灵活性，同时保留了有类型代码的安全性。
