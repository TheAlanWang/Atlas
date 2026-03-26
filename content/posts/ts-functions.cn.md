---
title: "函数类型"
topic: typescript
section: Functions & Objects
order: 1
duration: 15
date: 2026-03-25
---

## 给参数和返回值加类型

在参数名和返回值后面加 `: 类型`。

```typescript
function add(a: number, b: number): number {
  return a + b
}

function greet(name: string): string {
  return "你好，" + name
}
```

传错类型或者返回错误类型，TypeScript 都会报错。

## 可选参数

在参数名后面加 `?` 表示可选。不传时，该参数的值为 `undefined`。

```typescript
function greet(name: string, greeting?: string): string {
  if (greeting) {
    return greeting + "，" + name
  }
  return "你好，" + name
}

greet("Alan")              // "你好，Alan"
greet("Alan", "嗨")        // "嗨，Alan"
```

可选参数必须放在必填参数之后。

## 默认参数

可以直接给参数设置默认值，不用写 `?`。TypeScript 会从默认值推断类型。

```typescript
function greet(name: string, greeting: string = "你好"): string {
  return greeting + "，" + name
}

greet("Alan")         // "你好，Alan"
greet("Alan", "嗨")   // "嗨，Alan"
```

## Rest 参数

用 `...` 接受任意数量的参数，类型永远是数组。

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0)
}

sum(1, 2, 3)        // 6
sum(10, 20, 30, 40) // 100
```

## void 和 never

`void` 用于没有返回值的函数：

```typescript
function log(message: string): void {
  console.log(message)
}
```

`never` 用于永远不会正常返回的函数——要么抛出错误，要么永远运行：

```typescript
function throwError(message: string): never {
  throw new Error(message)
}
```

## 函数类型

用箭头语法描述一个函数的类型：

```typescript
type MathOperation = (a: number, b: number) => number

const add: MathOperation = (a, b) => a + b
const multiply: MathOperation = (a, b) => a * b
```

在函数作为参数传递时很有用：

```typescript
function apply(a: number, b: number, operation: MathOperation): number {
  return operation(a, b)
}

apply(3, 4, add)       // 7
apply(3, 4, multiply)  // 12
```

## 函数重载

函数重载允许你为同一个函数定义多个签名，让它根据输入类型有不同的行为。

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

## 面试常问

> _Q: TypeScript 中可选参数和默认参数有什么区别？_

可选参数（`name?`）调用时可以不传，函数内部该值为 `undefined`。默认参数（`name = "Alan"`）也允许不传，但会使用默认值而不是 `undefined`。默认参数通常更实用，因为函数内部不需要再判断是否为 `undefined`。

> _Q: `void` 和 `never` 作为返回类型有什么区别？_

`void` 表示函数正常执行完毕但没有有意义的返回值，比如一个封装 `console.log` 的函数。`never` 表示函数永远不会执行到 return 语句，要么总是抛出错误，要么进入无限循环。返回 `never` 的函数意味着执行流程不可能继续到它之后。

> _Q: 怎么给作为参数传递的函数加类型？_

使用函数类型，写法是 `(参数: 类型) => 返回类型`。例如，接受一个 number 并返回 string 的回调，类型写作 `(value: number) => string`。也可以把它定义成命名类型别名，在多个函数签名中复用。
