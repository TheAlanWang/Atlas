---
title: "Utility Types"
topic: typescript
section: Advanced
order: 2
duration: 20
date: 2026-03-25
---

## What are Utility Types?

Utility types are built-in generic types that transform existing types into new ones. Instead of rewriting type definitions from scratch, you derive new types from existing ones.

```typescript
interface User {
  id: number
  name: string
  email: string
  age: number
}

// Instead of rewriting User with all optional fields:
type PartialUser = Partial<User>
// Equivalent to: { id?: number; name?: string; email?: string; age?: number }
```

## Partial\<T\>

Makes all properties of `T` optional.

```typescript
interface User {
  id: number
  name: string
  email: string
}

function updateUser(id: number, updates: Partial<User>): void {
  // updates can have any subset of User's properties
}

updateUser(1, { name: "Alan" })           // OK
updateUser(1, { name: "Alan", email: "..." }) // OK
```

`Partial` is the most common utility type. Use it whenever you need a subset of an object's properties, like in update functions.

## Required\<T\>

The opposite of `Partial`. Makes all properties required, even optional ones.

```typescript
interface Config {
  host?: string
  port?: number
}

type StrictConfig = Required<Config>
// { host: string; port: number }  — both required now
```

## Readonly\<T\>

Makes all properties readonly. Useful for representing immutable data.

```typescript
interface User {
  id: number
  name: string
}

const user: Readonly<User> = { id: 1, name: "Alan" }
user.name = "Bob"  // Error: Cannot assign to 'name' because it is a read-only property
```

## Pick\<T, K\>

Creates a new type with only the specified properties from `T`.

```typescript
interface User {
  id: number
  name: string
  email: string
  password: string
}

type PublicUser = Pick<User, "id" | "name" | "email">
// { id: number; name: string; email: string }
// password is excluded — safe to send to the frontend
```

## Omit\<T, K\>

The opposite of `Pick`. Creates a new type with all properties of `T` except the specified ones.

```typescript
type PublicUser = Omit<User, "password">
// { id: number; name: string; email: string }
```

`Pick` is better when you know exactly what to keep. `Omit` is better when you know what to exclude.

## Record\<K, V\>

Creates an object type where all keys are of type `K` and all values are of type `V`.

```typescript
type Scores = Record<string, number>

const scores: Scores = {
  math: 95,
  english: 88,
  science: 92
}

// With a union key type — only specific keys are allowed
type Role = "admin" | "editor" | "viewer"
type Permissions = Record<Role, boolean>

const permissions: Permissions = {
  admin: true,
  editor: true,
  viewer: false
}
```

## ReturnType\<T\>

Extracts the return type of a function type.

```typescript
function getUser() {
  return { id: 1, name: "Alan" }
}

type User = ReturnType<typeof getUser>
// { id: number; name: string }
```

Useful when you want to reuse the return type of a function without defining a separate interface.

## Combining Utility Types

Utility types can be composed together.

```typescript
interface User {
  id: number
  name: string
  email: string
  password: string
}

// A partial update payload that excludes id and password
type UpdatePayload = Partial<Omit<User, "id" | "password">>
// { name?: string; email?: string }
```

## Interview Questions

> _Q: What is `Partial<T>` and when would you use it?_

`Partial<T>` creates a new type where all properties of `T` are optional. It is commonly used for update payloads, where you only want to modify some fields of an object rather than providing all of them. For example, a `PATCH` API endpoint typically accepts a `Partial<User>` rather than a full `User`.

> _Q: What is the difference between `Pick` and `Omit`?_

Both create a subset of an existing type. `Pick<T, K>` keeps only the properties you specify. `Omit<T, K>` keeps everything except the properties you specify. Use `Pick` when you know exactly what you want to keep; use `Omit` when it is easier to describe what to exclude.

> _Q: What is `Record<K, V>` and how is it different from an index signature?_

`Record<K, V>` creates an object type where every key is of type `K` and every value is of type `V`. When `K` is a union of string literals, it enforces that all specified keys are present — making it exhaustive. An index signature (`{ [key: string]: V }`) allows any string key, with no enforcement of which keys must exist. Use `Record` when you have a known, fixed set of keys; use index signatures for dynamic keys.
