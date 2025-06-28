---
slug: react-hook-tips
title: React Hook 的注意事项
authors: [fangzhijie]
tags: [react]
---

# React Hook 的注意事项

在使用 React 的 Hook 时，有一些常见的陷阱和注意事项需要了解。

<!-- truncate -->

## useState 的常见陷阱

### 状态更新不是立即生效的

调用 `set` 函数**不会**改变已经执行的代码中当前的 state：

```javascript
function handleClick() {
  console.log(count); // 0

  setCount(count + 1); // 请求使用 1 重新渲染
  console.log(count); // 仍然是 0!

  setTimeout(() => {
    console.log(count); // 还是 0!
  }, 5000);
}
```

它只影响**下一次**渲染中 `useState` 返回的内容。

这是因为 React 中的状态更新是异步的，状态的改变会在下一次组件重新渲染时生效。如果你需要在状态更新后立即使用新值，可以考虑使用 `useEffect` 钩子来监听状态变化。

### 多次调用状态更新的陷阱

即使在同一个事件处理函数中多次调用状态更新函数，也不会累积效果：

```javascript
function handleClick() {
  setAge(age + 1); // setAge(42 + 1)
  setAge(age + 1); // setAge(42 + 1)
  setAge(age + 1); // setAge(42 + 1)
}
```

上面的代码中，如果 `age` 初始值是 42，点击按钮后 `age` 只会变成 43，而不是 45。因为每次调用都是基于当前渲染中的 `age` 值（42）。

如果需要基于前一个状态进行多次更新，应该使用函数式更新：

```javascript
function handleClick() {
  setAge((a) => a + 1); // setAge(42 => 43)
  setAge((a) => a + 1); // setAge(43 => 44)
  setAge((a) => a + 1); // setAge(44 => 45)
}
```

### 不要直接修改状态对象

React 状态应该被视为不可变的。直接修改状态对象不会触发重新渲染：

```javascript
// ❌ 错误：不要像下面这样改变一个对象
form.firstName = "Taylor";
```

相反，可以通过创建一个新对象来替换整个对象：

```javascript
// ✅ 正确：使用新对象替换 state
setForm({
  ...form,
  firstName: "Taylor",
});
```

这是因为 React 使用 `Object.is()` 来比较状态值。如果你直接修改现有对象，React 认为状态没有改变，因此不会重新渲染组件。

### 避免重复创建初始状态

React 只在初次渲染时保存初始状态，后续渲染时将其忽略。

```javascript
function TodoList() {
  const [todos, setTodos] = useState(createInitialTodos());
  // ...
}
```

尽管 `createInitialTodos()` 的结果仅用于初始渲染，但你仍然在每次渲染时调用此函数。如果它创建大数组或执行昂贵的计算，这可能会浪费资源。

为了解决这个问题，你可以将它**作为初始化函数传递**给 `useState`：

```javascript
function TodoList() {
  const [todos, setTodos] = useState(createInitialTodos);
  // ...
}
```

请注意，你传递的是 `createInitialTodos` 函数本身，而不是 `createInitialTodos()` 调用该函数的结果。如果将函数传递给 `useState`，React 仅在初始化期间调用它。

## useRef 的注意事项

### 不要在渲染期间写入或者读取 ref.current

React 期望组件主体表现得像一个纯函数：

- 如果输入的（props、state 与上下文）都是一样的，那么就应该返回一样的 JSX。
- 以不同的顺序或用不同的参数调用它，不应该影响其他调用的结果。

在渲染期间读取或写入 ref 会破坏这些预期行为。

```javascript
function MyComponent() {
  // ...
  // 🚩 不要在渲染期间写入 ref
  myRef.current = 123;
  // ...
  // 🚩 不要在渲染期间读取 ref
  return <h1>{myOtherRef.current}</h1>;
}
```

可以在事件处理程序或者 Effect 中读取和写入 ref。

```javascript
function MyComponent() {
  // ...
  useEffect(() => {
    // ✅ 可以在 Effect 中读取和写入 ref
    myRef.current = 123;
  });
  // ...
  function handleClick() {
    // ✅ 可以在事件处理程序中读取和写入 ref
    doSomething(myOtherRef.current);
  }
  // ...
}
```

如果不得不在渲染期间读取或者写入，那么应该使用 state 代替。

### 避免重复创建 ref

React 会保存 ref 初始值，并在后续的渲染中忽略它。

```javascript
function Video() {
  const playerRef = useRef(new VideoPlayer());
  // ...
}
```

虽然 `new VideoPlayer()` 的结果只会在首次渲染时使用，但是依然在每次渲染时都在调用这个方法。如果是创建昂贵的对象，这可能是一种浪费。

为了解决这个问题，你可以像这样初始化 ref：

```javascript
function Video() {
  const playerRef = useRef(null);
  if (playerRef.current === null) {
    playerRef.current = new VideoPlayer();
  }
  // ...
}
```

通常情况下，在渲染过程中写入或读取 `ref.current` 是不允许的。然而，在这种情况下是可以的，因为结果总是一样的，而且条件只在初始化时执行，所以是完全可预测的。

## useEffect 的注意事项

### useEffect 的基本结构和执行顺序

你需要向 `useEffect` 传递两个参数：

1. **一个 setup 函数**，其 setup 代码用来连接到该系统。它应该返回一个**清理函数（cleanup）**，其 cleanup 代码用来与该系统断开连接。
2. **一个依赖项列表**，包括这些函数使用的每个组件内的值。

React 在必要时会调用 setup 和 cleanup，这可能会发生多次：

- **将组件挂载到页面时**，将运行 setup 代码。
- **重新渲染依赖项变更的组件后**：
  - 首先，使用旧的 props 和 state 运行 cleanup 代码。
  - 然后，使用新的 props 和 state 运行 setup 代码。
- **当组件从页面卸载后**，cleanup 代码将运行最后一次。

## 参考资料

- [React 官方文档](https://react.dev/)
