---
title: "Components & JSX"
topic: react
section: Fundamentals
order: 1
duration: 25
date: 2026-03-21
---

## What is a Component?

A React component is a function that returns JSX. Components are the building blocks of any React application — every button, form, and page is a component.

```jsx
function Hello() {
  return <h1>Hello, world!</h1>
}
```

Component names must start with a capital letter. React uses this to tell the difference between HTML tags (`<div>`) and custom components (`<Hello />`).

## What is JSX?

JSX looks like HTML, but it's actually JavaScript. Under the hood, JSX compiles to `React.createElement()` calls — you don't need to write those yourself.

```jsx
// What you write
const element = <h1 className="title">Hello</h1>

// What it compiles to
const element = React.createElement('h1', { className: 'title' }, 'Hello')
```

Two key differences from HTML:

- Use `className` instead of `class` (because `class` is a reserved word in JavaScript)
- Use `camelCase` for event handlers: `onClick`, `onChange`, `onSubmit`

## Embedding JavaScript in JSX

Use curly braces `{}` to embed any JavaScript expression inside JSX:

```jsx
const name = "Alan"
const age = 25

return (
  <div>
    <p>Name: {name}</p>
    <p>Age: {age}</p>
    <p>Born: {2026 - age}</p>
  </div>
)
```

Anything inside `{}` is evaluated as JavaScript — variables, function calls, ternary expressions, arithmetic.

## One Root Element

A component can only return one root element. Wrap siblings in a `<div>` or a Fragment:

```jsx
// ❌ Two root elements — this won't work
return (
  <h1>Title</h1>
  <p>Content</p>
)

// ✅ Wrapped in a div
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
)

// ✅ Fragment — renders no extra DOM node
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
)
```

Use a Fragment (`<>...</>`) when you don't want an extra wrapper element in the DOM.

## Conditional Rendering

Use a ternary expression or `&&` to render elements conditionally:

```jsx
const isLoggedIn = true

// Ternary
return <p>{isLoggedIn ? "Welcome back!" : "Please log in."}</p>

// && — only renders when the condition is true
return <div>{isLoggedIn && <UserProfile />}</div>
```

## Rendering Lists

Use `.map()` to render a list of elements. Each item needs a unique `key` prop so React can track changes efficiently:

```jsx
const fruits = ["Apple", "Banana", "Cherry"]

return (
  <ul>
    {fruits.map((fruit) => (
      <li key={fruit}>{fruit}</li>
    ))}
  </ul>
)
```

## Interview Questions

> **Q: What is the difference between JSX and HTML?**

JSX is a JavaScript syntax extension that compiles to `React.createElement()` calls. HTML is a markup language parsed directly by the browser. In JSX, you use `className` instead of `class`, event handlers are camelCased (`onClick`), and you can embed JavaScript expressions using `{}`.

> **Q: Why must component names start with a capital letter?**

React uses the case of the first letter to distinguish between HTML tags and custom components. A lowercase tag like `<div>` is treated as a native HTML element. An uppercase tag like `<MyComponent>` is treated as a custom component and React looks for it in scope.

> **Q: What is a Fragment and when would you use it?**

A Fragment (`<>...</>` or `<React.Fragment>`) lets you group multiple elements without adding an extra node to the DOM. Use it when you need to return multiple siblings from a component but don't want a wrapper `<div>` affecting your layout or styling.

> **Q: Why does React require a `key` prop when rendering lists?**

React uses `key` to identify which items in a list have changed, been added, or been removed. Without a stable key, React falls back to index-based comparison, which can cause incorrect re-renders or lost component state when items are reordered. Keys should be unique among siblings and stable — typically a database ID, not the array index.

> **Q: What is the difference between `&&` and a ternary for conditional rendering?**

`&&` renders the right side only when the condition is truthy, and renders nothing when it's falsy — useful when you only need a "show or hide" without an else case. A ternary (`condition ? A : B`) always renders one of two branches, making it better when you need to switch between two different elements. One pitfall with `&&`: if the condition is `0`, React will render the number `0` instead of nothing.

> **Q: What does a component render if it returns `null` or nothing?**

Returning `null` from a component renders nothing to the DOM — the component is effectively invisible but still exists in the React tree and can still hold state. Returning `undefined` (e.g., from a missing return statement) will throw an error, so always return `null` explicitly when you want a component to render nothing.
