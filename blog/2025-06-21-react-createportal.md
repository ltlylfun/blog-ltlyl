---
slug: react-createportal
title: Portal 组件中的事件冒泡机制
authors: [fangzhijie]
tags: [react]
---

# Portal 组件中的事件冒泡机制

React Portal 是一个强大的功能，它允许我们将组件渲染到父组件的 DOM 树之外的其他位置。今天我们来深入了解 createPortal 的使用方法，并探讨一个有趣的问题：当子组件是一个 Portal 时，点击事件能否冒泡到父组件？

<!-- truncate -->

## 什么是 React Portal？

React Portal 提供了一种将子组件渲染到父组件的 DOM 层次结构之外的方法。虽然 Portal 在 DOM 中的位置可能完全不同，但在 React 组件树中，它仍然表现得像一个普通的子组件。

### createPortal 的基本语法

```jsx
ReactDOM.createPortal(children, domNode, key?)
```

- `children`：任何可渲染的 React 子元素，如 JSX 节点
- `domNode`：DOM 元素，作为 Portal 的容器节点
- `key`：（可选）用作 Portal key 的唯一字符串或数字

## 基础使用示例

让我们先看一个简单的 Portal 示例：

```jsx
import React from "react";
import ReactDOM from "react-dom";

function Modal({ children, isOpen }) {
  if (!isOpen) return null;

  // 创建一个 Portal，将 Modal 渲染到 body 下
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.body
  );
}

function App() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div className="app">
      <button onClick={() => setShowModal(true)}>打开模态框</button>

      <Modal isOpen={showModal}>
        <h2>这是一个 Portal 模态框</h2>
        <button onClick={() => setShowModal(false)}>关闭</button>
      </Modal>
    </div>
  );
}
```

在这个例子中，虽然 `Modal` 组件在 React 树中是 `App` 的子组件，但它实际上被渲染到了 `document.body` 中，而不是 `App` 的 DOM 节点内。

## Portal 中的事件冒泡：关键特性

现在来回答我们的核心问题：**当子组件是一个 Portal 时，发生的点击事件能冒泡到父组件吗？**

**答案是：能！** 这是 React Portal 的一个重要特性。

### 事件冒泡的机制

尽管 Portal 在 DOM 树中可能位于完全不同的位置，但事件仍然会按照 React 组件树的结构进行冒泡，而不是按照 DOM 树的结构。

让我们用一个具体的例子来验证这一点：

```jsx
import React from "react";
import ReactDOM from "react-dom";

function PortalChild() {
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: "50px",
        left: "50px",
        padding: "20px",
        background: "lightblue",
        border: "2px solid blue",
      }}
      onClick={(e) => {
        console.log("Portal 子组件被点击");
        // 注意：这里没有调用 e.stopPropagation()
      }}
    >
      点击我 - Portal 组件
    </div>,
    document.body
  );
}

function ParentComponent() {
  const handleParentClick = (e) => {
    console.log("父组件接收到点击事件");
    console.log("事件目标:", e.target);
    console.log("当前目标:", e.currentTarget);
  };

  return (
    <div
      onClick={handleParentClick}
      style={{
        padding: "30px",
        background: "lightgreen",
        border: "2px solid green",
      }}
    >
      <h3>父组件</h3>
      <p>点击下面的 Portal 组件，观察控制台输出</p>
      <PortalChild />
    </div>
  );
}
```

当你点击 Portal 子组件时，控制台会输出：

```
Portal 子组件被点击
父组件接收到点击事件
```

这证明了事件确实从 Portal 子组件冒泡到了父组件！

## 深入理解：为什么会这样？

这种行为的原因在于 React 的事件系统设计：

### 1. React 合成事件系统

React 使用自己的合成事件系统（SyntheticEvent），它不依赖于 DOM 树的结构，而是基于 React 组件树的结构。

### 2. 事件委托机制

React 在应用的根节点上使用事件委托来处理所有事件。当事件发生时，React 会：

1. 捕获原生 DOM 事件
2. 根据 React 组件树（而非 DOM 树）重新构建事件的传播路径
3. 按照 React 组件层次结构触发相应的事件处理器

### 3. Portal 的特殊处理

Portal 虽然改变了 DOM 的渲染位置，但不会影响 React 组件树的结构。因此，事件仍然会按照组件树的层次结构进行冒泡。

## 实际应用场景

这种事件冒泡特性在实际开发中非常有用：

### 1. 模态框关闭

```jsx
function App() {
  const [showModal, setShowModal] = React.useState(false);

  // 点击任何地方都可以关闭模态框
  const handleAppClick = () => {
    setShowModal(false);
  };

  return (
    <div onClick={handleAppClick}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // 防止立即关闭
          setShowModal(true);
        }}
      >
        打开模态框
      </button>

      {showModal && (
        <Modal>
          <div onClick={(e) => e.stopPropagation()}>
            <h2>模态框内容</h2>
            <p>点击模态框外部关闭</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
```

### 2. 全局事件处理

```jsx
function AppWithGlobalHandling() {
  const handleGlobalClick = (e) => {
    console.log("全局点击处理器");
    // 可以在这里处理全局的点击逻辑
  };

  return (
    <div onClick={handleGlobalClick}>
      <Header />
      <MainContent />
      <FloatingButton /> {/* 这可能是一个 Portal */}
      <Notifications /> {/* 这也可能是一个 Portal */}
    </div>
  );
}
```

## 阻止事件冒泡

如果你不希望 Portal 中的事件冒泡到父组件，可以使用 `stopPropagation()`：

```jsx
function PortalChild() {
  return ReactDOM.createPortal(
    <div
      onClick={(e) => {
        console.log("Portal 子组件被点击");
        e.stopPropagation(); // 阻止事件冒泡
      }}
    >
      点击我 - 事件不会冒泡
    </div>,
    document.body
  );
}
```

## 结语

React createPortal 是一个强大的功能，它允许我们突破 DOM 层次结构的限制，同时保持 React 组件树的逻辑结构。关键要点：

1. **Portal 中的事件会按照 React 组件树结构冒泡**，而不是 DOM 树结构
2. 这种特性使得我们可以在 Portal 组件中利用父组件的事件处理逻辑
3. 如果需要阻止冒泡，使用 `e.stopPropagation()`
4. 在实际应用中，这种特性对于模态框、提示框等 UI 组件非常有用

Portal 的事件冒泡机制体现了 React "一切皆组件"的设计哲学，即使组件在 DOM 中的位置发生了变化，它在 React 世界中的身份和行为仍然保持一致。
