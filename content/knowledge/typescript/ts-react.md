---
title: "React & TypeScript"
topic: typescript
section: React & TypeScript
order: 1
duration: 25
date: 2026-03-25
---

## Why TypeScript in React?

React components accept props and manage state. Without types, it is easy to pass the wrong prop or misuse state. TypeScript catches these mistakes before you run the code.

## Typing Props

Define a `Props` type or interface and annotate the component parameter.

```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// Usage
<Button label="Submit" onClick={() => console.log("clicked")} />
<Button label="Delete" onClick={handleDelete} disabled={true} />
```

If you pass the wrong type or forget a required prop, TypeScript errors immediately in your editor.

## Children Props

Use `React.ReactNode` for the `children` prop — it accepts anything React can render.

```typescript
interface CardProps {
  title: string
  children: React.ReactNode
}

function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// Usage
<Card title="Welcome">
  <p>Hello, world!</p>
</Card>
```

## useState

Pass the type as a generic to `useState<T>`:

```typescript
const [count, setCount] = useState<number>(0)
const [name, setName] = useState<string>("")
const [user, setUser] = useState<User | null>(null)
```

TypeScript can often infer the type from the initial value, so these are equivalent:

```typescript
const [count, setCount] = useState(0)          // inferred as number
const [name, setName] = useState("")           // inferred as string
```

You need to be explicit when the initial value is `null` or the type cannot be inferred:

```typescript
const [user, setUser] = useState<User | null>(null)  // must be explicit
```

## useRef

`useRef` has two common uses in TypeScript.

**Referencing a DOM element:**

```typescript
const inputRef = useRef<HTMLInputElement>(null)

// Later:
inputRef.current?.focus()
```

**Storing a mutable value (no DOM):**

```typescript
const countRef = useRef<number>(0)
countRef.current += 1
```

## Event Types

TypeScript requires specific event types for event handlers.

```typescript
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value)
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  // handle form
}

function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  console.log(e.currentTarget)
}
```

Common event types:

| Event | Type |
|---|---|
| Input change | `React.ChangeEvent<HTMLInputElement>` |
| Form submit | `React.FormEvent<HTMLFormElement>` |
| Button click | `React.MouseEvent<HTMLButtonElement>` |
| Key press | `React.KeyboardEvent<HTMLInputElement>` |

## Typing API Responses

Type the data you fetch from an API so downstream code is safe.

```typescript
interface Post {
  id: number
  title: string
  body: string
}

const [posts, setPosts] = useState<Post[]>([])

useEffect(() => {
  fetch("/api/posts")
    .then((res) => res.json())
    .then((data: Post[]) => setPosts(data))
}, [])
```

## Key Questions

> _Q: How do you type props in a React component with TypeScript?_

Define an interface or type alias describing the props object, then annotate the component's parameter with that type. For example: `function Button({ label, onClick }: ButtonProps)`. TypeScript will error if you pass incorrect props or forget required ones. Optional props use `?`, and you can provide defaults with destructuring default values.

> _Q: When do you need to explicitly type `useState`?_

TypeScript can infer the type from the initial value — `useState(0)` is inferred as `number`. You need to be explicit when the initial value does not reflect the full type. The most common case is `useState<User | null>(null)`: the initial value is `null`, but the state will eventually hold a `User`. Without the explicit type, TypeScript would infer `null` only.

> _Q: What is the difference between `React.ReactNode` and `React.ReactElement`?_

`React.ReactNode` is the broadest type — it includes React elements, strings, numbers, arrays, `null`, and `undefined`. Use it for the `children` prop when you want to accept anything React can render. `React.ReactElement` is more specific: it represents only a React element (the result of calling `React.createElement` or writing JSX). Use `ReactElement` when you need to guarantee the child is a React element and not a string or null.
