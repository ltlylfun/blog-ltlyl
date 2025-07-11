---
slug: for-in-vs-for-of
title: JavaScript中for...in与for...of的区别详解
authors: [fangzhijie]
tags: [javascript]
---

在写代码中，我们经常需要遍历数组和对象。除了传统的`for`循环，ES6 还为我们提供了`for...in`和`for...of`两种循环方式。虽然它们看起来很相似，但用途和行为却有着重要的区别。

<!-- truncate -->

## for...in - 遍历对象属性

`for...in`循环用于遍历对象的**可枚举属性**，返回的是属性名（键）。

```javascript
// 遍历对象
const person = {
  name: "张三",
  age: 25,
  city: "北京",
};

for (let key in person) {
  console.log(key + ": " + person[key]);
}
// 输出: name: 张三, age: 25, city: 北京

// 遍历数组（不推荐）
const fruits = ["苹果", "香蕉", "橙子"];
for (let index in fruits) {
  console.log(index + ": " + fruits[index]);
}
// 输出: 0: 苹果, 1: 香蕉, 2: 橙子
// 注意：index是字符串类型！
```

## for...of - 遍历可迭代对象的值

`for...of`循环用于遍历**可迭代对象**的值，如数组、字符串、Map、Set 等。

```javascript
// 遍历数组
const fruits = ["苹果", "香蕉", "橙子"];
for (let fruit of fruits) {
  console.log(fruit);
}
// 输出: 苹果, 香蕉, 橙子

// 遍历字符串
const text = "Hello";
for (let char of text) {
  console.log(char);
}
// 输出: H, e, l, l, o

// 遍历Map和Set
const map = new Map([
  ["name", "李四"],
  ["age", 30],
]);
for (let [key, value] of map) {
  console.log(`${key}: ${value}`);
}

const set = new Set([1, 2, 3, 4]);
for (let value of set) {
  console.log(value);
}
```

## 主要区别对比

| 特性         | for...in                 | for...of                                |
| ------------ | ------------------------ | --------------------------------------- |
| **遍历内容** | 对象的可枚举属性名（键） | 可迭代对象的值                          |
| **适用对象** | 所有对象                 | 可迭代对象（数组、字符串、Map、Set 等） |
| **数组遍历** | 遍历索引（字符串类型）   | 遍历元素值                              |
| **对象遍历** | ✅ 支持                  | ❌ 不支持（普通对象不可迭代）           |
| **原型链**   | 会遍历继承的属性         | 不会遍历原型链                          |

## 应用场景

```javascript
// for...in 适用场景：遍历对象属性
const config = {
  host: "localhost",
  port: 3000,
  debug: true,
};

for (let key in config) {
  console.log(`配置项 ${key}: ${config[key]}`);
}

// for...of 适用场景：遍历数组元素
const numbers = [1, 2, 3, 4, 5];
let sum = 0;

for (let num of numbers) {
  sum += num;
}
console.log("总和:", sum); // 15

// 处理异步操作
async function processFiles(filenames) {
  for (let filename of filenames) {
    await processFile(filename);
  }
}
```

## 陷阱

```javascript
// for...in 陷阱1：会遍历原型链上的属性
Array.prototype.customMethod = function () {};
const arr = [1, 2, 3];
for (let key in arr) {
  console.log(key); // 输出 0, 1, 2, customMethod
}

// 解决方案：使用hasOwnProperty
for (let key in arr) {
  if (arr.hasOwnProperty(key)) {
    console.log(key); // 只输出 0, 1, 2
  }
}

// for...in 陷阱2：数组索引是字符串
const numbers = [10, 20, 30];
for (let index in numbers) {
  console.log(typeof index); // "string"
  console.log(index + 1); // "01", "11", "21" (字符串拼接)
}

// for...of 限制：不能直接遍历普通对象
const obj = { a: 1, b: 2 };
// for (let value of obj) {} // TypeError: obj is not iterable

// 解决方案：
for (let value of Object.values(obj)) {
  console.log(value);
}
```
