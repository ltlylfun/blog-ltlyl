---
title: 作用域&变量提升&闭包输出题
sidebar_label: 作用域&变量提升&闭包part1
description: JavaScript 与作用域&变量提升&闭包相关的输出题
---

## 1

```js
for (var i = 1; i <= 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, 0);
}
```

6

6

6

6

6

1. 变量 i 使用 var 声明，var 声明的变量没有块级作用域，只有函数作用域
2. 循环完成后，i 的值变为 6（因为循环终止条件是 i `<=` 5，当 i 变成 6 时循环结束）
3. setTimeout 中的回调函数是异步执行的，会被放入事件队列中
4. 当主线程代码（即循环）执行完毕后，才会执行事件队列中的回调函数
5. 此时 i 已经变成了 6，所有的回调函数都共享同一个全局的 i 变量
6. 因此，每个回调函数执行时打印的都是同一个 i 的值，即 6

这就是为什么输出是五个 6，而不是 1、2、3、4、5

如果就是要输入 1 2 3 4 5，该怎么办呢？

```js
// 解决方案一：立即执行函数表达式(IIFE)创建闭包
for (var i = 1; i <= 5; i++) {
  (function (i) {
    setTimeout(function () {
      console.log(i);
    }, 0);
  })(i);
}
```

1. 通过立即执行函数表达式(IIFE)为每次循环创建一个新的函数作用域
2. 将当前循环的 i 值作为参数传入 IIFE，在新的函数作用域中创建一个同名变量
3. 函数内部的 setTimeout 回调引用的是这个新的作用域中的 i，而不是全局的 i
4. 这样每个闭包都保存了当时传入的 i 值，形成了五个独立的执行环境
5. 因此会依次打印出 1、2、3、4、5

```js
// 解决方案二：使用 let 声明
for (let i = 1; i <= 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, 0);
}
```

解释：

1. 使用 let 声明的变量具有块级作用域
2. 在每次循环迭代中，let 声明会创建一个新的变量 i，并将其初始化为当前值
3. 每个 setTimeout 回调引用的是它们各自迭代中创建的 i 变量
4. 这样每个回调函数就会捕获并记住当时循环的 i 值
5. 结果依次打印出 1、2、3、4、5

```js
// 解决方案三：利用 setTimeout 的额外参数
for (var i = 1; i <= 5; i++) {
  setTimeout(
    function (i) {
      console.log(i);
    },
    0,
    i
  );
}
```

1. setTimeout 可以接受额外的参数，这些参数会传递给回调函数
2. 在调用 setTimeout 时，我们将当前的 i 值作为第三个参数传入
3. 当回调函数执行时，这个 i 值会作为参数传给回调函数
4. 这样回调函数使用的是参数 i，而不是外部作用域中的变量 i
5. 每个回调函数接收到的是调用 setTimeout 时那一刻的 i 值
6. 因此会依次打印出 1、2、3、4、5

## 2

```js
(function () {
  var x = (y = 1);
})();
var z;

console.log(y);
console.log(z);
console.log(x);
```

1

undefined

Uncaught ReferenceError: x is not defined

1. 立即执行函数表达式(IIFE)中的代码: var x = (y = 1)

   - 这里实际上是两个操作:
     a. y = 1: 没有使用 var/let/const 声明 y，所以 y 成为全局变量
     b. var x = y: x 使用 var 声明，所以 x 是 IIFE 函数内的局部变量

2. 变量作用域:

   - y: 没有声明关键字，默认挂载到全局对象(window/global)上，所以在函数外部可以访问
   - x: 使用 var 声明，作用域仅限于 IIFE 内部，外部无法访问
   - z: 使用 var 声明，是全局变量，但未赋值，所以为 undefined

3. 输出结果解释:
   - console.log(y)输出 1: y 是全局变量，值为 1
   - console.log(z)输出 undefined: z 声明了但未赋值
   - console.log(x)报错: x 在 IIFE 外不存在，所以抛出 ReferenceError

## 3

```js
var a, b;
(function () {
  console.log(a);
  console.log(b);
  var a = (b = 3);
  console.log(a);
  console.log(b);
})();
console.log(a);
console.log(b);
```

undefined

undefined

3

3

undefined

3

1. 全局作用域变量声明：

   - 代码开始执行时，`var a, b;` 在全局作用域声明了变量 a 和 b，此时它们的值都是 undefined

2. 立即执行函数(IIFE)内部：

   - 第一个 console.log(a)输出 undefined：

     - 这是因为函数内部有一个局部变量 a 的声明(var a)
     - 由于变量提升机制，var a 会提升到函数作用域顶部，但赋值不会提升
     - 所以此时 a 已声明但未赋值，值为 undefined

   - 第二个 console.log(b)输出 undefined：

     - 由于函数内部没有声明局部变量 b，因此访问的是全局作用域中的 b
     - 全局作用域中的 b 初始值为 undefined

   - 执行 `var a = (b = 3);` 这行代码：

     - 这行代码实际上可分解为：b = 3; var a = b;
     - b 没有使用 var 声明，所以它是对全局变量 b 的赋值
     - 而 a 使用 var 声明，所以它是局部变量

   - 第三个 console.log(a)输出 3：局部变量 a 已被赋值为 3
   - 第四个 console.log(b)输出 3：全局变量 b 已被赋值为 3

3. 函数执行完毕后，全局作用域：

   - console.log(a)输出 undefined：

     - 全局变量 a 没有被修改，仍然是初始值 undefined
     - 函数内部的 a 是局部变量，不影响全局 a

   - console.log(b)输出 3：
     - 全局变量 b 被函数内部的操作修改为 3
     - 因为函数内 b = 3 是不带 var 的赋值，操作的是全局变量

## 4

```js
var friendName = "World";
(function () {
  if (typeof friendName === "undefined") {
    var friendName = "Jack";
    console.log("Goodbye " + friendName);
  } else {
    console.log("Hello " + friendName);
  }
})();
```

Goodbye Jack

1. 首先在全局作用域中声明并初始化 friendName 为"World"
2. 然后定义并立即执行一个函数(IIFE)，创建了一个新的函数作用域
3. 由于 var 声明的变量存在变量提升，函数内部的 friendName 声明会被提升到函数作用域顶部
   但初始化不会被提升，相当于在函数开始处有：var friendName; (此时值为 undefined)
4. 所以 typeof friendName === "undefined"条件为 true
5. 执行 if 内的代码，初始化局部变量 friendName 为"Jack"，然后输出："Goodbye Jack"

## 5

```js
function fn1() {
  console.log("fn1");
}
var fn2;

fn1();
fn2();

fn2 = function () {
  console.log("fn2");
};

fn2();
```

fn1

Uncaught TypeError: fn2 is not a function

fn2

1. 变量提升和函数提升:

   - 函数声明 fn1() 会被完整提升到代码顶部，包括函数体
   - 变量声明 var fn2 只会提升声明部分，初始值为 undefined

2. 代码执行过程:

   - 执行 fn1() 时正常调用已定义的函数，输出 "fn1"
   - 执行 fn2() 时，fn2 仅被声明但未赋值函数，此时值为 undefined
   - 尝试调用 undefined 作为函数，导致 "Uncaught TypeError: fn2 is not a function"
   - 之后 fn2 被赋值为一个函数表达式
   - 最后调用 fn2() 正常执行，输出 "fn2"

3. 等价于执行以下代码:

```js
function fn1() {
  console.log("fn1");
}
var fn2 = undefined;

fn1(); // 正常调用
fn2(); // 错误：undefined 不是函数

fn2 = function () {
  console.log("fn2");
};
fn2(); // 正常调用
```

## 6

```js
// 第一段代码
function a() {
  var temp = 10;
  function b() {
    console.log(temp);
  }
  b();
}
a();

// 第二段代码
function a() {
  var temp = 10;
  b();
}
function b() {
  console.log(temp);
}
a();
```

第一段代码解释：

- 在函数 a 内部声明了变量 temp。
- 在 a 内部又声明了函数 b，b 是 a 的内部函数，形成了闭包。
- 在 b 内部可以访问 a 作用域中的变量 temp。
- 当调用 a() 时，a 内部的 b() 被执行，输出 10。
- 这是因为函数 b 的作用域链包含自身作用域、函数 a 的作用域和全局作用域。

第二段代码解释：

- 重新定义了函数 a，a 内部声明变量 temp，并调用了全局作用域中的函数 b。
- 函数 b 在全局作用域内定义，无法访问 a 作用域中的变量 temp。
- 当调用 a() 时，b() 执行时会报错：Uncaught ReferenceError: temp is not defined。
- 这是因为函数 b 的作用域链只包含自身作用域和全局作用域，不包含 a 的作用域，temp 不在这个链上。

## 7

```js
var a = 3;
function c() {
  console.log(a);
}
(function () {
  var a = 4;
  c();
})();
```

3

1. 全局作用域:

   - 声明并初始化全局变量 a = 3
   - 定义函数 c()，该函数在其函数体内引用变量 a

2. 函数 c() 的作用域:

   - 函数 c() 中没有声明局部变量 a
   - 当调用 c() 时，它会在自己的作用域链中查找变量 a
   - 如果自己的作用域中没有，会向上一级作用域(即全局作用域)查找

3. 自执行函数(IIFE):

   - 创建了一个新的作用域
   - 在这个作用域内声明并初始化了局部变量 a = 4
   - 调用函数 c()

4. 关键点:
   - 虽然在自执行函数内部 a 的值是 4，但函数 c() 并不是在这个作用域中定义的
   - 函数 c() 在定义时就已经形成了闭包，它的作用域链中包含了全局作用域
   - 因此，当在自执行函数内调用 c() 时，c() 内部的 console.log(a) 会访问全局作用域中的 a，即 3

## 8

```JS
function fun(n, o) {
  console.log(o);
  return {
    fun: function (m) {
      return fun(m, n);
    },
  };
}
var a = fun(0);
a.fun(1);
a.fun(2);
a.fun(3);
var b = fun(0).fun(1).fun(2).fun(3);
var c = fun(0).fun(1);
c.fun(2);
c.fun(3);
```

undefined // fun(0)

0 // a.fun(1)

0 // a.fun(2)

0 // a.fun(3)

undefined // fun(0)

0 // fun(0).fun(1)

1 // fun(0).fun(1).fun(2)

2 // fun(0).fun(1).fun(2).fun(3)

undefined // fun(0)

0 // fun(0).fun(1)

1 // c.fun(2)

1 // c.fun(3)

这个`fun`函数接收两个参数`n`和`o`：

- 先打印参数`o`的值
- 然后返回一个对象，该对象包含一个`fun`方法
- 返回的这个`fun`方法会调用外部的`fun`函数，并传入新参数`m`和闭包中保存的`n`

变量 a 的执行过程
var a = fun(0); // 调用 fun(0, undefined)，打印 undefined，返回对象
a.fun(1); // 调用 fun(1, 0)，打印 0
a.fun(2); // 调用 fun(2, 0)，打印 0
a.fun(3); // 调用 fun(3, 0)，打印 0

变量 b 的执行过程
var b = fun(0).fun(1).fun(2).fun(3);
拆解为：
fun(0) 打印 undefined，返回对象
.fun(1) 调用 fun(1, 0)，打印 0，返回新对象
.fun(2) 调用 fun(2, 1)，打印 1，返回新对象
.fun(3) 调用 fun(3, 2)，打印 2

变量 c 的执行过程
var c = fun(0).fun(1); // fun(0)打印 undefined，fun(1)打印 0，返回对象
c.fun(2); // 调用 fun(2, 1)，打印 1
c.fun(3); // 调用 fun(3, 1)，打印 1

## 9

```js
var f = function () {
  return true;
};
var g = function () {
  return false;
};
(function () {
  function g() {
    return true;
  }
  if (g() && [] == ![]) {
    f = function f() {
      return false;
    };
  }
})();
console.log(f());
```

false

这段代码通过立即执行函数（IIFE）改变了外部变量 f 的值。

由于函数作用域的覆盖，内部的 g() 返回 true，而 [] == ![] 这种类型转换结果也是 true，所以条件成立，f 被重新赋值为返回 false 的函数。

最终，console.log(f()) 输出的是 false。

## 10

```js
var a = 1;
function a() {}
console.log(a);
```

1

```js
// 提升阶段
function a() {} // 函数声明被完整提升
var a; // 变量声明被提升，但不包括赋值

// 执行阶段
a = 1; // 变量赋值覆盖了同名函数
console.log(a); // 输出: 1
```
