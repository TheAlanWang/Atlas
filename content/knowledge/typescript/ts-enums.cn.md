---
title: "枚举（Enum）"
topic: typescript
section: Functions & Objects
order: 3
duration: 10
date: 2026-03-25
---

## 什么是枚举？

枚举是一组有名字的常量。与其在代码里散落着原始字符串或数字，不如把相关的值集中在一个有意义的名字下。

```typescript
// 没有枚举，到处都是"魔法字符串"
function setDirection(dir: string) { ... }
setDirection("north")  // 容易拼错，没有自动补全

// 用枚举
enum Direction {
  North,
  South,
  East,
  West
}

function setDirection(dir: Direction) { ... }
setDirection(Direction.North)  // 自动补全，不会拼错
```

## 数字枚举

默认情况下，TypeScript 从 0 开始自动分配数字值。

```typescript
enum Direction {
  North,   // 0
  South,   // 1
  East,    // 2
  West     // 3
}

console.log(Direction.North)  // 0
console.log(Direction.East)   // 2
```

可以自定义起始值：

```typescript
enum StatusCode {
  OK = 200,
  NotFound = 404,
  ServerError = 500
}

console.log(StatusCode.OK)       // 200
console.log(StatusCode.NotFound) // 404
```

## 字符串枚举

字符串枚举可读性更好，调试也更方便，因为值本身就有意义。

```typescript
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

const userStatus: Status = Status.Active
console.log(userStatus)  // "ACTIVE"
```

大多数情况下优先用字符串枚举——数字值在日志和 API 响应里没有任何意义。

## 实际使用

```typescript
enum Role {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER"
}

interface User {
  name: string
  role: Role
}

function canEdit(user: User): boolean {
  return user.role === Role.Admin || user.role === Role.Editor
}

const user: User = { name: "Alan", role: Role.Admin }
canEdit(user)  // true
```

## Const 枚举

在 `enum` 前加 `const`，枚举在编译时会消失。TypeScript 直接把枚举引用替换为对应的字面量值，生成更小、更快的 JavaScript 输出。

```typescript
const enum Direction {
  North = "NORTH",
  South = "SOUTH"
}

const dir = Direction.North
// 编译结果：const dir = "NORTH"
// 枚举对象在输出中不再存在
```

## 枚举 vs 联合类型

字符串联合类型是字符串枚举的更简单替代：

```typescript
// 联合类型
type Status = "ACTIVE" | "INACTIVE" | "PENDING"

// 枚举
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}
```

两者都有自动补全和类型安全。联合类型更简单，在现代 TypeScript 中更常见。如果你需要在运行时使用枚举对象（比如遍历所有值，或把类型传给某个函数），才用枚举。

## 关键问题

> _Q: TypeScript 中的枚举是什么？什么时候用它？_

枚举是一组命名常量，把相关的值集中在一个有意义的名字下，带来自动补全并防止拼写错误。适合在有一组固定的、不会变化的相关值时使用，比如方向、状态码或用户角色。

> _Q: 数字枚举和字符串枚举有什么区别？_

数字枚举自动分配整数值（默认从 0 开始）。字符串枚举需要显式赋予字符串值。通常优先用字符串枚举，因为值本身在日志、API 响应和调试中都有意义。数字枚举的值离开枚举定义就没法看懂了。

> _Q: 枚举和联合类型有什么区别？_

两者对固定值集合都提供类型安全。联合类型（`"active" | "inactive"`）更简单、更轻量，在现代 TypeScript 中更符合惯用写法。枚举在运行时会生成一个真实的 JavaScript 对象，可以遍历值或把枚举当作值传递。联合类型纯粹是 TypeScript 的构造，编译后什么都不剩。大多数场景下，联合类型因其简洁性而被优先选择。
