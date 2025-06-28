---
slug: usecallback-usememo
title: React 性能优化：useCallback 与 useMemo
authors: [fangzhijie]
tags: [react]
---

# useCallback 与 useMemo

在 React 应用开发中，`useCallback` 和 `useMemo` 是 React 提供的两个重要的性能优化 Hook，它们可以帮助我们避免不必要的重新计算和重新渲染。

<!-- truncate -->

## 什么是 useCallback？

`useCallback` 是一个 React Hook，它返回一个记忆化的回调函数。只有当依赖项发生变化时，才会返回新的回调函数。

### 基本语法

```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b] // 依赖数组
);
```

### 为什么需要 useCallback？

在 React 中，每次组件重新渲染时，内部定义的函数都会被重新创建。这可能导致：

1. **子组件不必要的重新渲染**：如果将函数作为 props 传递给子组件，新创建的函数会导致子组件认为 props 发生了变化
2. **性能损耗**：频繁创建新函数会增加垃圾回收的压力

---

#### 补充：为什么函数引用会影响 React.memo 的性能优化？

与字面量对象 `{}` 总是会创建新对象类似，在 JavaScript 中，`function () {}` 或者 `() => {}` 每次都会生成不同的函数对象。

**举例说明：**

```js
{} === {} // false
() => {} === () => {} // false
```

每次写字面量对象或匿名函数，都会得到新的引用。

---

**在 React 中的影响：**

如果你给组件（如 ShippingForm）传递一个匿名函数作为 props：

```jsx
<ShippingForm
  onSubmit={() => {
    /* do something */
  }}
/>
```

每次父组件 render，这个 onSubmit 都是新函数，哪怕内容一样，React.memo 也会认为 props 变了，导致 ShippingForm 总是重新渲染，memo 的优化完全失效。

---

**useCallback 的作用：**

用 useCallback 包裹后，只有依赖变化时才会生成新函数，引用保持稳定，memo 才能真正生效：

```jsx
const handleSubmit = useCallback(() => {
  // do something
}, []);
<ShippingForm onSubmit={handleSubmit} />;
```

这样，ShippingForm 的 props 就不会每次都变，React.memo 才能避免不必要的重新渲染。

---

**一句话总结：**
在 React 中，如果你把函数（如 onClick, onSubmit）直接写成匿名函数传给组件，会导致每次 render 时 props 变化，让 React.memo 失效。用 useCallback 可以缓存函数引用，提高性能。

## 什么是 useMemo？

`useMemo` 是一个 React Hook，它返回一个记忆化的值。只有当依赖项发生变化时，才会重新计算这个值。

### 基本语法

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### 为什么需要 useMemo？

在某些情况下，组件内部可能包含昂贵的计算操作，如：

1. **复杂的数据处理**：大量数据的过滤、排序、计算
2. **对象或数组的创建**：避免每次渲染都创建新的引用
3. **API 调用的结果处理**：避免重复处理相同的数据

### useMemo 示例

```jsx
import { useState, useMemo } from "react";

function ExpensiveCalculation({ items, filter }) {
  // 昂贵的计算操作
  const expensiveValue = useMemo(() => {
    console.log("执行昂贵的计算...");

    // 模拟复杂计算
    let result = 0;
    const filteredItems = items.filter((item) => item.category === filter);

    for (let i = 0; i < filteredItems.length; i++) {
      for (let j = 0; j < 1000000; j++) {
        result += filteredItems[i].value;
      }
    }

    return result;
  }, [items, filter]); // 只有当 items 或 filter 变化时才重新计算

  return <div>计算结果: {expensiveValue}</div>;
}

function App() {
  const [items] = useState([
    { category: "A", value: 1 },
    { category: "B", value: 2 },
    { category: "A", value: 3 },
  ]);
  const [filter, setFilter] = useState("A");
  const [unrelatedState, setUnrelatedState] = useState(0);

  return (
    <div>
      <button onClick={() => setFilter(filter === "A" ? "B" : "A")}>
        切换过滤器 (当前: {filter})
      </button>

      <button onClick={() => setUnrelatedState(unrelatedState + 1)}>
        更新无关状态: {unrelatedState}
      </button>

      <ExpensiveCalculation items={items} filter={filter} />
    </div>
  );
}
```

### 如何衡量计算过程的开销是否昂贵？

一般来说，除非要创建或循环遍历数千个对象，否则计算开销可能并不大。如果你想获得更详细的信息，可以在控制台用 `console.time` 和 `console.timeEnd` 来测量某段代码的执行时间：

```js
console.time("filter array");
const visibleTodos = filterTodos(todos, tab);
console.timeEnd("filter array");
```

然后执行你正在监测的交互（例如，在输入框中输入文字）。你将会在控制台看到类似日志：

```
filter array: 0.15ms
```

如果全部记录的时间加起来很长（1ms 或者更多），那么记忆此计算结果是有意义的。

作为对比，你可以将计算过程包裹在 useMemo 中，以验证该交互的总日志时间是否减少了：

```js
console.time("filter array");
const visibleTodos = useMemo(() => {
  return filterTodos(todos, tab); // 如果 todos 和 tab 都没有变化，那么将会跳过渲染。
}, [todos, tab]);
console.timeEnd("filter array");
```

> 注意：useMemo 不会让首次渲染更快，它只会帮助你跳过不必要的更新工作。

## useCallback 与 useMemo 的区别

| 特性         | useCallback             | useMemo                      |
| ------------ | ----------------------- | ---------------------------- |
| **返回值**   | 记忆化的函数            | 记忆化的值                   |
| **使用场景** | 函数引用稳定性          | 昂贵计算结果缓存             |
| **语法**     | `useCallback(fn, deps)` | `useMemo(() => value, deps)` |
