---
title: "Components & JSX"
topic: react
section: Fundamentals
order: 1
duration: 25
date: 2026-03-21
---

## 什么是组件？

React 组件就是一个**返回 JSX 的函数**。组件是 React 应用的基本单元——每个按钮、表单、页面都是组件。

```jsx
function Hello() {
  return <h1>Hello, world!</h1>
}
```

组件名必须以**大写字母**开头。React 用首字母大小写来区分 HTML 标签（`<div>`）和自定义组件（`<Hello />`）。

## 什么是 JSX？

JSX 看起来像 HTML，但它其实是 JavaScript。JSX 会被编译成 `React.createElement()` 调用——你不需要手写那些。

```jsx
// 你写的
const element = <h1 className="title">Hello</h1>

// 编译后变成
const element = React.createElement('h1', { className: 'title' }, 'Hello')
```

和 HTML 的两个主要区别：

- 用 `className` 而不是 `class`（因为 `class` 是 JavaScript 保留字）
- 事件处理用驼峰命名：`onClick`、`onChange`、`onSubmit`

## 在 JSX 里嵌入 JavaScript

用花括号 `{}` 在 JSX 里插入任意 JavaScript 表达式：

```jsx
const name = "Alan"
const age = 25

return (
  <div>
    <p>姓名：{name}</p>
    <p>年龄：{age}</p>
    <p>出生年份：{2026 - age}</p>
  </div>
)
```

`{}` 里可以放变量、函数调用、三元表达式、算术运算——任何 JavaScript 表达式都行。

## 只能有一个根元素

组件只能返回一个根元素。用 `<div>` 或 Fragment 把兄弟元素包起来：

```jsx
// ❌ 两个根元素——不行
return (
  <h1>标题</h1>
  <p>内容</p>
)

// ✅ 用 div 包起来
return (
  <div>
    <h1>标题</h1>
    <p>内容</p>
  </div>
)

// ✅ Fragment——不会生成多余的 DOM 节点
return (
  <>
    <h1>标题</h1>
    <p>内容</p>
  </>
)
```

当你不想让多余的 `<div>` 影响布局或样式时，用 Fragment。

## 条件渲染

用三元表达式或 `&&` 来条件渲染元素：

```jsx
const isLoggedIn = true

// 三元表达式
return <p>{isLoggedIn ? "欢迎回来！" : "请先登录。"}</p>

// && ——只有条件为 true 时才渲染
return <div>{isLoggedIn && <UserProfile />}</div>
```

## 列表渲染

用 `.map()` 渲染列表。每个元素需要一个唯一的 `key` prop，让 React 能追踪变化：

```jsx
const fruits = ["苹果", "香蕉", "樱桃"]

return (
  <ul>
    {fruits.map((fruit) => (
      <li key={fruit}>{fruit}</li>
    ))}
  </ul>
)
```

## 关键问题

> _Q：JSX 和 HTML 有什么区别？_

JSX 是 JavaScript 的语法扩展，会被编译成 `React.createElement()` 调用。HTML 是标记语言，由浏览器直接解析。JSX 里用 `className` 而不是 `class`，事件处理器用驼峰命名（`onClick`），可以用 `{}` 嵌入 JavaScript 表达式。

> _Q：为什么组件名必须大写？_

React 用首字母大小写区分 HTML 标签和自定义组件。小写的 `<div>` 被当成原生 HTML 元素处理；大写的 `<MyComponent>` 被当成自定义组件，React 会在当前作用域里找它。

> _Q：Fragment 是什么？什么时候用？_

Fragment（`<>...</>`）让你在不添加多余 DOM 节点的情况下组合多个元素。当组件需要返回多个兄弟元素，但不想用 `<div>` 影响布局或样式时使用。

> _Q：渲染列表时为什么需要 `key` prop？_

React 用 `key` 来识别列表中哪些元素发生了变化、被添加或删除。没有稳定的 key，React 会退回到按索引比较，列表项重新排序时可能导致渲染错误或丢失组件状态。key 应该在兄弟节点中唯一且稳定，通常用数据库 ID，不要用数组下标。

> _Q：条件渲染时 `&&` 和三元表达式有什么区别？_

`&&` 在条件为真时渲染右侧内容，条件为假时什么都不渲染——适合只有"显示或不显示"的场景，不需要 else 分支。三元表达式（`condition ? A : B`）总是渲染两个分支之一，适合需要在两个不同元素之间切换的场景。`&&` 有一个坑：如果条件是数字 `0`，React 会把 `0` 渲染出来，而不是什么都不显示。

> _Q：组件返回 `null` 或什么都不返回会发生什么？_

返回 `null` 时组件不向 DOM 渲染任何内容——组件在 React 树中依然存在，也可以保有状态，只是不可见。返回 `undefined`（比如漏写 return）会抛出错误，所以需要组件什么都不渲染时，要显式返回 `null`。
