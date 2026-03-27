---
title: "Interfaces & Type Aliases"
topic: typescript
section: Functions & Objects
order: 2
duration: 20
date: 2026-03-25
---

## The Problem

Primitive types like `string` and `number` work for single values. But how do you describe the shape of an object?

```typescript
// Without types — no idea what user looks like
function greet(user) {
  return "Hello, " + user.name
}
```

TypeScript offers two tools for this: **interfaces** and **type aliases**.

## Interfaces

An interface defines the shape of an object.

```typescript
interface User {
  id: number
  name: string
  email: string
}

function greet(user: User): string {
  return "Hello, " + user.name
}

const alan: User = { id: 1, name: "Alan", email: "alan@example.com" }
greet(alan)  // "Hello, Alan"
```

If you pass an object missing a required field, TypeScript errors immediately.

## Optional Properties

Add `?` to make a property optional.

```typescript
interface User {
  id: number
  name: string
  email?: string  // optional
}

const user: User = { id: 1, name: "Alan" }  // OK — email not required
```

## Readonly Properties

`readonly` prevents a property from being reassigned after creation.

```typescript
interface User {
  readonly id: number
  name: string
}

const user: User = { id: 1, name: "Alan" }
user.name = "Bob"  // OK
user.id = 2        // Error: Cannot assign to 'id' because it is a read-only property
```

## Extending Interfaces

Interfaces can extend other interfaces to inherit their properties.

```typescript
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

const dog: Dog = { name: "Rex", breed: "Labrador" }
```

## Type Aliases

A type alias uses the `type` keyword and can describe objects the same way as an interface.

```typescript
type User = {
  id: number
  name: string
  email?: string
}
```

Type aliases can also describe union types, which interfaces cannot:

```typescript
type ID = string | number
type Status = "active" | "inactive" | "pending"  // literal union
```

## Interface vs Type Alias

Both work for defining object shapes. The key differences:

| | Interface | Type Alias |
|---|---|---|
| Object shapes | Yes | Yes |
| Union types | No | Yes |
| Extending | `extends` keyword | `&` intersection |
| Declaration merging | Yes | No |

**Practical rule:** Use `interface` for objects and class contracts. Use `type` for unions, intersections, and utility types.

## Intersection Types

Use `&` to combine multiple types into one.

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
  department: "Engineering",
  reports: 5
}
```

## Index Signatures

Use an index signature when you do not know the property names upfront but you know the types.

```typescript
interface Scores {
  [subject: string]: number
}

const scores: Scores = {
  math: 95,
  english: 88,
  science: 92
}
```

## Interview Questions

> _Q: What is the difference between an interface and a type alias in TypeScript?_

Both can define the shape of an object. The main differences: type aliases can describe union types (`string | number`), interfaces cannot. Interfaces support declaration merging — two `interface User` declarations in the same scope are automatically merged. Interfaces use `extends` to inherit from other interfaces; type aliases use `&` for intersections. In practice, use interfaces for object shapes and class contracts, and type aliases for unions, intersections, and mapped types.

> _Q: What is the difference between `?` and `readonly` on interface properties?_

`?` makes a property optional — it does not need to be present when creating the object. `readonly` makes a property immutable — it must be provided when creating the object, but cannot be changed afterward.

> _Q: What is an intersection type?_

An intersection type combines multiple types into one using `&`. The resulting type has all properties from all the combined types. For example, `Employee & Manager` requires all properties from both `Employee` and `Manager`. It is useful for composing types from smaller, reusable pieces.
