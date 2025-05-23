---
title: Redux 状态管理
sidebar_label: Redux 介绍
description: Redux 状态管理库的核心概念与使用指南
---

# Redux 介绍

Redux 是一个为 JavaScript 应用设计的可预测状态容器，它通过集中式管理应用状态，使得状态变化变得可追踪和可预测。虽然最初是为 React 设计，但它可以与任何前端框架搭配使用。Redux 遵循严格的单向数据流原则，通过 Store、Action 和 Reducer 这三个核心概念构建应用状态管理系统。

在 Redux 中，所有状态都保存在单一的 Store 对象树中。当需要修改状态时，必须通过派发（dispatch）一个 Action 对象来描述"发生了什么"，然后由 Reducer 函数根据这个 Action 更新状态。这种模式确保状态的更新是可预测的，使得应用行为更稳定，调试更容易。

```javascript
// 创建一个简单的 Redux store
import { createStore } from "redux";

// Reducer 定义如何响应 action 并更新状态
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

// 创建 Redux store
const store = createStore(counterReducer);

// 订阅状态变化
store.subscribe(() => console.log(store.getState()));

// 派发 action 来更新状态
store.dispatch({ type: "INCREMENT" }); // 输出 { count: 1 }
store.dispatch({ type: "INCREMENT" }); // 输出 { count: 2 }
store.dispatch({ type: "DECREMENT" }); // 输出 { count: 1 }
```

Redux 的生态系统非常丰富，包括 Redux Toolkit（简化开发的官方工具集）、Redux DevTools（调试工具）以及各种中间件如 redux-thunk 和 redux-saga 用于处理异步逻辑。虽然 Redux 有一定的学习曲线和模板代码，但对于大型复杂应用，特别是那些需要在多个组件间共享状态、需要可预测性和良好调试体验的场景，Redux 仍然是一个强大且受欢迎的选择。
