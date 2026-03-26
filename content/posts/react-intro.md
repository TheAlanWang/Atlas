---
title: "Introduction to React"
topic: react
section: Introduction
order: 1
duration: 15
date: 2026-03-25
---

## What is React?

React is a JavaScript library for building user interfaces. It was created by Facebook and open-sourced in 2013. Today it's one of the most widely used frontend tools in the industry.

React's core idea is simple: **describe what your UI should look like for a given state, and React figures out how to update the DOM efficiently.**

## Why React?

Before React, building dynamic UIs meant manually manipulating the DOM — finding elements, changing text, toggling classes. This got messy fast.

React introduced a component-based model:

- **Components** — reusable, self-contained pieces of UI
- **Declarative** — you describe the end result, not the step-by-step instructions
- **Reactive** — when data changes, the UI automatically updates

```jsx
// You describe what to render
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>
}

// React handles the DOM update
<Greeting name="Alan" />
```

## The Virtual DOM

React doesn't update the real DOM directly on every change — that would be slow. Instead, it maintains a **virtual DOM**: a lightweight JavaScript copy of the real DOM.

When state changes:

1. React re-renders the component to a new virtual DOM tree
2. It diffs the old and new virtual DOM (reconciliation)
3. It applies only the minimal set of real DOM changes needed

This is why React can be fast even for complex UIs — it batches and minimizes DOM operations.

## Where React is Used

React is the standard choice for most frontend work:

- **Single-page apps (SPAs)** — dashboards, admin panels, web apps
- **Full-stack with Next.js** — server-side rendering, static sites, APIs
- **Mobile** — React Native uses the same component model for iOS and Android
- **Design systems** — companies like Airbnb, Stripe, and GitHub build their component libraries in React

If you're doing frontend work at any modern tech company, you will encounter React.

## Setting Up a React Project

The fastest way to start is with **Vite**:

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

Or with **Next.js** (recommended for most real apps):

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

You don't need to configure Babel, webpack, or JSX transforms — the tooling handles it.

## Your First React App

A React app is just components rendered into a root DOM element:

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
      <p>Your first component.</p>
    </div>
  )
}

export default App
```

The entry point mounts your top-level `App` component into the `<div id="root">` in your HTML file. Everything else is built as components inside `App`.

## Interview Questions

> _Q: What is the difference between React and a framework like Angular?_

React is a **library** focused only on the view layer — it handles rendering components and managing UI state. Angular is a full **framework** that includes opinions on routing, forms, HTTP, and dependency injection. With React, you choose your own libraries for everything else (React Router, Zustand, etc.). This makes React more flexible but also means more decisions to make.

> _Q: What is the Virtual DOM and why does React use it?_

The Virtual DOM is a lightweight JavaScript representation of the real DOM. When state changes, React re-renders to a new virtual DOM tree, diffs it against the previous one (reconciliation), and applies only the necessary real DOM updates. This is faster than naively re-rendering the entire page, and it lets React batch multiple updates together.

> _Q: Is React a library or a framework?_

React is a library — it handles rendering and component state, but nothing else. Routing, data fetching, and form management all require additional libraries. Next.js is a framework built on top of React that adds those conventions and defaults.

> _Q: What problem does React's component model solve?_

It makes UIs modular and reusable. Before component-based frameworks, UI logic was spread across HTML, CSS, and JavaScript files with no clear boundaries. React co-locates markup, behavior, and (optionally) styles into a single unit — a component — that can be composed and reused across the application.

> _Q: What is reconciliation?_

Reconciliation is React's process of comparing the previous virtual DOM tree with the new one after a state update, then computing the minimal set of real DOM changes needed. React uses a diffing algorithm that makes assumptions (like same-type elements stay in place) to make this O(n) instead of O(n³).
