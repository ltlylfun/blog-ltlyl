---
slug: javascript-data-types
title: JavaScript数据类型：基本类型 vs 引用类型
authors: [fangzhijie]
tags: [javascript]
---

JavaScript 中的数据类型分为两大类：基本类型和引用类型。

<!-- truncate -->

## 基本类型（Primitive Types）

JavaScript 有 7 种基本类型：

```javascript
// 7种基本类型
let num = 42; // number
let str = "hello"; // string
let bool = true; // boolean
let n = null; // null
let u = undefined; // undefined
let sym = Symbol("id"); // symbol
let big = 123n; // bigint
```

## 引用类型（Reference Types）

引用类型主要包括：

```javascript
// 引用类型
let obj = { name: "Alice" }; // Object
let arr = [1, 2, 3]; // Array
let func = function () {}; // Function
let date = new Date(); // Date
let regex = /pattern/; // RegExp
```

## 存储方式对比

```mermaid
graph TB
    A[JavaScript数据类型] --> B[基本类型]
    A --> C[引用类型]

    B --> D[栈内存存储]
    D --> D1[直接存储值]
    D --> D2[占用空间小]
    D --> D3[访问速度快]

    C --> E[堆内存存储]
    E --> E1[存储对象引用]
    E --> E2[占用空间大]
    E --> E3[访问需要寻址]

    style B fill:#81c784
    style C fill:#ffb74d
```

## 核心区别

**赋值行为差异：**

```javascript
// 基本类型 - 值传递
let a = 10;
let b = a; // 复制值
a = 20;
console.log(a); // 20
console.log(b); // 10 (不受影响)

// 引用类型 - 引用传递
let obj1 = { count: 10 };
let obj2 = obj1; // 复制引用
obj1.count = 20;
console.log(obj1.count); // 20
console.log(obj2.count); // 20 (同时改变)
```

**函数参数传递：**

```javascript
// 基本类型参数
function changeValue(x) {
  x = 100;
}
let num = 50;
changeValue(num);
console.log(num); // 50 (原值不变)

// 引用类型参数
function changeObject(obj) {
  obj.name = "Bob";
}
let person = { name: "Alice" };
changeObject(person);
console.log(person.name); // "Bob" (原对象被修改)
```

**比较行为差异：**

```javascript
// 基本类型比较 - 比较值
let a = 5,
  b = 5;
console.log(a === b); // true

// 引用类型比较 - 比较引用地址
let obj1 = { name: "Alice" };
let obj2 = { name: "Alice" };
console.log(obj1 === obj2); // false (不同对象)

let obj3 = obj1;
console.log(obj1 === obj3); // true (引用相同对象)
```

## 内存管理

```mermaid
graph LR
    A[内存分配] --> B[栈内存]
    A --> C[堆内存]

    B --> B1[基本类型]
    B --> B2[引用类型地址]

    C --> C1[对象实际数据]
    C --> C2[垃圾回收管理]

    style B fill:#e3f2fd
    style C fill:#fff3e0
```

## 类型检测与深拷贝

**类型检测方法：**

```javascript
// 基本类型检测
console.log(typeof 42); // "number"
console.log(typeof "hello"); // "string"

// 引用类型检测
console.log(typeof {}); // "object"
console.log(Array.isArray([])); // true
console.log(Object.prototype.toString.call([])); // "[object Array]"
```

**深拷贝 vs 浅拷贝：**

```javascript
// 浅拷贝问题
let original = { name: "Alice", hobbies: ["reading", "coding"] };
let copy = { ...original }; // 浅拷贝
copy.hobbies.push("gaming");
console.log(original.hobbies); // ["reading", "coding", "gaming"]

// 深拷贝解决方案
let deepCopy = JSON.parse(JSON.stringify(original));

// 或
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return null;
  if (typeof obj !== "object") return obj;

  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  if (obj instanceof Map)
    return new Map(
      [...obj].map(([key, val]) => [deepClone(key, hash), deepClone(val, hash)])
    );
  if (obj instanceof Set)
    return new Set([...obj].map((val) => deepClone(val, hash)));

  if (hash.has(obj)) return hash.get(obj);
  const newObj = new obj.constructor();
  hash.set(obj, newObj);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepClone(obj[key], hash);
    }
  }
  return newObj;
}
```

**深拷贝方法对比：**

1. `JSON.parse(JSON.stringify(obj))`

   - 优点：简单易用，适合拷贝结构简单的对象。
   - 局限：
     - 无法拷贝函数、undefined、Symbol、BigInt 等类型属性；
     - Date、RegExp、Map、Set 等特殊对象会被转为普通对象或丢失信息；
     - 循环引用会报错；
     - 原型链信息丢失。

2. `deepClone`递归函数
   - 能处理 Date、RegExp、Map、Set 等特殊对象，支持循环引用（通过 WeakMap），保留原型链，递归拷贝所有属性。
