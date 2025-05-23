---
title: Zustand 状态管理
sidebar_label: Zustand 介绍
description: Zustand 轻量级状态管理库的特性与实践
---

# Zustand 介绍

Zustand 是一个轻量而强大的 React 状态管理库，由 Poimandres 团队（前身为 react-spring 团队）开发。它采用简约设计理念，通过直观的基于 hooks 的 API，以约 1KB 的体积提供了令人惊艳的状态管理能力。与 Redux 等传统方案相比，Zustand 几乎没有样板代码，不需要 Provider 包裹，同时保持了高性能和出色的 TypeScript 支持。

Zustand 的使用非常简洁，创建一个 store 只需几行代码。它基于 React Hooks 的设计使得在组件中访问和更新状态变得极为自然。无需样板代码，无需 Provider，只需导入并使用。

```javascript
import { create } from "zustand";

// 创建 store
const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));

// 在组件中使用
function BearCounter() {
  const bears = useStore((state) => state.bears);
  const { increasePopulation } = useStore();

  return (
    <>
      <h1>熊的数量: {bears}</h1>
      <button onClick={increasePopulation}>增加熊</button>
    </>
  );
}
```

虽然体积小巧，Zustand 却不乏强大功能，包括异步状态管理、状态持久化、中间件支持等。它只在选择的状态真正变化时才触发组件更新，通过细粒度的订阅机制避免了不必要的重渲染，带来了卓越的性能。

相比 Redux 的庞大体系和陡峭学习曲线，Zustand 以其简洁直观的 API 和几乎为零的学习成本赢得了众多开发者的喜爱，特别适合中小型应用和追求开发效率的团队。无论是个人项目还是团队协作，Zustand 都能提供流畅的开发体验和可靠的状态管理方案。
