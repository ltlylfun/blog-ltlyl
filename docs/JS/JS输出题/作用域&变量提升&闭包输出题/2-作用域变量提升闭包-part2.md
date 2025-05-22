---
title: 作用域&变量提升&闭包输出题
sidebar_label: 作用域&变量提升&闭包part2
description: JavaScript 与作用域&变量提升&闭包相关的输出题
---

## 11

```js
function a() {
  console.log("a1111111");
}

a = function () {
  console.log("b111111");
};

a(); // 输出 b111111
```
