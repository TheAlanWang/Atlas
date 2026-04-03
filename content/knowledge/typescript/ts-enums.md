---
title: "Enums"
topic: typescript
section: Functions & Objects
order: 3
duration: 10
date: 2026-03-25
---

## What is an Enum?

An enum is a set of named constants. Instead of using raw strings or numbers scattered through your code, you group related values under a meaningful name.

```typescript
// Without enum — magic strings everywhere
function setDirection(dir: string) { ... }
setDirection("north")  // easy to typo, no autocomplete

// With enum
enum Direction {
  North,
  South,
  East,
  West
}

function setDirection(dir: Direction) { ... }
setDirection(Direction.North)  // autocomplete, no typos
```

## Numeric Enums

By default, TypeScript assigns numeric values starting from 0.

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

You can set a custom starting value:

```typescript
enum StatusCode {
  OK = 200,
  NotFound = 404,
  ServerError = 500
}

console.log(StatusCode.OK)       // 200
console.log(StatusCode.NotFound) // 404
```

## String Enums

String enums are more readable and easier to debug because the values are meaningful strings.

```typescript
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

const userStatus: Status = Status.Active
console.log(userStatus)  // "ACTIVE"
```

Prefer string enums in most cases — numeric values are meaningless in logs and API responses.

## Using Enums in Practice

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

## Const Enums

Adding `const` before `enum` makes it disappear at compile time. TypeScript replaces enum references with their literal values, which results in smaller and faster JavaScript output.

```typescript
const enum Direction {
  North = "NORTH",
  South = "SOUTH"
}

const dir = Direction.North
// Compiles to: const dir = "NORTH"
// The enum object no longer exists in the output
```

## When to Use Enums vs Union Types

String union types are a simpler alternative to string enums:

```typescript
// Union type
type Status = "ACTIVE" | "INACTIVE" | "PENDING"

// Enum
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}
```

Both give you autocomplete and type safety. Union types are simpler and more common in modern TypeScript. Enums are better when you need the enum object at runtime (to iterate over values, or pass the type to a function).

## Key Questions

> _Q: What is an enum in TypeScript and when would you use one?_

An enum is a named set of constants. It groups related values under a meaningful name, giving you autocomplete and preventing typos compared to raw strings or numbers. Use enums when you have a fixed set of related values that will not change, like directions, status codes, or user roles.

> _Q: What is the difference between a numeric enum and a string enum?_

Numeric enums assign integer values (starting from 0 by default). String enums assign explicit string values. String enums are generally preferred because the values remain meaningful in logs, API responses, and debugging. Numeric enum values are opaque without the enum definition.

> _Q: What is the difference between an enum and a union type in TypeScript?_

Both provide type safety for a fixed set of values. Union types (`"active" | "inactive"`) are simpler, more lightweight, and more idiomatic in modern TypeScript. Enums generate a real JavaScript object at runtime, which lets you iterate over values or use the enum as a value. Union types are purely a TypeScript construct and compile to nothing. For most use cases, union types are preferred for their simplicity.
