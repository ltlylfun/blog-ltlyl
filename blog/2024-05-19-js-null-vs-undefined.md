---
slug: js-null-vs-undefined
title: js中null与undefined的区别
authors: [fangzhijie]
tags: [javascript]
---

在 JavaScript 中，`null` 和 `undefined` 都表示“无值”，但它们有本质上的区别。理解这两者的不同，有助于我们更好地编写健壮的代码。

<!-- truncate -->

### 定义与含义

- **undefined**：表示变量已声明但尚未赋值，或对象属性不存在。
- **null**：表示变量已赋值，值为“空对象指针”，通常用于主动清空变量。

### 常见场景

```js
let a;
console.log(a); // undefined

let b = null;
console.log(b); // null

let obj = {};
console.log(obj.prop); // undefined
```

### 类型区别

- `typeof undefined` 返回 "undefined"
- `typeof null` 返回 "object"（历史遗留问题）

```js
console.log(typeof undefined); // "undefined"
console.log(typeof null); // "object"
```

### 相等与全等

- `null == undefined` 为 `true`，因为它们都表示“无值”
- `null === undefined` 为 `false`，类型不同

```js
console.log(null == undefined); // true
console.log(null === undefined); // false
```

### 实际应用

- `undefined` 多用于变量未赋值、函数无返回值、对象属性不存在等场景。
- `null` 多用于主动清空对象、重置变量。
