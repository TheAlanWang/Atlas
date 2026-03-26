---
title: "Basic Types"
topic: typescript
section: Foundations
order: 2
duration: 20
date: 2026-03-25
---

## Type Annotations

You add a type annotation by writing `: type` after a variable name or parameter.

```typescript
let name: string = "Alan"
let age: number = 25
let isStudent: boolean = true
```

TypeScript can also **infer** the type from the value, so you often do not need to write the annotation explicitly:

```typescript
let name = "Alan"    // TypeScript infers: string
let age = 25         // TypeScript infers: number
```

Only add annotations when TypeScript cannot infer the type on its own.

## Primitive Types

The three most common types:

```typescript
let username: string = "alan123"
let score: number = 98.5       // integers and floats are both number
let isActive: boolean = true
```

## Arrays

Two ways to write array types:

```typescript
let scores: number[] = [90, 85, 92]
let names: Array<string> = ["Alice", "Bob", "Carol"]  // generic syntax
```

Both are equivalent. The `number[]` syntax is more common.

## Tuples

A tuple is an array with a fixed number of elements, each with a known type.

```typescript
let point: [number, number] = [10, 20]
let entry: [string, number] = ["Alice", 95]

// Order matters — this would be an error:
let wrong: [string, number] = [95, "Alice"]  // Error
```

Use tuples when you have a fixed structure, like coordinates or key-value pairs.

## any

`any` turns off type checking for a variable. It accepts any value and can be assigned to anything.

```typescript
let value: any = "hello"
value = 42          // OK
value = true        // OK
value.foo.bar.baz   // No error, even though this will crash at runtime
```

Avoid `any` whenever possible. Using `any` defeats the purpose of TypeScript.

## unknown

`unknown` is the safe version of `any`. It also accepts any value, but you cannot use it without first checking what type it actually is.

```typescript
let input: unknown = "hello"

// Cannot use it directly
input.toUpperCase()   // Error: Object is of type 'unknown'

// Must check the type first
if (typeof input === "string") {
  input.toUpperCase()  // OK inside the check
}
```

Prefer `unknown` over `any` when you genuinely do not know the type upfront.

## null and undefined

By default, TypeScript treats `null` and `undefined` as their own types.

```typescript
let empty: null = null
let notSet: undefined = undefined
```

With `strictNullChecks` enabled (recommended), you cannot assign `null` to a `string` variable:

```typescript
let name: string = null   // Error with strictNullChecks
```

To allow null, use a union type:

```typescript
let name: string | null = null   // OK
```

## void

`void` is used for functions that do not return a value.

```typescript
function logMessage(msg: string): void {
  console.log(msg)
  // no return statement needed
}
```

## Type Aliases

You can give a type a name using `type`:

```typescript
type UserID = number
type Username = string

let id: UserID = 101
let user: Username = "alan"
```

This is more useful for complex types, which we will cover in the Interfaces section.

## Interview Questions

> _Q: What is the difference between `any` and `unknown` in TypeScript?_

Both accept any value, but `unknown` is safer. With `any`, you can call methods or access properties without any checks, which silently removes type safety. With `unknown`, TypeScript forces you to narrow the type before using the value — for example with `typeof` or `instanceof`. Use `unknown` when you genuinely do not know the type; avoid `any` unless you have no other option.

> _Q: What is type inference in TypeScript?_

Type inference is when TypeScript automatically determines the type of a variable from its assigned value, without you writing an explicit annotation. For example, `let x = 5` is inferred as `number`. Inference reduces the amount of type annotation you need to write while still giving you full type safety.

> _Q: What is the difference between an array and a tuple in TypeScript?_

An array has a variable length and all elements share the same type (e.g., `number[]`). A tuple has a fixed length and each position has its own specific type (e.g., `[string, number]`). Tuples are useful when a fixed structure is expected, like a function returning multiple values of different types.

> _Q: Why should you avoid using `any`?_

`any` disables TypeScript's type checker for that variable. The compiler stops catching errors, autocompletion stops working accurately, and you lose all the safety benefits TypeScript provides. It is essentially opting back into plain JavaScript for that value. The only legitimate use is as a temporary escape hatch when migrating JavaScript to TypeScript.
