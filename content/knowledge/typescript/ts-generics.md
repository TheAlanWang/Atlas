---
title: "Generics"
topic: typescript
section: Advanced
order: 1
duration: 20
date: 2026-03-25
---

## The Problem Generics Solve

Imagine writing a function that returns the first item of an array. Without generics, you have to choose: use `any` (unsafe) or write separate functions for every type.

```typescript
// Using any — loses type safety
function first(arr: any[]): any {
  return arr[0]
}

const result = first([1, 2, 3])
result.toUpperCase()  // No error here, but will crash at runtime
```

Generics let you write the function once and preserve the type.

## Your First Generic

Use `<T>` to introduce a type parameter. `T` is a placeholder that gets filled in when the function is called.

```typescript
function first<T>(arr: T[]): T {
  return arr[0]
}

const num = first([1, 2, 3])         // T is inferred as number
const str = first(["a", "b", "c"])   // T is inferred as string

num.toFixed(2)    // OK — TypeScript knows num is number
str.toUpperCase() // OK — TypeScript knows str is string
```

TypeScript infers `T` from the argument you pass. You can also pass it explicitly:

```typescript
const result = first<number>([1, 2, 3])
```

## Generic Interfaces

Generics work with interfaces too. This is how you build reusable data structures.

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

console.log(response.data.name)  // "Alan" — TypeScript knows the shape
```

## Generic Constraints

Use `extends` to restrict what types `T` can be. This lets you safely access properties on `T`.

```typescript
// T must have a length property
function logLength<T extends { length: number }>(value: T): void {
  console.log(value.length)
}

logLength("hello")       // OK — string has length
logLength([1, 2, 3])     // OK — array has length
logLength(42)            // Error — number has no length
```

## Multiple Type Parameters

You can have more than one type parameter.

```typescript
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value]
}

pair("id", 101)        // [string, number]
pair("name", "Alan")   // [string, string]
```

## Generic Utility: Identity and Wrappers

A common real-world use case — wrapping values in a container:

```typescript
interface Box<T> {
  value: T
  label: string
}

function makeBox<T>(value: T, label: string): Box<T> {
  return { value, label }
}

const numBox = makeBox(42, "a number")          // Box<number>
const strBox = makeBox("hello", "a string")     // Box<string>

console.log(numBox.value.toFixed(2))   // "42.00"
console.log(strBox.value.toUpperCase()) // "HELLO"
```

## Key Questions

> _Q: What are generics in TypeScript and why are they useful?_

Generics allow you to write functions, interfaces, and classes that work with any type while still preserving type safety. Instead of using `any` (which removes type checking), you use a type parameter like `<T>` as a placeholder. TypeScript infers the actual type when the function is called and propagates it through the return value. This lets you write reusable code without sacrificing type information.

> _Q: What does `T extends SomeType` mean in a generic?_

It is a generic constraint. It restricts the type parameter `T` to only types that satisfy `SomeType`. For example, `T extends { length: number }` means `T` can be any type that has a `length` property, like `string` or `Array`. Without the constraint, TypeScript would not let you access `.length` on `T` because it cannot guarantee the property exists.

> _Q: What is the difference between using `any` and using a generic?_

Both accept any type, but generics preserve the type through the function. With `any`, the type information is lost: the return type becomes `any` too, and TypeScript stops checking how you use the result. With a generic, TypeScript tracks the exact type and the return type matches the input. Generics give you the flexibility of `any` with the safety of typed code.
