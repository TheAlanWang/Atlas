---
title: "类型收窄（Type Narrowing）"
topic: typescript
section: Foundations
order: 3
duration: 15
date: 2026-03-25
---

## 什么是类型收窄？

类型收窄是指 TypeScript 根据运行时检查，把一个宽泛的类型精确到更具体的类型。在检查内部，TypeScript 知道类型更具体了，因此可以使用该类型特有的方法和属性。

```typescript
function printLength(value: string | number) {
  if (typeof value === "string") {
    console.log(value.length)  // TypeScript 知道这里 value 是 string
  } else {
    console.log(value.toFixed(2))  // TypeScript 知道这里 value 是 number
  }
}
```

没有 `typeof` 检查的话，TypeScript 不允许你调用 `.length`，因为 `number` 没有这个属性。

## typeof 收窄

`typeof` 适用于基本类型：`string`、`number`、`boolean`、`undefined`。

```typescript
function format(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase()
  }
  return value.toFixed(2)
}

format("hello")  // "HELLO"
format(3.14159)  // "3.14"
```

## 真值收窄

判断值是否为真值也可以收窄类型，会排除 `null` 和 `undefined`。

```typescript
function greet(name: string | null) {
  if (name) {
    console.log("你好，" + name.toUpperCase())  // 这里 name 是 string
  } else {
    console.log("你好，陌生人")
  }
}
```

## instanceof 收窄

`instanceof` 收窄到某个类的实例类型。

```typescript
class Dog {
  bark() { console.log("汪！") }
}

class Cat {
  meow() { console.log("喵！") }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark()   // TypeScript 知道是 Dog
  } else {
    animal.meow()   // TypeScript 知道是 Cat
  }
}
```

## in 收窄

`in` 运算符检查对象上是否存在某个属性，从而在对象类型之间收窄。

```typescript
type Admin = { role: "admin"; permissions: string[] }
type User = { role: "user"; email: string }

function describe(person: Admin | User) {
  if ("permissions" in person) {
    console.log("管理员权限：", person.permissions)
  } else {
    console.log("用户邮箱：", person.email)
  }
}
```

## 可辨识联合（Discriminated Union）

可辨识联合是一种模式：联合中的每个类型都有一个共同的字面量字段（称为判别字段），用来唯一标识它。TypeScript 可以通过检查这个字段来收窄联合类型。

```typescript
type Circle = { shape: "circle"; radius: number }
type Square = { shape: "square"; side: number }
type Shape = Circle | Square

function getArea(shape: Shape): number {
  switch (shape.shape) {
    case "circle":
      return Math.PI * shape.radius ** 2   // 这里 shape 是 Circle
    case "square":
      return shape.side ** 2               // 这里 shape 是 Square
  }
}
```

`shape` 字段就是判别字段。这个模式在 TypeScript 中非常常见，因为它明确且穷举——如果你给联合加了新类型，TypeScript 会提醒你处理新的分支。

## 面试常问

> _Q: 什么是 TypeScript 中的类型收窄？_

类型收窄是根据运行时检查，把变量的类型从宽泛类型精确到更具体类型的过程。TypeScript 会追踪这些检查，并在分支内部调整它对类型的认知。常见的收窄手段包括 `typeof`、`instanceof`、`in` 和真值检查。

> _Q: 什么是可辨识联合？为什么有用？_

可辨识联合是一种联合类型，其中每个成员都有一个共同的字面量字段，称为判别字段，每个成员的值都不同。通过检查判别字段，TypeScript 可以将联合类型收窄到具体的某个类型。它的价值在于让分支处理变得明确且穷举——当你向联合中加入新成员时，TypeScript 会提醒你补上遗漏的分支。

> _Q: `typeof` 和 `instanceof` 做类型收窄有什么区别？_

`typeof` 用于基本类型，返回 `"string"`、`"number"`、`"boolean"`、`"undefined"` 等字符串。`instanceof` 用于类实例，检查一个对象是否由特定构造函数创建。基本类型用 `typeof`，类实例用 `instanceof`。
