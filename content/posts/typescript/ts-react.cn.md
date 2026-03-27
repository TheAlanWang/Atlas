---
title: "React 与 TypeScript"
topic: typescript
section: React & TypeScript
order: 1
duration: 25
date: 2026-03-25
---

## 为什么在 React 中用 TypeScript？

React 组件接受 props 并管理 state。没有类型的话，很容易传错 prop 或错误使用 state。TypeScript 在运行代码之前就能捕获这些错误。

## 给 Props 加类型

定义一个 `Props` 类型或 interface，然后给组件参数加注解。

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

// 使用
<Button label="提交" onClick={() => console.log("clicked")} />
<Button label="删除" onClick={handleDelete} disabled={true} />
```

传错类型或漏传必填 prop，TypeScript 立刻在编辑器里报错。

## Children Props

用 `React.ReactNode` 表示 `children` prop，它接受任何 React 能渲染的内容。

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

// 使用
<Card title="欢迎">
  <p>你好，世界！</p>
</Card>
```

## useState

把类型作为泛型参数传给 `useState<T>`：

```typescript
const [count, setCount] = useState<number>(0)
const [name, setName] = useState<string>("")
const [user, setUser] = useState<User | null>(null)
```

TypeScript 通常能从初始值推断类型，所以这些是等价的：

```typescript
const [count, setCount] = useState(0)   // 推断为 number
const [name, setName] = useState("")    // 推断为 string
```

初始值是 `null` 或类型无法推断时，需要显式指定：

```typescript
const [user, setUser] = useState<User | null>(null)  // 必须显式指定
```

## useRef

`useRef` 在 TypeScript 中有两种常见用法。

**引用 DOM 元素：**

```typescript
const inputRef = useRef<HTMLInputElement>(null)

// 之后使用：
inputRef.current?.focus()
```

**存储可变值（非 DOM）：**

```typescript
const countRef = useRef<number>(0)
countRef.current += 1
```

## 事件类型

TypeScript 要求事件处理函数使用特定的事件类型。

```typescript
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value)
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  // 处理表单
}

function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  console.log(e.currentTarget)
}
```

常用事件类型：

| 事件 | 类型 |
|---|---|
| 输入框变化 | `React.ChangeEvent<HTMLInputElement>` |
| 表单提交 | `React.FormEvent<HTMLFormElement>` |
| 按钮点击 | `React.MouseEvent<HTMLButtonElement>` |
| 按键 | `React.KeyboardEvent<HTMLInputElement>` |

## 给 API 响应加类型

给从 API 获取的数据加类型，让下游代码更安全。

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

## 面试常问

> _Q: 在 TypeScript 的 React 组件中如何给 props 加类型？_

定义一个描述 props 对象的 interface 或类型别名，然后用它给组件参数加注解。例如：`function Button({ label, onClick }: ButtonProps)`。传入类型错误或漏传必填 prop，TypeScript 会报错。可选 prop 用 `?`，也可以在解构时提供默认值。

> _Q: 什么情况下需要显式给 `useState` 指定类型？_

TypeScript 可以从初始值推断类型，`useState(0)` 会被推断为 `number`。初始值无法反映完整类型时需要显式指定。最常见的情况是 `useState<User | null>(null)`：初始值是 `null`，但 state 最终会保存一个 `User`。不显式指定的话，TypeScript 只会推断为 `null`。

> _Q: `React.ReactNode` 和 `React.ReactElement` 有什么区别？_

`React.ReactNode` 是最宽泛的类型，包含 React 元素、字符串、数字、数组、`null` 和 `undefined`。需要接受任何 React 能渲染的内容时，用它表示 `children`。`React.ReactElement` 更具体，只代表 React 元素（调用 `React.createElement` 或写 JSX 的结果）。需要保证子元素是 React 元素而不是字符串或 null 时，用 `ReactElement`。
