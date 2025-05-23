---
slug: react-hook-rules
title: React Hook调用规则：何时何地使用Hook
authors: [fangzhijie]
tags: [react]
---

# React Hook 调用规则：何时何地使用 Hook

React Hooks 是 React 16.8 引入的特性，它让我们可以在不编写类组件的情况下使用状态和其他 React 特性。但是，使用 Hook 时需要遵循一些特定的规则，否则可能会导致难以发现的 Bug。

<!-- truncate -->

## Hook 调用规则

React 对 Hook 的调用位置有严格的要求。这些规则确保了 Hook 在每次组件渲染时都以相同的顺序被调用，从而保证 React 能够正确地保存 Hook 的状态。

## ✅ 正确的 Hook 调用位置

只有在以下两种情况中，你可以安全地调用 Hook：

1. **在函数组件的主体顶层调用 Hook**

```jsx
function Counter() {
  // ✅ 正确：在函数组件顶层调用
  const [count, setCount] = useState(0);
  const theme = useContext(ThemeContext);

  // 使用这些状态和上下文...
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

2. **在自定义 Hook 的主体顶层调用 Hook**

```jsx
function useWindowSize() {
  // ✅ 正确：在自定义 Hook 顶层调用
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
```

## 🔴 错误的 Hook 调用位置

以下情况下**不应该**调用 Hook：

### 1. 不要在条件语句或循环中调用 Hook

```jsx
function Form() {
  const [name, setName] = useState("");

  // 🔴 错误：条件语句中调用 Hook
  if (name !== "") {
    useEffect(() => {
      document.title = `Hello, ${name}!`;
    });
  }

  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

**为什么错误？**

React 依赖 Hook 的调用顺序来正确匹配每次渲染中的 Hook 状态。这是因为 React 内部使用数组而非键值对来存储组件的状态。

#### React Hook 的底层实现机制

在 React 的源码中（简化版），Hook 的状态存储大致是这样实现的：

```jsx
// React内部简化的Hook实现
let hooks = []; // 用于存储组件的所有hook状态
let currentHook = 0; // 当前处理的hook索引

// useState的简化实现
function useState(initialState) {
  const hook = hooks[currentHook] || { state: initialState };
  hooks[currentHook] = hook;

  const setState = (newState) => {
    hook.state = newState;
    // 触发重新渲染
    rerender();
  };

  currentHook++; // 索引递增，为下一个hook准备
  return [hook.state, setState];
}

// 每次组件渲染时
function renderComponent() {
  currentHook = 0; // 重置索引
  // 调用组件函数，执行其中的hooks
  MyComponent();
}
```

当组件函数执行时，每个 Hook 调用都会按顺序增加 `currentHook` 索引。在下一次渲染时，React 依赖这个严格的顺序来正确获取对应的状态。

如果将 Hook 放在条件语句中，比如示例中的 `if (name !== '')` 内部，当条件从真变为假时，之前在条件内调用的 Hook 将被跳过，导致 `currentHook` 索引与上次渲染不同步，从而读取到错误的状态：

渲染 1: [useState("name"), useEffect(条件内)] → hooks[0], hooks[1]
渲染 2: [useState("name")] → hooks[0]，但原来的 hooks[1] 被跳过

这会导致状态混乱，甚至崩溃。

### 2. 不要在条件性的 return 语句之后调用 Hook

```jsx
function UserProfile({ userId }) {
  if (!userId) {
    return <p>请先登录</p>;
  }

  // 🔴 错误：在条件性 return 后调用 Hook
  const [user, setUser] = useState(null);

  // ...剩余代码
}
```

**为什么错误？**

条件性 return 语句本质上也是一种条件执行，它提前结束函数执行，导致后续的 Hook 不会被调用。从 React 内部实现来看，这与在条件语句中调用 Hook 是同样的问题。

#### 内部状态机制分析

当组件有条件返回时，React 的 Hook 链表会发生断裂：

```jsx
// 第一次渲染（userId存在）
function UserProfile({ userId = "123" }) {
  // hooks[0] = useState结果
  const [data, setData] = useState(null);
  // 正常执行，存储状态
  return <div>...</div>;
}

// 第二次渲染（userId为空）
function UserProfile({ userId = null }) {
  if (!userId) {
    return <p>请先登录</p>; // 提前返回，后续代码不执行
  }

  // 这行代码不会执行，但React依然期望它是hooks[0]
  // React内部的currentHook索引与实际执行的Hook不匹配
  const [data, setData] = useState(null);

  return <div>...</div>;
}
```

在 React 的 Fiber 架构中，组件的 Hook 以链表形式存储在 Fiber 节点的 memoizedState 属性中。当组件重新渲染时，React 会按照之前记录的顺序遍历这个链表来获取对应的状态。提前返回会导致 Hook 链表与 React 内部期望的不一致，造成状态关联错误。

最可能的错误是：当 userId 再次有值时，组件可能会使用错误的状态，或者当 Hooks 顺序完全被打乱时，React 会抛出 "Rendered fewer hooks than expected" 的错误。

### 3. 不要在事件处理函数中调用 Hook

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 🔴 错误：在事件处理函数中调用 Hook
    const [incrementBy] = useState(1);
    setCount(count + incrementBy);
  };

  return <button onClick={handleClick}>增加</button>;
}
```

**为什么错误？**

Hook 的设计是为了在组件渲染阶段执行，而事件处理函数是在交互阶段执行的，这违反了 React 的工作原理和状态管理机制。

#### React 的渲染与事件处理机制

React 的工作过程可以分为两个主要阶段：

1. **渲染阶段**：React 调用组件函数，收集 JSX 和 Hook 调用，构建虚拟 DOM
2. **提交阶段**：React 将变更应用到实际 DOM，并设置事件处理函数

事件处理函数（如 `handleClick`）是在提交阶段之后，用户交互时才会执行的。当这些函数执行时，React 已经退出了渲染上下文，不再跟踪 Hook 的调用序列。

从源码角度看，React 使用一个称为 `ReactCurrentDispatcher.current` 的对象来管理 Hook 的处理函数。在渲染阶段，这个对象被设置为具有 Hook 实现的对象；在渲染完成后，它被重置为一个会抛出错误的实现：

```jsx
// React内部源码（简化版）
const ReactCurrentDispatcher = {
  current: null, // 渲染时设置为HooksDispatcher，渲染后设置为抛错的DispatcherOnNoContext
};

// 渲染函数组件时的处理
function renderWithHooks(Component, props) {
  // 设置正确的dispatcher
  ReactCurrentDispatcher.current = HooksDispatcher;

  // 调用组件函数
  let result = Component(props);

  // 重置dispatcher，使渲染外的Hook调用抛出错误
  ReactCurrentDispatcher.current = DispatcherOnNoContext;

  return result;
}

// 事件处理函数在这个阶段执行，此时dispatcher已被设置为抛错版本
// 所以在这里调用useState会抛出"无效Hook调用"错误
```

当你在事件处理函数中调用 `useState` 时，React 会检测到这个调用发生在渲染周期之外，因此会抛出 "Invalid hook call" 错误。这是 React 有意为之的保护机制，确保 Hook 只在正确的上下文中使用。

### 4. 不要在类组件中调用 Hook

```jsx
class Counter extends React.Component {
  render() {
    // 🔴 错误：在类组件中调用 Hook
    const [count, setCount] = useState(0);

    return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
  }
}
```

**为什么错误？**

Hook 是为函数组件特别设计的 API，其内部实现与类组件的生命周期和状态管理机制完全不兼容。

#### 函数组件与类组件的根本差异

React 的类组件和函数组件有本质上的区别：

1. **类组件**是基于面向对象编程的，有实例（`this`）、生命周期方法和继承机制
2. **函数组件**是基于函数式编程的，每次渲染都是函数的完整执行，没有持久化的实例

Hook 的实现依赖于函数组件的执行模型和 React 内部的 Fiber 架构。当一个函数组件执行时，React 会为其创建一个执行环境，并将 Hook 的状态存储在与该组件关联的 Fiber 节点中。

```jsx
// React内部代码（简化版）
// 函数组件的处理方式
function mountIndeterminateComponent(current, workInProgress, Component) {
  // 为函数组件准备执行环境
  prepareToUseHooks(workInProgress);

  // 执行函数组件
  const value = Component(props);

  // 完成Hooks处理，将状态存储在Fiber节点
  finishHooks();

  return value;
}

// 类组件的处理方式
function updateClassComponent(current, workInProgress, Component) {
  // 获取或创建类实例
  const instance = getOrCreateClassInstance(workInProgress);

  // 调用生命周期方法
  instance.componentWillMount();

  // 渲染
  const nextChildren = instance.render();

  return nextChildren;
}
```

类组件使用的是完全不同的状态管理机制，依赖于类实例的持久化和 `this.state`。Hook 的内部实现与这种机制不兼容，因此在类组件中调用 Hook 会导致 React 抛出 "Invalid hook call" 错误。

从设计哲学上讲，Hook 就是为了解决类组件中的各种问题而创建的替代方案，它们不是设计来协同工作的。

### 5. 不要在传给 useMemo、useReducer 或 useEffect 的函数内部调用 Hook

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 🔴 错误：在 Effect 函数内调用 Hook
    const [timer, setTimer] = useState(null);

    setTimer(
      setInterval(() => {
        setCount((c) => c + 1);
      }, 1000)
    );

    return () => clearInterval(timer);
  }, []);

  return <p>Count: {count}</p>;
}
```

**为什么错误？**

这些回调函数（`useMemo`、`useReducer` 或 `useEffect` 中的函数）在 React 的渲染周期中执行的时机与组件函数的执行时机不同，违反了 Hook 的调用上下文要求。

#### React Hook 的执行时机与上下文

React Hook 系统设计为只在两个上下文中有效：函数组件的顶层和自定义 Hook 的顶层。这是因为 React 需要在组件的每次渲染中以相同的顺序调用所有 Hook，以维护它们的状态关联。

让我们看看 `useEffect` 的内部实现（简化版）：

```jsx
// React内部代码（简化）
function useEffect(create, deps) {
  const dispatcher = ReactCurrentDispatcher.current;
  return dispatcher.useEffect(create, deps);
}

// 渲染阶段的useEffect实现
const HooksDispatcher = {
  useEffect: function (create, deps) {
    // 创建effect并添加到fiber节点上
    const effect = {
      tag: EffectTag,
      create: create, // 存储回调函数，用于后续执行
      deps: deps,
    };
    currentlyRenderingFiber.memoizedState.push(effect);

    return undefined;
  },
  // ...其他hook实现
};

// 提交阶段执行effect
function commitHookEffectList() {
  // 遍历并执行每个effect的create函数
  let effect = firstEffect;
  do {
    // 注意：此时已经不在组件渲染阶段
    const create = effect.create;
    effect.destroy = create(); // 执行useEffect的回调函数
    effect = effect.next;
  } while (effect !== firstEffect);
}
```

当你在 `useEffect` 的回调函数中调用 Hook 时，问题在于：

1. 回调函数执行时，React 已经完成了渲染阶段
2. `ReactCurrentDispatcher.current` 已被重置为抛出错误的版本
3. 组件的 Hook 链表已经构建完成，不能再添加新的 Hook

更具体地说，`useEffect` 的回调实际上是在 DOM 更新之后异步执行的，它属于提交阶段的一部分，而不是渲染阶段。此时 Hook 的上下文已不再有效。

同理，`useMemo` 和 `useReducer` 中的函数也不是在组件的每次渲染中以确定的顺序执行的，因此不适合作为 Hook 的调用上下文。

### 6. 不要在 try/catch/finally 代码块中调用 Hook

```jsx
function FetchData() {
  try {
    // 🔴 错误：在 try 块中调用 Hook
    const [data, setData] = useState(null);
    // ...
  } catch (error) {
    // 处理错误
  }

  return <div>...</div>;
}
```

**为什么错误？**

`try/catch` 块在 JavaScript 中会改变代码的执行流程，如果 `try` 块中的代码抛出异常，那么后续的 Hook 调用可能会被跳过，导致 Hook 的调用序列在不同渲染之间不一致。

#### 异常处理与 Hook 的执行序列

当 React 渲染一个组件时，它会按顺序初始化或更新每个 Hook 的状态。如果在 `try` 块中声明 Hook，并且该块抛出异常，会导致 React 的内部状态与组件实际执行的 Hook 不同步。

让我们通过一个例子分析：

```jsx
function BuggyComponent() {
  // 第一个Hook：hooks[0]
  const [count, setCount] = useState(0);

  try {
    // 这个Hook可能在某些情况下执行：hooks[1]
    const [data, setData] = useState(null);

    // 假设这里可能抛出错误
    if (someCondition) {
      throw new Error("Something went wrong");
    }

    // 如果上面抛错，这个Hook不会执行
    const [isLoading, setIsLoading] = useState(false);
  } catch (e) {
    // 错误处理
    console.error(e);
  }

  // 第四个Hook：应该是hooks[3]，但如果try中抛出错误
  // 它实际上会变成hooks[2]，因为第三个被跳过了
  const theme = useContext(ThemeContext);

  return <div>...</div>;
}
```

从 React 内部实现来看，这会导致 Hook 状态数组与调用序列不匹配：

1. 第一次渲染：顺利执行所有 Hook，状态数组为 `[count, data, isLoading, theme]`
2. 第二次渲染：如果 `try` 块抛出错误，Hook 序列变为 `[count, data, theme]`（`isLoading` 被跳过）
3. 第三次渲染：即使不再抛出错误，React 仍会按照第一次渲染的顺序尝试恢复 Hook 状态，导致 `theme` 错误地使用了 `isLoading` 的状态

这种状态混乱不仅会导致难以预测的行为，还可能引发 React 内部错误，如 "Rendered fewer hooks than expected" 错误。

React 的 Hook 系统没有内置的错误边界机制来处理这种情况，因此避免在 `try/catch` 块中使用 Hook 是必要的。相反，应该使用 React 的错误边界组件（Error Boundaries）来捕获渲染过程中的错误。

## Hook 的底层工作原理

为了更好地理解 Hook 调用规则的重要性，让我们深入探讨一下 React Hook 的工作原理。

### Hook 的内部存储结构

React 在函数组件对应的 Fiber 节点上使用链表结构来存储 Hook 的状态：

```jsx
// 简化版的Fiber节点结构
const fiber = {
  memoizedState: null, // 指向第一个Hook
  stateNode: Component, // 函数组件本身
  // ...其他属性
};

// Hook的链表结构
const hook = {
  memoizedState: initialState, // Hook的状态值
  queue: updateQueue, // 状态更新队列
  next: null, // 指向下一个Hook
};
```

每个 Hook 调用都会在这个链表中创建一个节点，首次渲染时初始化，后续渲染时按顺序更新。

### React 如何匹配 Hook 与状态

React 使用简单的链表遍历而非 Map/对象来匹配 Hook 与其状态，这也是为什么 Hook 调用顺序必须保持稳定的根本原因：

```jsx
// 渲染阶段的Hook处理（简化版）
function renderWithHooks(Component, props) {
  currentlyRenderingFiber = workInProgress;

  // 重置Hook链表指针
  currentHook = current !== null ? current.memoizedState : null;

  // 调用组件函数，执行Hook
  let children = Component(props);

  // 保存Hook链表
  workInProgress.memoizedState = firstWorkInProgressHook;

  return children;
}

// useState的简化实现
function useState(initialState) {
  // 获取当前Hook
  const hook = mountWorkInProgressHook();

  // 初始化Hook状态
  hook.memoizedState = initialState;

  // 创建状态更新函数
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
  });
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ));

  // 返回[state, setState]
  return [hook.memoizedState, dispatch];
}

// 创建新Hook或移动到下一个Hook
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // 这是第一个Hook
    firstWorkInProgressHook = workInProgressHook = hook;
  } else {
    // 将新Hook添加到链表末尾
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}
```

这种基于顺序的链表遍历机制解释了为什么 React 对 Hook 的调用位置有如此严格的要求。任何可能导致顺序变化的操作（如条件渲染、循环、提前返回）都会破坏这个机制。

## 参考链接

- [React 官方文档：Hook 规则](https://zh-hans.react.dev/reference/rules/rules-of-hooks)
