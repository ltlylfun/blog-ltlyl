---
slug: js-isnan-vs-numberisnan
title: js中isNaN和Number.isNaN函数的区别
authors: [fangzhijie]
tags: [javascript]
---

在 JavaScript 中，`isNaN` 和 `Number.isNaN` 都用于判断一个值是否为 NaN，但它们的行为有明显区别。理解这两者的不同，有助于我们避免类型转换带来的隐患，编写更严谨的代码。

<!-- truncate -->

### 基本用法

- `isNaN(value)`：会先将参数转换为数字，再判断是否为 NaN。
- `Number.isNaN(value)`：不会进行类型转换，只在参数本身就是 NaN 时才返回 true。

### 示例对比

```js
console.log(isNaN(NaN)); // true
console.log(Number.isNaN(NaN)); // true

console.log(isNaN("abc")); // true，因为 'abc' 转为数字是 NaN
console.log(Number.isNaN("abc")); // false，因为 'abc' 不是 NaN

console.log(isNaN(undefined)); // true，因为 undefined 转为数字是 NaN
console.log(Number.isNaN(undefined)); // false，因为 undefined 不是 NaN

console.log(isNaN(123)); // false
console.log(Number.isNaN(123)); // false
```

- `isNaN` 会对参数进行类型转换，容易误判一些非数字类型。
- `Number.isNaN` 更严格，只判断值本身是否为 NaN，推荐在实际开发中优先使用。
