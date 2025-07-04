---
slug: react-cra-deprecated
title: React 官方废弃 Create React App：新时代的开始
authors: [fangzhijie]
tags: [react]
---

2025 年 2 月 14 日，React 官方团队正式发布博客文章《[逐步淘汰 Create React App](https://zh-hans.react.dev/blog/2025/02/14/sunsetting-create-react-app)》，宣布不再推荐使用 Create React App（CRA）作为新项目的脚手架工具。这一决定标志着 React 生态系统进入了一个新的发展阶段。

<!-- truncate -->

## 为什么废弃 Create React App？

根据 React 官方博客的说明，废弃 CRA 的主要原因包括：

### 1. 性能问题

Create React App 基于 Webpack 构建，随着项目规模的增长，构建速度会显著下降。特别是在开发环境中，热重载的速度往往让人难以忍受。

```bash
# CRA 项目启动时间
npm start
# 通常需要 30-60 秒才能启动完成
```

### 2. 配置灵活性不足

CRA 的"零配置"理念虽然降低了入门门槛，但也限制了开发者的自定义能力。当项目需要特殊配置时，开发者往往需要：

- 使用 `npm run eject` 暴露配置（不可逆）
- 使用 CRACO 等第三方工具
- 采用复杂的 workaround

### 3. 维护成本高

React 团队需要维护大量的依赖包和配置，这占用了大量资源。同时，社区中已经涌现出更优秀的替代方案。

> 如官方博客所述："由于 Create React App 目前没有活跃的维护者，并且已经有许多现有的框架能够解决这些问题，我们决定弃用 Create React App。"

从 2025 年 2 月 14 日起，当开发者安装新的 CRA 应用时，会看到一个废弃警告：

```
create-react-app is deprecated.
You can find a list of up-to-date React frameworks on react.dev
```

## 官方推荐的替代方案

### 1. Next.js - 全栈 React 框架

Next.js 是目前最受欢迎的 React 框架，提供了完整的全栈解决方案。

```bash
# 创建 Next.js 项目
npx create-next-app@latest my-app

# 启动项目
npm run dev
```

**优势：**

- 内置 SSR/SSG 支持
- 自动代码分割
- 文件系统路由
- API 路由
- 图像优化
- 优秀的开发体验

### 2. Vite - 现代构建工具

Vite 基于 ES modules，提供极快的开发体验。

```bash
# 创建 Vite + React 项目
npm create vite@latest my-app -- --template react

# 或者使用 TypeScript
npm create vite@latest my-app -- --template react-ts
```

**优势：**

- 极快的冷启动
- 快速的热重载
- 丰富的插件生态
- 现代化的构建输出

### 3. Remix - 专注于 Web 标准

Remix 强调 Web 标准和渐进增强。

```bash
# 创建 Remix 项目
npx create-remix@latest my-app
```

**优势：**

- 基于 Web 标准
- 优秀的 SEO 支持
- 内置错误处理
- 数据加载优化

## 迁移指南

### 从 CRA 迁移到 Vite

1. **创建新的 Vite 项目**

```bash
npm create vite@latest my-new-app -- --template react-ts
```

2. **迁移依赖和代码**

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

3. **更新环境变量**

```javascript
// CRA 中
const apiUrl = process.env.REACT_APP_API_URL;

// Vite 中
const apiUrl = import.meta.env.VITE_API_URL;
```

### 从 CRA 迁移到 Next.js

1. **创建 Next.js 项目**

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint
```

2. **重构路由结构**

```
src/
  pages/          # CRA 中的组件
    index.tsx     # 主页
    about.tsx     # 关于页面
  components/     # 共享组件
```

迁移为：

```
src/
  app/            # Next.js 13+ App Router
    page.tsx      # 主页
    about/
      page.tsx    # 关于页面
  components/     # 共享组件
```

## 性能对比

让我们看看不同工具的性能表现：

| 工具    | 冷启动时间 | 热重载时间 | 构建时间 |
| ------- | ---------- | ---------- | -------- |
| CRA     | 30-60s     | 1-3s       | 60-120s  |
| Vite    | 1-3s       | &lt;200ms  | 30-60s   |
| Next.js | 5-10s      | 500ms      | 45-90s   |

**推荐阅读：**

- [React 官方博客 - 逐步淘汰 Create React App](https://zh-hans.react.dev/blog/2025/02/14/sunsetting-create-react-app)
- [React 官方文档 - 开始新项目](https://react.dev/learn/start-a-new-react-project)
- [Vite 官方文档](https://vitejs.dev/)
- [Next.js 官方文档](https://nextjs.org/)

---

_你是否已经开始迁移你的 React 项目了？欢迎在评论区分享你的经验和看法！_
