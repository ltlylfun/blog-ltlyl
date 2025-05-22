---
title: this输出题
sidebar_label: this-part2
description: JavaScript 与this相关的输出题
---

## 11

```js
function a(xx) {
  this.x = xx;
  return this;
}
var x = a(5);
var y = a(6);

console.log(x.x);
console.log(y.x);
```

undefined

6

1. 函数 a 定义了一个参数 xx，并将 this.x 设为 xx，然后返回 this 对象

2. 变量 x = a(5)：

   - 此处 a 函数在全局作用域被调用，没有使用 new 关键字
   - 此时 this 指向全局对象(浏览器中是 window，Node.js 中是 global)
   - this.x = 5 实际上是给全局对象添加或修改 x 属性为 5
   - 返回的是全局对象
   - 因此 x 变量引用的是全局对象

3. 变量 y = a(6)：

   - 同样在全局作用域调用，this 仍然指向全局对象
   - this.x = 6 覆盖了全局对象的 x 属性，从 5 变成 6
   - 返回全局对象，y 变量也引用全局对象

4. console.log(x.x)输出 undefined：

   - 这是此代码中的关键问题：为什么 x.x 是 undefined 而不是 6？
   - 虽然 x = a(5)执行后，x 是指向全局对象的，但这里有一个重要细节
   - 在 JavaScript 中，变量声明 var x = ... 会在全局作用域创建一个名为 x 的变量
   - 这个变量 x 会"遮蔽(shadow)"全局对象上的同名属性 x
   - 当我们执行 console.log(x.x) 时：
     1. 首先获取变量 x 的值，这是全局对象的引用
     2. 然后尝试访问这个对象上的 x 属性
     3. 但是当访问属性时，JavaScript 是通过引用查找的，不是通过变量名
     4. 所以 x.x 相当于是在全局对象上查找一个名为"x"的属性
   - 在这个过程中，由于变量 x"遮蔽"了全局对象的 x 属性，所以 x.x 无法访问全局 x
   - 因此返回 undefined

5. console.log(y.x)输出 6：
   - 而 y.x 能够正确输出 6，是因为：
   - y 引用了全局对象
   - x 是全局对象的一个属性，值为 6
   - 所以 y.x 访问的是全局对象上的 x 属性，值为 6

更清晰的理解：

- 当我们使用 var 声明变量时，如果变量名和全局对象的属性同名，变量会"遮蔽"属性
- 变量 x 和全局对象的属性 x 是不同的东西
- 实际上，如果我们改用 window.x（浏览器环境）或 global.x（Node 环境），将会得到 6
- 也就是说，全局对象的 x 属性确实是 6，但变量 x 遮蔽了这个属性的直接访问

这个例子展示了 JavaScript 中变量声明与全局对象属性间的复杂关系，以及 this 指向与变量作用域的交互

关于 Node.js 环境下的行为：

- 在 Node.js 环境中，这段代码的行为与浏览器环境不同
- Node.js 中的全局对象是 global，但与浏览器中的 window 不同，var 声明的变量不会自动成为 global 对象的属性
- 在 Node.js 模块系统中，每个文件都有自己的作用域，var 声明的变量只在当前模块作用域内有效
- 当执行函数 a()时，非严格模式下 this 仍指向 global 对象，所以 this.x = xx 会设置 global.x

对比 Node.js 和浏览器环境的差异：

1. 浏览器环境:

   - var x = a(5) 会创建全局变量 x，同时 x 也是 window 对象的属性
   - x 和 window.x 访问的是同一个值
   - 但 x.x 尝试访问变量 x 上名为 x 的属性，而不是 window 上的 x 属性

2. Node.js 环境:
   - var x = a(5) 只在当前模块创建变量 x，不会成为 global 对象的属性
   - x 和 global.x 是完全不同的两个变量
   - 函数 a 中修改的是 global.x，而不影响模块作用域内的变量 x
   - 因此，x 的值是 global 对象，但 x.x 仍然是 undefined
   - y 的值也是 global 对象，y.x 能访问到 global.x 的值 6

所以，无论在浏览器还是 Node 环境，x.x 都会是 undefined，y.x 都会是 6，但原理略有不同。在 Node 环境中，模块系统的作用域隔离使变量声明与全局对象的属性有更清晰的区分。

补充理解：
在 Node.js 中，如果直接访问 x（而不是 x.x），会得到 global 对象；
如果直接访问 global.x，会得到 6，这与浏览器环境中访问 window.x 是一致的。

## 12

```js
function foo(something) {
  this.a = something;
}

var obj1 = {
  foo: foo,
};

var obj2 = {};

obj1.foo(2);
console.log(obj1.a);

obj1.foo.call(obj2, 3);
console.log(obj2.a);

var bar = new obj1.foo(4);
console.log(obj1.a);
console.log(bar.a);
```

2

3

2

4

1. 首先定义了函数 foo，它会给调用它的对象的'a'属性赋值

2. obj1.foo(2)

   - 这里是通过对象方法调用模式，this 指向 obj1
   - 执行后 obj1.a = 2

3. obj1.foo.call(obj2, 3)

   - 使用 call 显式绑定 this 为 obj2
   - 执行后 obj2.a = 3

4. var bar = new obj1.foo(4)
   - 使用 new 关键字创建实例，此时 this 指向新创建的对象 bar
   - foo 函数作为构造函数使用，new 操作符会创建一个新对象
   - 执行后 bar.a = 4，而 obj1.a 保持不变(仍为 2)

这个例子展示了 JavaScript 中函数调用的四种方式之三：

- 方法调用(obj1.foo(2))：this 绑定到该方法所属的对象
- call/apply 调用(obj1.foo.call(obj2, 3))：this 被显式指定
- 构造函数调用(new obj1.foo(4))：this 指向新创建的对象
  (第四种是普通函数调用，this 指向全局对象或 undefined，本例未展示)

## 13

```js
function foo(something) {
  this.a = something;
}

var obj1 = {};

var bar = foo.bind(obj1);
bar(2);
console.log(obj1.a);

var baz = new bar(3);
console.log(obj1.a);
console.log(baz.a);
```

2

2

3

1. 首先，我们定义了一个函数 foo，它将参数 something 赋值给 this.a。

2. 创建一个空对象 obj1。

3. 使用 bind 方法创建一个新函数 bar，将 foo 函数的 this 绑定到 obj1。
   bind 方法返回一个新函数，其 this 值被绑定到指定值。

4. 调用 bar(2)，由于 bar 已经被绑定到 obj1，所以相当于执行 obj1.a = 2。
   因此 console.log(obj1.a) 输出 2。

5. 使用 new 关键字调用 bar(3) 创建实例 baz。
   这里展示了一个重要特性：当使用 new 调用一个函数时，即使该函数已被 bind 绑定了 this，
   new 操作符也会覆盖这个绑定，创建一个全新的对象并将 this 指向这个新对象。

6. 因此 new bar(3) 创建了一个新对象 baz，并在这个对象上设置了 a 属性为 3，
   而不是修改 obj1.a。这就是为什么 obj1.a 仍然是 2，而 baz.a 是 3。

7. 这个例子完美地展示了 JavaScript 中 this 绑定的优先级：
   - new 绑定 > 显式绑定(bind/call/apply) > 隐式绑定(对象方法调用) > 默认绑定(独立函数调用)
   - 在这里，new 绑定的优先级高于 bind 的显式绑定
