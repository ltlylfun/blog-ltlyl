---
slug: react-compiler-rc
title: React Compiler RC：自动优化的新时代
authors: [fangzhijie]
tags: [react]
---

# React Compiler RC：自动优化的新时代

React Compiler RC (Release Candidate) 是 React 团队推出的一个革命性工具，它能够自动优化 React 应用的性能，减少开发者手动优化的负担。

<!-- truncate -->

React Compiler 是一个编译时工具，它能够自动分析你的 React 代码，并在编译阶段自动添加性能优化，如 memoization（记忆化）。这意味着开发者不再需要手动使用 `useMemo`、`useCallback` 和 `memo` 来优化组件性能。

## 安装 React Compiler RC

要安装最新的 RC 版本，你可以使用以下命令：

```bash
# npm
npm install --save-dev --save-exact babel-plugin-react-compiler@rc

# pnpm
pnpm add --save-dev --save-exact babel-plugin-react-compiler@rc

# yarn
yarn add --dev --exact babel-plugin-react-compiler@rc
```

## RC 版本的改进

在 RC 版本中，React 团队让 React Compiler 更容易集成到项目中，并优化了编译器生成记忆化的方式。现在 React Compiler 支持可选链和数组索引作为依赖项，这些改进最终减少了重新渲染，让 UI 更加响应。

此外，社区反馈 ref-in-render 验证有时会出现误报。React 团队希望开发者能够完全信任编译器的错误消息和提示，因此暂时默认关闭了这个验证，未来会在改进后重新启用。

## 兼容性

React Compiler 兼容 React 17 及以上版本。如果你还没有升级到 React 19，可以在编译器配置中指定最小目标版本，并添加 `react-compiler-runtime` 作为依赖。

## ESLint 配置更新

如果你之前安装了 `eslint-plugin-react-compiler`，现在可以移除它，改用 `eslint-plugin-react-hooks@6.0.0-rc.1`：

```bash
# 安装新版本
npm install --save-dev eslint-plugin-react-hooks@6.0.0-rc.1
```

配置 ESLint：

```javascript
// eslint.config.js
import * as reactHooks from "eslint-plugin-react-hooks";

export default [
  // Flat Config (eslint 9+)
  reactHooks.configs.recommended,

  // Legacy Config
  reactHooks.configs["recommended-latest"],
];
```

要启用 React Compiler 规则，在 ESLint 配置中添加 `'react-hooks/react-compiler': 'error'`。

## 构建工具支持

React Compiler 可以在多种构建工具中使用，包括 Babel、Vite 和 Rsbuild。特别值得注意的是，React 团队与 swc 团队合作，增加了对 React Compiler 的实验性支持。在启用 React Compiler 的 Next.js 应用中，构建性能现在明显更快。建议使用 Next.js 15.3.1 或更高版本以获得最佳构建性能。

## 升级注意事项

React Compiler 的自动记忆化主要用于性能优化。未来版本可能会改变记忆化的应用方式，比如变得更细粒度和精确。由于产品代码有时可能以 JavaScript 静态检测不到的方式违反 React 规则，改变记忆化偶尔可能产生意外结果。

因此，React 团队建议遵循 React 规则并进行持续的端到端测试。如果没有良好的测试覆盖率，建议将编译器固定到确切版本（如 19.1.0），而不是 SemVer 范围（如 ^19.1.0）。

React Compiler RC 代表了 React 性能优化的未来方向，现在正是开始实验和学习的好时机。通过自动化性能优化，开发者可以专注于业务逻辑，而让编译器处理复杂的优化工作。

---

_注：本文基于 React Compiler RC 版本，具体 API 和功能可能在正式版本中有所变化。_
