---
title: "Typed Functions"
topic: typescript
section: Functions & Objects
order: 1
duration: 15
date: 2026-03-25
---

## Typing Parameters and Return Values

Add types to function parameters and return values with `: type`.

```typescript
function add(a: number, b: number): number {
  return a + b
}

function greet(name: string): string {
  return "Hello, " + name
}
```

TypeScript will error if you pass the wrong type or return the wrong type.

## Optional Parameters

Add `?` after the parameter name to make it optional. Optional parameters are `undefined` if not passed.

```typescript
function greet(name: string, greeting?: string): string {
  if (greeting) {
    return greeting + ", " + name
  }
  return "Hello, " + name
}

greet("Alan")              // "Hello, Alan"
greet("Alan", "Hi there") // "Hi there, Alan"
```

Optional parameters must come after required parameters.

## Default Parameters

You can provide a default value instead of using `?`. TypeScript infers the type from the default.

```typescript
function greet(name: string, greeting: string = "Hello"): string {
  return greeting + ", " + name
}

greet("Alan")           // "Hello, Alan"
greet("Alan", "Hey")    // "Hey, Alan"
```

## Rest Parameters

Use `...` to accept any number of arguments. The type is always an array.

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0)
}

sum(1, 2, 3)        // 6
sum(10, 20, 30, 40) // 100
```

## void and never

`void` is for functions that do not return a value:

```typescript
function log(message: string): void {
  console.log(message)
}
```

`never` is for functions that never return at all — they either throw an error or run forever:

```typescript
function throwError(message: string): never {
  throw new Error(message)
}
```

## Function Types

You can describe a function's type using an arrow syntax:

```typescript
type MathOperation = (a: number, b: number) => number

const add: MathOperation = (a, b) => a + b
const multiply: MathOperation = (a, b) => a * b
```

This is useful when passing functions as arguments:

```typescript
function apply(a: number, b: number, operation: MathOperation): number {
  return operation(a, b)
}

apply(3, 4, add)       // 7
apply(3, 4, multiply)  // 12
```

## Overloads

Function overloads let you define multiple signatures for one function that behaves differently based on input types.

```typescript
function format(value: string): string
function format(value: number): string
function format(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase()
  }
  return value.toFixed(2)
}

format("hello")  // "HELLO"
format(3.14)     // "3.14"
```

## Interview Questions

> _Q: What is the difference between optional parameters and default parameters in TypeScript?_

An optional parameter (`name?`) can be omitted when calling the function — its value inside the function will be `undefined` if not provided. A default parameter (`name = "Alan"`) also allows the argument to be omitted, but it falls back to the default value instead of `undefined`. Default parameters are generally more useful because you do not need to check for `undefined` inside the function.

> _Q: What is the difference between `void` and `never` as return types?_

`void` means the function completes normally but does not return a meaningful value — like a `console.log` wrapper. `never` means the function never reaches a return statement at all: it either always throws an error or runs in an infinite loop. A function returning `never` is a signal that execution cannot continue past it.

> _Q: How do you type a function that is passed as an argument?_

You use a function type, written as `(param: Type) => ReturnType`. For example, a callback that takes a number and returns a string would be typed as `(value: number) => string`. You can also define this as a named type alias and reuse it across multiple function signatures.
