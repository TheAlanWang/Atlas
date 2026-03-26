---
title: "Type Narrowing"
topic: typescript
section: Foundations
order: 3
duration: 15
date: 2026-03-25
---

## What is Type Narrowing?

Type narrowing is when TypeScript refines a broad type into a more specific one based on a runtime check. Inside the check, TypeScript knows the type is more specific and unlocks the methods and properties that come with it.

```typescript
function printLength(value: string | number) {
  if (typeof value === "string") {
    console.log(value.length)  // TypeScript knows value is string here
  } else {
    console.log(value.toFixed(2))  // TypeScript knows value is number here
  }
}
```

Without the `typeof` check, TypeScript would not allow you to call `.length` because `number` does not have that property.

## typeof Narrowing

`typeof` works well for primitive types: `string`, `number`, `boolean`, `undefined`.

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

## Truthiness Narrowing

Checking if a value is truthy also narrows its type by removing `null` and `undefined`.

```typescript
function greet(name: string | null) {
  if (name) {
    console.log("Hello, " + name.toUpperCase())  // name is string here
  } else {
    console.log("Hello, stranger")
  }
}
```

## instanceof Narrowing

`instanceof` narrows to a class type.

```typescript
class Dog {
  bark() { console.log("Woof!") }
}

class Cat {
  meow() { console.log("Meow!") }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark()   // TypeScript knows it's a Dog
  } else {
    animal.meow()   // TypeScript knows it's a Cat
  }
}
```

## in Narrowing

The `in` operator checks if a property exists on an object, which narrows between object types.

```typescript
type Admin = { role: "admin"; permissions: string[] }
type User = { role: "user"; email: string }

function describe(person: Admin | User) {
  if ("permissions" in person) {
    console.log("Admin with permissions:", person.permissions)
  } else {
    console.log("User email:", person.email)
  }
}
```

## Discriminated Unions

A discriminated union is a pattern where each type in a union has a shared literal field (called a discriminant) that uniquely identifies it. TypeScript can narrow the union by checking that field.

```typescript
type Circle = { shape: "circle"; radius: number }
type Square = { shape: "square"; side: number }
type Shape = Circle | Square

function getArea(shape: Shape): number {
  switch (shape.shape) {
    case "circle":
      return Math.PI * shape.radius ** 2   // shape is Circle here
    case "square":
      return shape.side ** 2               // shape is Square here
  }
}
```

The `shape` field is the discriminant. This pattern is very common in TypeScript because it is explicit and exhaustive — if you add a new type to the union, TypeScript will warn you about unhandled cases.

## Interview Questions

> _Q: What is type narrowing in TypeScript?_

Type narrowing is the process of refining a variable's type from a broad type to a more specific one based on a runtime check. TypeScript tracks these checks and adjusts what it knows about the type inside the branch. Common narrowing techniques include `typeof`, `instanceof`, `in`, and truthiness checks.

> _Q: What is a discriminated union and why is it useful?_

A discriminated union is a union type where each member has a shared literal field with a unique value, called the discriminant. By checking the discriminant, TypeScript can narrow the union to a specific type. It is useful because it makes branching explicit and exhaustive — TypeScript can warn you if you forget to handle a case when you add a new member to the union.

> _Q: What is the difference between `typeof` and `instanceof` for type narrowing?_

`typeof` is used for primitive types: it returns a string like `"string"`, `"number"`, `"boolean"`, or `"undefined"`. `instanceof` is used for class instances: it checks whether an object was created with a specific constructor. Use `typeof` for primitives, `instanceof` for objects created from classes.
