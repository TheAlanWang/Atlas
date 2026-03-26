---
title: "What is TypeScript?"
topic: typescript
section: Foundations
order: 1
duration: 10
date: 2026-03-25
---

## JavaScript Has a Problem

JavaScript is flexible — maybe too flexible. It lets you do things that will break at runtime without warning you upfront.

```javascript
function add(a, b) {
  return a + b
}

add(1, 2)       // 3 — correct
add("1", 2)     // "12" — wrong, but JavaScript doesn't complain
add(1)          // NaN — no error until you run it
```

You only find out something is wrong when the code actually runs, which could be in production with real users.

## What is TypeScript?

TypeScript is JavaScript with types added. You annotate your variables and functions with type information, and TypeScript checks them before your code ever runs.

```typescript
function add(a: number, b: number): number {
  return a + b
}

add(1, 2)       // OK
add("1", 2)     // Error: Argument of type 'string' is not assignable to parameter of type 'number'
add(1)          // Error: Expected 2 arguments, but got 1
```

The errors show up in your editor as you type, not in production.

## TypeScript Compiles to JavaScript

Browsers and Node.js do not run TypeScript directly. TypeScript compiles down to plain JavaScript.

```
your code (TypeScript) → TypeScript compiler (tsc) → JavaScript → browser / Node.js
```

The types only exist during development. At runtime, it is just JavaScript.

## Why Use TypeScript?

**Catch bugs early.** Type errors are caught at compile time, not at runtime. A bug caught before deployment is far cheaper than one found in production.

**Better editor support.** Because TypeScript knows the shape of your data, your editor can autocomplete properties, show inline documentation, and flag mistakes as you type.

**Easier to read.** Types are documentation. When you see a function signature, you immediately know what it expects and what it returns — without reading the implementation.

**Scales with your codebase.** In large projects with many developers, TypeScript prevents an entire category of bugs that become very hard to track down as the code grows.

## TypeScript and JavaScript Are Compatible

TypeScript is a superset of JavaScript — any valid JavaScript is also valid TypeScript. You can adopt TypeScript gradually by renaming `.js` files to `.ts` and adding types over time.

```typescript
// Valid TypeScript — no types added yet, still works
const name = "Alan"
const age = 25
console.log(name, age)
```

## Interview Questions

> _Q: What is TypeScript and how does it relate to JavaScript?_

TypeScript is a superset of JavaScript that adds static type annotations. It compiles to plain JavaScript, so it runs anywhere JavaScript runs. TypeScript adds a compile-time type checker that catches type errors before the code executes, improving reliability and developer tooling. Any valid JavaScript is also valid TypeScript, so you can adopt it gradually.

> _Q: What is the difference between compile-time and runtime errors?_

A runtime error occurs when the program is actually running — the user might see a crash or unexpected behavior. A compile-time error is caught before execution, during the build step. TypeScript moves many common bugs from runtime to compile time, so they are caught during development rather than in production.

> _Q: If TypeScript compiles to JavaScript, what is the point of the types?_

The types exist only during development. They give the compiler and your editor enough information to catch mistakes, provide autocompletion, and inline documentation. At runtime, all type annotations are stripped away and only plain JavaScript remains. The benefit is entirely in the development experience and the bugs prevented before shipping.
