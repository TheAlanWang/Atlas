---
title: "工具类型（Utility Types）"
topic: typescript
section: Advanced
order: 2
duration: 20
date: 2026-03-25
---

## 什么是工具类型？

工具类型是 TypeScript 内置的泛型类型，用于把现有类型转换成新类型。不用从头重写类型定义，而是从已有类型派生出新类型。

```typescript
interface User {
  id: number
  name: string
  email: string
  age: number
}

// 不用把 User 的所有字段重新写成可选的，直接用：
type PartialUser = Partial<User>
// 等价于：{ id?: number; name?: string; email?: string; age?: number }
```

## Partial\<T\>

把 `T` 的所有属性变成可选。

```typescript
interface User {
  id: number
  name: string
  email: string
}

function updateUser(id: number, updates: Partial<User>): void {
  // updates 可以是 User 属性的任意子集
}

updateUser(1, { name: "Alan" })                  // 正常
updateUser(1, { name: "Alan", email: "..." })    // 正常
```

`Partial` 是最常用的工具类型。需要对象属性的子集时就用它，比如更新函数。

## Required\<T\>

`Partial` 的反面，把所有属性变为必填，包括原来的可选属性。

```typescript
interface Config {
  host?: string
  port?: number
}

type StrictConfig = Required<Config>
// { host: string; port: number }，两个都变成必填了
```

## Readonly\<T\>

把所有属性变为只读，适合表示不可变数据。

```typescript
interface User {
  id: number
  name: string
}

const user: Readonly<User> = { id: 1, name: "Alan" }
user.name = "Bob"  // 错误：无法为 "name" 赋值，因为它是只读属性
```

## Pick\<T, K\>

从 `T` 中只保留指定的属性，创建新类型。

```typescript
interface User {
  id: number
  name: string
  email: string
  password: string
}

type PublicUser = Pick<User, "id" | "name" | "email">
// { id: number; name: string; email: string }
// password 被排除，可以安全地返回给前端
```

## Omit\<T, K\>

`Pick` 的反面，保留 `T` 的所有属性，但排除指定的属性。

```typescript
type PublicUser = Omit<User, "password">
// { id: number; name: string; email: string }
```

知道要保留什么时用 `Pick`，知道要排除什么时用 `Omit`。

## Record\<K, V\>

创建一个对象类型，所有键的类型是 `K`，所有值的类型是 `V`。

```typescript
type Scores = Record<string, number>

const scores: Scores = {
  数学: 95,
  英语: 88,
  科学: 92
}

// 用联合类型作为键，只允许特定的键
type Role = "admin" | "editor" | "viewer"
type Permissions = Record<Role, boolean>

const permissions: Permissions = {
  admin: true,
  editor: true,
  viewer: false
}
```

## ReturnType\<T\>

提取函数类型的返回值类型。

```typescript
function getUser() {
  return { id: 1, name: "Alan" }
}

type User = ReturnType<typeof getUser>
// { id: number; name: string }
```

想复用函数的返回类型又不想单独定义 interface 时很有用。

## 组合工具类型

工具类型可以嵌套组合。

```typescript
interface User {
  id: number
  name: string
  email: string
  password: string
}

// 不含 id 和 password 的可选更新载荷
type UpdatePayload = Partial<Omit<User, "id" | "password">>
// { name?: string; email?: string }
```

## 关键问题

> _Q: 什么是 `Partial<T>`？什么时候用它？_

`Partial<T>` 创建一个新类型，其中 `T` 的所有属性都是可选的。常用于更新载荷场景，只需修改对象的部分字段而不是提供全部字段。例如，`PATCH` 接口通常接受 `Partial<User>` 而不是完整的 `User`。

> _Q: `Pick` 和 `Omit` 有什么区别？_

两者都从现有类型创建子集。`Pick<T, K>` 只保留你指定的属性，`Omit<T, K>` 保留所有属性，但排除你指定的属性。知道要保留什么时用 `Pick`，知道要排除什么时用 `Omit`。

> _Q: `Record<K, V>` 和索引签名有什么区别？_

`Record<K, V>` 创建一个对象类型，每个键的类型是 `K`，每个值的类型是 `V`。当 `K` 是字符串字面量联合类型时，它会强制要求所有指定的键都存在，具有穷举性。索引签名（`{ [key: string]: V }`）允许任意字符串键，不强制要求哪些键必须存在。键的集合固定时用 `Record`，键是动态的时用索引签名。
