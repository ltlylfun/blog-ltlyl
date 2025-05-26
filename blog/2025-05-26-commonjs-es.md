---
slug: commonjs-es-modules
title: CommonJS与ES模块：JavaScript模块化的演进
authors: [fangzhijie]
tags: [javascript, node.js]
---

# CommonJS 与 ES 模块：JavaScript 模块化的演进

JavaScript 模块化是现代前端开发的重要基础。本文将深入探讨 CommonJS 和 ES 模块两种主要的模块化方案，帮助你理解它们的特点、用法和区别。

<!-- truncate -->

在现代 JavaScript 开发中，模块化已经成为不可或缺的一部分。它将代码分解为独立、可重用的组件，帮助我们更好地组织代码、避免全局命名空间污染，并提高代码的复用性。

目前主流的模块化方案有两种：CommonJS 和 ES 模块。让我们从 Node.js 广泛使用的 CommonJS 开始了解。

## CommonJS：服务端的模块化先驱

CommonJS 是 Node.js 采用的模块化标准，它使用同步加载方式，语法简洁明了：

```javascript
// 导出模块 (math.js)
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = {
  add,
  subtract,
};

// 或者单个导出
module.exports.multiply = function (a, b) {
  return a * b;
};
```

```javascript
// 导入模块 (app.js)
const math = require("./math");
const { add, subtract } = require("./math");

console.log(math.add(5, 3)); // 8
console.log(subtract(10, 4)); // 6
```

CommonJS 的核心特点是**同步加载**和**值拷贝**。你可以在任何地方使用`require`，甚至在条件语句中动态加载模块。但要注意，导出的是值的拷贝，而不是引用：

```javascript
// 动态加载示例
if (condition) {
  const moduleA = require("./moduleA");
}

// 值拷贝示例
// counter.js
let count = 0;
function increment() {
  count++;
}

module.exports = {
  count,
  increment,
};

// main.js
const { count, increment } = require("./counter");
console.log(count); // 0
increment();
console.log(count); // 仍然是0，因为是值拷贝
```

## ES 模块：现代 JavaScript 的标准

ES 模块是 ECMAScript 2015 引入的官方标准，现代浏览器和 Node.js 都原生支持。相比 CommonJS，它采用了更加严格的静态结构：

```javascript
// 导出模块 (math.js)
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 默认导出
export default function multiply(a, b) {
  return a * b;
}

// 批量导出
const PI = 3.14159;
const E = 2.71828;
export { PI, E };
```

```javascript
// 导入模块 (app.js)
import multiply, { add, subtract, PI } from "./math.js";
import * as math from "./math.js";

console.log(add(5, 3)); // 8
console.log(multiply(4, 5)); // 20
console.log(math.PI); // 3.14159
```

ES 模块最大的特点是**引用绑定**——导出的是值的引用，这意味着模块间可以实时同步状态变化。同时，所有的导入导出都必须在模块顶层声明，这让打包工具能够进行静态分析和树摇优化：

```javascript
// 引用绑定示例
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from "./counter.js";
console.log(count); // 0
increment();
console.log(count); // 1，实时反映变化
```

## 两种模块系统的差异

| 特性      | CommonJS               | ES 模块           |
| --------- | ---------------------- | ----------------- |
| 语法      | require/module.exports | import/export     |
| 加载时机  | 运行时                 | 编译时            |
| 加载方式  | 同步                   | 异步              |
| 输出      | 值拷贝                 | 引用绑定          |
| 动态加载  | 支持                   | 需要动态 import() |
| 树摇优化  | 不支持                 | 支持              |
| 顶层 this | 指向当前模块           | undefined         |

在实际开发中，两种模块系统往往需要共存。Node.js 提供了多种方式来实现互操作：

在`package.json`中设置`"type": "module"`可以让 Node.js 默认使用 ES 模块，或者使用`.mjs`扩展名明确标识 ES 模块文件。

```javascript
// package.json
{
  "type": "module" // 使用ES模块
}

// 或者使用.mjs扩展名
// math.mjs
export function add(a, b) {
  return a + b;
}
```

当你需要在 ES 模块中使用 CommonJS 包时，可以使用`createRequire`或动态导入：

```javascript
// 使用createRequire
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const lodash = require("lodash");

// 或者使用动态import
const lodash = await import("lodash");
```

反过来，在 CommonJS 中使用 ES 模块则只能通过动态`import()`：

```javascript
// 使用动态import
const math = await import("./math.js");
console.log(math.add(1, 2));

// 或者在异步函数中
async function loadModule() {
  const { add } = await import("./math.js");
  return add(1, 2);
}
```

## 实践建议

**模块系统选择**方面，新项目建议优先使用 ES 模块，它是标准化的未来方向。对于 Node.js 服务，可以根据团队习惯选择，但要保持一致性。浏览器应用应该使用 ES 模块，而开发通用库时最好提供双重支持。

```javascript
// 好的做法：清晰的导出
export class UserService {
  // ...
}

export const config = {
  apiUrl: 'https://api.example.com'
};

export default UserService;

// 避免混乱的导出
export default {
  UserService,
  config,
  helper1,
  helper2,
  // ...
};
```

**依赖管理**要清晰明确，避免深层路径导入，最好使用路径别名：

```javascript
// 明确的依赖声明
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

// 避免：深层路径导入
// import Button from '../../../components/ui/Button';
// 更好：使用路径别名
import Button from "@/components/ui/Button";
```

让我们看几个实际应用场景。

**工具函数库**的组织是模块化的经典应用：

```javascript
// utils/string.js
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str, length) {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

// utils/index.js
export * from "./string.js";
export * from "./array.js";
export * from "./object.js";
```

**配置管理**也是模块化的常见用法，特别是需要根据环境动态加载配置时：

```javascript
// config/development.js
export default {
  apiUrl: 'http://localhost:3000/api',
  debug: true
};

// config/production.js
export default {
  apiUrl: 'https://api.production.com',
  debug: false
};

// config/index.js
const env = process.env.NODE_ENV || 'development';
const config = await import(`./${env}.js`);
export default config.default;
```
