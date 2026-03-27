---
title: "什么是 TypeScript？"
topic: typescript
section: Foundations
order: 1
duration: 10
date: 2026-03-25
---

## JavaScript 的问题

JavaScript 很灵活，但可能灵活过头了。它允许你做一些会在运行时崩溃的事，却不提前警告你。

```javascript
function add(a, b) {
  return a + b
}

add(1, 2)       // 3，正确
add("1", 2)     // "12"，错误，但 JavaScript 不报错
add(1)          // NaN，运行之前没有任何报错
```

只有代码真正运行的时候你才会发现问题，而那时候可能已经是线上环境，有真实用户在用了。

## 什么是 TypeScript？

TypeScript 是加了类型的 JavaScript。你给变量和函数标注类型信息，TypeScript 会在代码运行之前帮你检查。

```typescript
function add(a: number, b: number): number {
  return a + b
}

add(1, 2)       // 正常
add("1", 2)     // 错误：类型 'string' 的参数不能赋给类型 'number' 的参数
add(1)          // 错误：需要 2 个参数，但只传了 1 个
```

错误会在你写代码的时候直接显示在编辑器里，而不是等到上线才发现。

## TypeScript 编译成 JavaScript

浏览器和 Node.js 不能直接运行 TypeScript，TypeScript 会被编译成普通的 JavaScript。

```
你的代码（TypeScript）→ TypeScript 编译器（tsc）→ JavaScript → 浏览器 / Node.js
```

类型只在开发阶段存在，运行时就是普通的 JavaScript。

## 为什么用 TypeScript？

**提前发现 bug。** 类型错误在编译阶段就被捕获，而不是运行时。在上线前发现的 bug，代价远比上线后发现的小。

**更好的编辑器支持。** 因为 TypeScript 了解数据的结构，编辑器可以自动补全属性、展示内联文档，还能在你打字的时候标出错误。

**代码更易读。** 类型本身就是文档。看到一个函数签名，你立刻就知道它需要什么、返回什么，不用去读实现细节。

**适合大型项目。** 在有很多开发者的大型项目中，TypeScript 能防止整整一类 bug，而这类 bug 随着代码量增长会越来越难追踪。

## TypeScript 和 JavaScript 完全兼容

TypeScript 是 JavaScript 的超集，任何合法的 JavaScript 代码也是合法的 TypeScript 代码。你可以把 `.js` 文件改名为 `.ts`，然后慢慢加类型，逐步迁移。

```typescript
// 合法的 TypeScript，没有添加任何类型，一样可以运行
const name = "Alan"
const age = 25
console.log(name, age)
```

## 面试常问

> _Q: 什么是 TypeScript？它和 JavaScript 有什么关系？_

TypeScript 是 JavaScript 的超集，在 JavaScript 基础上增加了静态类型注解。它编译成普通 JavaScript，可以在任何 JavaScript 运行的地方运行。TypeScript 增加了一个编译时类型检查器，能在代码执行前发现类型错误，提升了代码可靠性和开发工具体验。任何合法的 JavaScript 也是合法的 TypeScript，因此可以逐步迁移。

> _Q: 编译时错误和运行时错误有什么区别？_

运行时错误发生在程序实际运行时，用户可能会看到崩溃或意外行为。编译时错误在执行前的构建阶段就被捕获。TypeScript 把很多常见 bug 从运行时提前到了编译时，在开发阶段就能发现，而不是等到上线后。

> _Q: TypeScript 编译成 JavaScript，那类型有什么意义？_

类型只在开发阶段存在，它给编译器和编辑器提供了足够的信息来发现错误、提供自动补全和内联文档。运行时，所有类型注解都会被剥离，只剩下普通 JavaScript。它的价值完全在于开发体验的提升，以及在上线前预防的那些 bug。
