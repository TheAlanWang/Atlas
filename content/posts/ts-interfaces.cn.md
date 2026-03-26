---
title: "Interface 与类型别名"
topic: typescript
section: Functions & Objects
order: 2
duration: 20
date: 2026-03-25
---

## 问题所在

`string`、`number` 这样的基本类型只能描述单个值。但怎么描述一个对象的结构呢？

```typescript
// 没有类型——完全不知道 user 长什么样
function greet(user) {
  return "你好，" + user.name
}
```

TypeScript 提供了两个工具：**interface** 和**类型别名（type alias）**。

## Interface

Interface 定义对象的结构。

```typescript
interface User {
  id: number
  name: string
  email: string
}

function greet(user: User): string {
  return "你好，" + user.name
}

const alan: User = { id: 1, name: "Alan", email: "alan@example.com" }
greet(alan)  // "你好，Alan"
```

如果传入的对象缺少必填字段，TypeScript 会立即报错。

## 可选属性

在属性名后加 `?` 表示可选。

```typescript
interface User {
  id: number
  name: string
  email?: string  // 可选
}

const user: User = { id: 1, name: "Alan" }  // 正常，不需要 email
```

## 只读属性

`readonly` 防止属性在创建后被重新赋值。

```typescript
interface User {
  readonly id: number
  name: string
}

const user: User = { id: 1, name: "Alan" }
user.name = "Bob"  // 正常
user.id = 2        // 错误：无法为 "id" 赋值，因为它是只读属性
```

## 继承 Interface

Interface 可以用 `extends` 继承另一个 interface 的所有属性。

```typescript
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

const dog: Dog = { name: "Rex", breed: "拉布拉多" }
```

## 类型别名（Type Alias）

类型别名用 `type` 关键字，同样可以描述对象结构。

```typescript
type User = {
  id: number
  name: string
  email?: string
}
```

类型别名还可以描述联合类型，这是 interface 做不到的：

```typescript
type ID = string | number
type Status = "active" | "inactive" | "pending"  // 字面量联合
```

## Interface vs 类型别名

两者都可以定义对象结构，主要区别如下：

| | Interface | 类型别名 |
|---|---|---|
| 对象结构 | 支持 | 支持 |
| 联合类型 | 不支持 | 支持 |
| 继承/扩展 | `extends` 关键字 | `&` 交叉类型 |
| 声明合并 | 支持 | 不支持 |

**实用规则：** 描述对象和类的契约用 `interface`，联合类型、交叉类型和工具类型用 `type`。

## 交叉类型

用 `&` 把多个类型合并成一个。

```typescript
type Employee = {
  id: number
  name: string
}

type Manager = Employee & {
  department: string
  reports: number
}

const manager: Manager = {
  id: 1,
  name: "Alan",
  department: "工程部",
  reports: 5
}
```

## 索引签名

当你不知道属性名，但知道键值的类型时，用索引签名。

```typescript
interface Scores {
  [subject: string]: number
}

const scores: Scores = {
  数学: 95,
  英语: 88,
  科学: 92
}
```

## 面试常问

> _Q: TypeScript 中 interface 和类型别名有什么区别？_

两者都可以定义对象结构。主要区别：类型别名可以描述联合类型（`string | number`），interface 不行。Interface 支持声明合并——同一作用域内两个同名 `interface User` 会自动合并。Interface 用 `extends` 继承，类型别名用 `&` 做交叉。实践中，描述对象结构和类的契约用 interface，联合类型、交叉类型和映射类型用 type。

> _Q: Interface 属性上 `?` 和 `readonly` 的区别是什么？_

`?` 让属性变成可选，创建对象时不必提供这个属性。`readonly` 让属性变成不可变，创建对象时必须提供，但之后不能修改。

> _Q: 什么是交叉类型？_

交叉类型用 `&` 把多个类型合并成一个，结果类型拥有所有被合并类型的全部属性。比如 `Employee & Manager` 要求同时具备 `Employee` 和 `Manager` 的所有属性。适合用来把小的、可复用的类型组合成更复杂的类型。
