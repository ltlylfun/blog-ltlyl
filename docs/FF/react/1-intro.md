---
title: React 简介
sidebar_label: React 简介
description: React 框架的基本概念与核心特性介绍
sidebar_position: 1
---

# React 简介

## 什么是 React？

React 是由 Facebook（现 Meta）于 2013 年开源的 JavaScript 库，用于构建用户界面。它主要专注于视图层，使开发者能够创建可复用的 UI 组件，并高效地管理组件状态和渲染过程。

## React 的核心特性

### 组件化

React 的核心思想是将 UI 拆分为独立、可复用的组件。每个组件维护自己的状态和渲染逻辑，使代码更易于理解和维护。

```jsx
function Welcome(props) {
  return <h1>你好，{props.name}</h1>;
}
```

### 虚拟 DOM

React 使用虚拟 DOM（Virtual DOM）技术来提高性能。它在内存中维护一个轻量级的 DOM 表示，当组件状态改变时，React 会：

1. 生成新的虚拟 DOM 树
2. 与之前的虚拟 DOM 树进行比较（Diffing 算法）
3. 只更新实际 DOM 中需要改变的部分

这大大减少了 DOM 操作，提高了应用性能。

### 单向数据流

React 采用自上而下的单向数据流，使应用中的数据流动更加可预测：

- 父组件通过 props 向子组件传递数据
- 子组件通过回调函数与父组件通信

```jsx
function ParentComponent() {
  const [count, setCount] = useState(0);

  return (
    <ChildComponent value={count} onIncrement={() => setCount(count + 1)} />
  );
}
```

### 声明式编程

React 采用声明式而非命令式的编程方式，开发者只需描述 UI 在各种状态下的样子，而不必关心状态转换的具体操作。

## React 生态系统

React 拥有丰富的生态系统，包括：

- **React Router** - 处理应用路由
- **Redux/Context API** - 状态管理
- **Next.js** - 服务端渲染框架
- **Create React App** - 快速搭建项目
- **React Native** - 使用 React 构建移动应用

## React 的发展历程

- **2013 年** - Facebook 开源 React
- **2015 年** - React Native 发布
- **2016 年** - React v15 发布
- **2017 年** - React v16 发布，引入 Fiber 架构
- **2019 年** - React Hooks 正式发布
- **2022 年** - React 18 发布，引入并发渲染
