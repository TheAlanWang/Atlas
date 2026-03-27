---
title: "React 简介"
topic: react
section: Introduction
order: 1
duration: 15
date: 2026-03-25
---

## React 是什么？

React 是一个用于构建用户界面的 JavaScript 库。由 Facebook 创建，2013 年开源。如今它是业界使用最广泛的前端工具之一。

React 的核心思想很简单：**描述 UI 在某个状态下应该长什么样，React 负责高效地更新 DOM。**

## 为什么用 React？

在 React 出现之前，构建动态 UI 意味着手动操作 DOM——查找元素、改文本、切换样式类。代码很快就会变得一团糟。

React 引入了基于组件的模型：

- **组件** — 可复用、自包含的 UI 单元
- **声明式** — 描述最终结果，而不是一步步怎么做
- **响应式** — 数据变化时，UI 自动更新

```jsx
// 你描述要渲染什么
function Greeting({ name }) {
  return <h1>你好，{name}！</h1>
}

// React 处理 DOM 更新
<Greeting name="Alan" />
```

## 什么是 DOM？

**DOM（文档对象模型，Document Object Model）** 是浏览器对网页的内部表示。浏览器加载 HTML 后，会将其解析成一棵对象树——每个 `<div>`、`<p>`、`<button>` 都变成这棵树上的一个节点。JavaScript 可以读取和修改这棵树，从而动态更新用户看到的内容。

```
HTML：                       DOM 树：
<div>                        div
  <h1>你好</h1>    →           h1 → "你好"
  <p>世界</p>                  p  → "世界"
</div>
```

频繁直接操作 DOM 很慢——每次改动都可能触发浏览器重新计算布局并重绘页面。这正是 React 虚拟 DOM 要解决的问题。

## 虚拟 DOM

React 不会在每次变更时直接操作真实 DOM——那样太慢了。它维护一个**虚拟 DOM**：真实 DOM 的轻量 JavaScript 副本。

状态变化时：

1. React 将组件重新渲染为新的虚拟 DOM 树
2. 对比新旧虚拟 DOM（协调过程）
3. 只把最小化的变更应用到真实 DOM

这就是为什么即使是复杂 UI，React 也能保持高效——它会批量处理并最小化 DOM 操作。

## React 用在哪里？

React 是大多数前端工作的标准选择：

- **单页应用（SPA）** — 仪表盘、管理后台、Web 应用
- **搭配 Next.js 做全栈** — 服务端渲染、静态站点、API
- **移动端** — React Native 用同样的组件模型开发 iOS 和 Android
- **设计系统** — Airbnb、Stripe、GitHub 等公司都用 React 构建组件库

只要你做现代科技公司的前端，就一定会遇到 React。

## 创建 React 项目

最快的方式是用 **Vite**：

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

或者用 **Next.js**（大多数真实项目的推荐选择）：

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

不需要自己配置 Babel、webpack 或 JSX 转换——工具链都帮你处理好了。

## 第一个 React 应用

React 应用就是把组件渲染进一个根 DOM 元素：

```jsx
// src/main.jsx
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root'))
root.render(<App />)
```

```jsx
// src/App.jsx
function App() {
  return (
    <div>
      <h1>Hello, React!</h1>
      <p>你的第一个组件。</p>
    </div>
  )
}

export default App
```

入口文件把顶层的 `App` 组件挂载到 HTML 中的 `<div id="root">` 上，其他所有内容都作为组件在 `App` 里面构建。

## 面试常问

> _Q：React 和 Angular 这样的框架有什么区别？_

React 是一个**库**，只专注于视图层——处理组件渲染和 UI 状态管理。Angular 是一个完整的**框架**，对路由、表单、HTTP 请求、依赖注入都有内置方案。React 需要你自己选配其他库（React Router、Zustand 等），灵活性更高，但也意味着更多决策。

> _Q：什么是虚拟 DOM？React 为什么要用它？_

虚拟 DOM 是真实 DOM 的轻量 JavaScript 表示。状态变化时，React 重新渲染出新的虚拟 DOM 树，与旧树做 diff（协调），再把必要的变更应用到真实 DOM。这比每次都重新渲染整个页面快得多，也让 React 可以把多次更新合并处理。

> _Q：React 是库还是框架？_

React 是库——它只处理渲染和组件状态，其他什么都不管。路由、数据请求、表单处理都需要额外的库。Next.js 是基于 React 构建的框架，它补充了这些约定和默认配置。

> _Q：React 的组件模型解决了什么问题？_

让 UI 变得模块化、可复用。在基于组件的框架出现之前，UI 逻辑分散在 HTML、CSS、JavaScript 文件里，边界不清晰。React 把标记、行为和（可选的）样式集中在一个单元里——组件——可以在整个应用中组合和复用。

> _Q：什么是协调（reconciliation）？_

协调是 React 在状态更新后，对比前后两棵虚拟 DOM 树，计算出最小化真实 DOM 变更的过程。React 的 diff 算法做了一些假设（比如相同类型的元素保持位置不变），把时间复杂度从 O(n³) 降到 O(n)。
