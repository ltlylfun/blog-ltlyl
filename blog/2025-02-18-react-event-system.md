---
slug: react-event-system
title: React 事件机制
authors: [fangzhijie]
tags: [react]
---

# React 事件机制深度解析

React 的事件系统通过合成事件和事件委托机制，为我们提供了统一、高效的事件处理方案。

<!-- truncate -->

## 什么是合成事件

React 并不直接使用浏览器的原生 DOM 事件，而是创造了一套自己的事件系统，称为 **SyntheticEvent**（合成事件）。合成事件是对原生事件的封装，它具有与原生事件相同的接口（如 `preventDefault()` 和 `stopPropagation()`），但提供了更好的跨浏览器兼容性和性能优化。

```jsx
function Button() {
  const handleClick = (e) => {
    console.log(e.type); // 'click' - 事件类型
    console.log(e.target); // <button> - 触发事件的元素
    console.log(e.currentTarget); // <button> - 绑定事件的元素
    console.log(e.nativeEvent); // MouseEvent - 原生事件对象

    e.preventDefault(); // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
  };

  return <button onClick={handleClick}>点击我</button>;
}
```

React 选择合成事件的原因很简单：统一不同浏览器的事件行为差异，提供一致的 API，同时通过事件委托机制来优化性能。在旧版本浏览器中，事件处理存在许多兼容性问题，React 的合成事件为开发者屏蔽了这些细节。

## 事件委托的工作机制

React 最核心的优化就是事件委托。传统的事件处理方式是为每个元素单独绑定事件监听器，但 React 采用了不同的策略：**所有的事件监听器都被委托到一个根节点上**。

在 React 17 之前，所有事件都委托到 `document` 节点；React 17+ 改为委托到 React 应用的根容器节点。这个改变让多个 React 版本可以在同一页面共存，也减少了与第三方库的事件冲突。

```jsx
// React 内部的事件委托简化实现
rootNode.addEventListener("click", (nativeEvent) => {
  // 1. 从事件目标向上查找 React 组件
  const targetFiber = getClosestInstanceFromNode(nativeEvent.target);

  // 2. 创建合成事件对象
  const syntheticEvent = createSyntheticEvent(nativeEvent);

  // 3. 收集事件传播路径上的所有事件处理器
  const listeners = accumulateListeners(targetFiber, "onClick");

  // 4. 按照 DOM 树结构顺序执行事件处理器
  executeListeners(syntheticEvent, listeners);
});
```

这种机制的优势是显而易见的：无论页面有多少个按钮，实际上只有一个点击事件监听器在根节点上。当用户点击按钮时，事件会冒泡到根节点，React 会识别出事件的真实目标，然后模拟事件的传播过程，调用相应的事件处理器。

## 事件的传播阶段

React 的事件传播遵循 DOM 标准的事件模型，分为捕获阶段和冒泡阶段。理解这两个阶段对于处理复杂的事件交互非常重要。

```jsx
function EventPropagation() {
  // 捕获阶段：从父到子
  const handleParentCapture = () => console.log("父元素捕获");
  const handleChildCapture = () => console.log("子元素捕获");

  // 冒泡阶段：从子到父
  const handleChildBubble = () => console.log("子元素冒泡");
  const handleParentBubble = () => console.log("父元素冒泡");

  return (
    <div onClickCapture={handleParentCapture} onClick={handleParentBubble}>
      <button onClickCapture={handleChildCapture} onClick={handleChildBubble}>
        点击我
      </button>
    </div>
  );
}
// 点击按钮的输出顺序：
// 父元素捕获 → 子元素捕获 → 子元素冒泡 → 父元素冒泡
```

在实际开发中，大多数情况下我们只使用冒泡阶段的事件（如 `onClick`）。捕获阶段的事件（如 `onClickCapture`）通常用于需要在子元素之前处理事件的特殊场景，比如全局的快捷键处理或者模态框的点击外部关闭功能。

### 深入理解事件传播的三个阶段

当用户在页面上点击一个按钮时，事件不是直接在按钮上触发的，而是要经过一个完整的传播过程。这个过程分为三个阶段：

**1. 捕获阶段（Capturing Phase）**
事件从 DOM 树的根部开始，像"下雨"一样，从上往下逐层传播到目标元素。在这个阶段，父元素比子元素先收到事件通知。这就是为什么 React 中带有 `Capture` 后缀的事件处理器（如 `onClickCapture`）会比普通事件处理器先执行。

**2. 目标阶段（Target Phase）**
事件到达真正被点击的目标元素。在这个阶段，目标元素上的事件处理器会被调用。无论是捕获还是冒泡事件处理器，都会在这个阶段执行。

**3. 冒泡阶段（Bubbling Phase）**
事件从目标元素开始，像"气泡"一样向上冒泡，逐层传播回到根节点。在这个阶段，子元素比父元素先收到事件通知。React 中普通的事件处理器（如 `onClick`）就是在这个阶段执行的。

```jsx
function EventPhaseDemo() {
  return (
    <div
      onClickCapture={() => console.log("父-捕获")}
      onClick={() => console.log("父-冒泡")}
    >
      <button
        onClickCapture={() => console.log("子-捕获")}
        onClick={() => console.log("子-冒泡")}
      >
        点击我
      </button>
    </div>
  );
}
// 执行顺序：父-捕获 → 子-捕获 → 子-冒泡 → 父-冒泡
```

### 为什么需要理解这三个阶段？

理解事件传播的三个阶段对实际开发非常重要：

**捕获阶段的用途**：

- **全局拦截**：在事件到达目标之前进行统一处理，比如全局的权限检查、日志记录
- **优先处理**：确保某些逻辑比子组件的处理器先执行
- **条件阻止**：根据条件决定是否让事件继续传播到子元素

**冒泡阶段的用途**：

- **事件委托**：在父元素统一处理多个子元素的事件，提高性能
- **数据收集**：子元素触发事件后，在父元素收集相关数据
- **副作用处理**：在事件处理完成后执行一些清理或通知操作

```jsx
// 捕获阶段：全局权限检查
function ProtectedArea({ children }) {
  const handleClickCapture = (e) => {
    if (!user.hasPermission) {
      e.stopPropagation(); // 阻止事件继续传播
      showLoginDialog();
    }
  };

  return <div onClickCapture={handleClickCapture}>{children}</div>;
}

// 冒泡阶段：事件委托处理列表
function TodoList({ todos }) {
  const handleClick = (e) => {
    const todoId = e.target.closest("[data-todo-id]")?.dataset.todoId;
    if (todoId) toggleTodo(todoId);
  };

  return (
    <ul onClick={handleClick}>
      {todos.map((todo) => (
        <li key={todo.id} data-todo-id={todo.id}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

### 控制事件传播的方法

React 提供了几种方法来控制事件的传播流程：

**e.stopPropagation()**：阻止事件继续传播

- 在捕获阶段调用：阻止事件向下传播到子元素
- 在冒泡阶段调用：阻止事件向上传播到父元素

**e.preventDefault()**：阻止事件的默认行为

- 比如阻止链接跳转、表单提交等
- 不影响事件传播，只是取消浏览器的默认动作

```jsx
function PropagationControl() {
  const handleFormClick = (e) => {
    console.log("表单被点击了");
  };

  const handleButtonClick = (e) => {
    console.log("按钮被点击了");
    e.stopPropagation(); // 阻止事件冒泡到表单
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 阻止表单提交的默认行为
    console.log("自定义提交逻辑");
  };

  return (
    <form onClick={handleFormClick} onSubmit={handleSubmit}>
      <button type="button" onClick={handleButtonClick}>
        普通按钮（不会触发表单点击）
      </button>
      <button type="submit">提交（会阻止默认提交）</button>
    </form>
  );
}
```

### 常见的使用误区

很多开发者在使用事件传播时容易犯一些错误，这里是最常见的几个：

**误区 1：以为在父元素阻止传播能影响子元素**

```jsx
// ❌ 错误理解
function WrongExample() {
  const handleParentClick = (e) => {
    e.stopPropagation(); // 这不会阻止子元素的事件处理器执行
  };

  const handleChildClick = () => {
    console.log("我仍然会执行"); // 这个仍然会被调用
  };

  return (
    <div onClick={handleParentClick}>
      <button onClick={handleChildClick}>点击我</button>
    </div>
  );
}

// ✅ 正确做法：在子元素阻止向上冒泡
function CorrectExample() {
  const handleChildClick = (e) => {
    console.log("子元素处理");
    e.stopPropagation(); // 阻止冒泡到父元素
  };

  return (
    <div onClick={() => console.log("父元素不会收到事件")}>
      <button onClick={handleChildClick}>点击我</button>
    </div>
  );
}
```

**误区 2：混淆 target 和 currentTarget**

- `e.target`：实际被点击的元素（可能是子元素）
- `e.currentTarget`：绑定事件处理器的元素（总是当前组件的元素）

```jsx
function TargetExample() {
  const handleClick = (e) => {
    console.log("target:", e.target.tagName); // 可能是 SPAN
    console.log("currentTarget:", e.currentTarget.tagName); // 总是 DIV
  };

  return (
    <div onClick={handleClick}>
      <span>点击这个文本</span>
    </div>
  );
}
```

## React 事件与原生事件的差异

了解 React 事件与原生 DOM 事件的执行顺序，有助于避免一些微妙的 bug。

```jsx
function EventOrder() {
  useEffect(() => {
    const button = document.getElementById("my-button");

    // 原生事件监听器
    button.addEventListener("click", () => {
      console.log("原生按钮事件");
    });

    document.addEventListener("click", () => {
      console.log("原生 document 事件");
    });
  }, []);

  const handleClick = () => {
    console.log("React 事件");
  };

  return (
    <button id="my-button" onClick={handleClick}>
      点击测试
    </button>
  );
}
// 执行顺序：原生按钮事件 → React 事件 → 原生 document 事件
```

这个执行顺序告诉我们：React 事件的执行时机介于元素原生事件和 document 原生事件之间。这是因为 React 的事件委托机制是在根容器节点上监听的，而根容器节点在 DOM 树中位于 document 和具体元素之间。

需要特别注意的是，React 事件的 `stopPropagation()` 只能阻止 React 事件的传播，无法阻止原生事件。如果你需要阻止原生事件，必须在原生事件处理器中调用 `stopPropagation()`。

### 实际应用中的最佳实践

在实际开发中，以下是一些关于事件传播的最佳实践：

**1. 优先使用冒泡阶段**
大部分情况下使用普通的事件处理器（如 `onClick`）就足够了，只有在需要拦截或优先处理时才使用捕获阶段。

**2. 利用事件委托优化性能**
当有很多相似的子元素需要处理事件时，在父元素统一处理比为每个子元素绑定事件更高效。

**3. 谨慎使用 stopPropagation**
只在真正需要阻止事件传播时才使用，过度使用可能导致某些功能失效。

```jsx
// 推荐的事件委托模式
function OptimizedList({ items }) {
  const handleListClick = (e) => {
    // 获取被点击的列表项
    const listItem = e.target.closest("[data-item-id]");
    if (!listItem) return; // 点击的不是列表项，直接返回

    const itemId = listItem.dataset.itemId;
    handleItemAction(itemId);
  };

  return (
    <ul onClick={handleListClick}>
      {items.map((item) => (
        <li key={item.id} data-item-id={item.id}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## 事件池机制的演变

React 17 之前有一个叫做"事件池"的机制，这是一个性能优化策略，但也带来了一些使用上的复杂性。

```jsx
// React 16 及之前的行为
function EventPool() {
  const handleClick = (e) => {
    console.log(e.type); // 'click'

    // 异步访问事件对象会报错
    setTimeout(() => {
      console.log(e.type); // Warning: 事件对象已被回收
    }, 0);

    // 需要调用 persist() 来保持事件对象
    e.persist();
    setTimeout(() => {
      console.log(e.type); // 'click' - 正常工作
    }, 0);
  };

  return <button onClick={handleClick}>测试事件池</button>;
}
```

React 17 移除了事件池机制，现在可以随时访问事件对象，不再需要 `persist()` 方法。这个改变简化了事件处理的心智模型，让 React 的事件行为更加直观。
