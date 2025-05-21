---
title: this输出题
sidebar_label: this-part1
description: JavaScript 与this相关的输出题
---

## 1

```js
function foo() {
  console.log(this.a);
}

function doFoo() {
  foo();
}

var obj = {
  a: 1,
  doFoo: doFoo,
};

var a = 2;
obj.doFoo();
```

2

执行 obj.doFoo()时：

虽然 doFoo 方法是通过 obj 调用的，但在 doFoo 内部，foo()是作为普通函数调用的，不是作为对象的方法

当 foo()被调用时，它的 this 指向全局对象，而不是 obj

所以 foo 内部的 console.log(this.a)会打印全局变量 a 的值，即 2

## 2

```js
var a = 10;
var obj = {
  a: 20,
  say: () => {
    console.log(this.a);
  },
};
obj.say();

var anotherObj = { a: 30 };
obj.say.apply(anotherObj);
```

10

10

箭头函数的关键特性是它不会创建自己的 this 上下文，而是继承定义时所在作用域的 this 值。

1. var a = 10 定义了一个全局变量 a
2. obj 对象中的 say 方法是一个箭头函数
3. 箭头函数中的 this 不指向调用它的对象，而是指向定义它时的上下文

在这个例子中：

- 箭头函数 say 是在全局作用域中定义的（作为对象字面量的一部分，但 this 绑定发生在定义时）
- 所以 say 中的 this 指向全局对象（浏览器中是 window，Node.js 中是 global）
- 因此 this.a 就是全局变量 a，值为 10

即使使用 apply 方法尝试改变 this 指向，箭头函数的 this 也不会改变，这是箭头函数的设计特性。
apply、call、bind 这些方法对箭头函数的 this 没有影响。

如果想要 this 指向调用对象，应该使用普通函数：

```js
obj = {
  a: 20,
  say: function () {
    console.log(this.a);
  },
};
```

这样才会输出 20 和 30

## 3

```js
var obj = {
  name: "cuggz",
  fun: function () {
    console.log(this.name);
  },
};
obj.fun();
new obj.fun();
```

cuggz

undefined

1.  obj.fun()：
    当以对象方法的形式调用函数时，this 绑定到该对象。
    此处 obj.fun()中的 this 指向 obj 对象，因此 this.name 为"cuggz"。

2.  new obj.fun()：
    当使用 new 操作符调用函数时，会发生以下步骤：

    - 创建一个全新的空对象
    - 将这个对象的原型指向构造函数的 prototype
    - 将 this 绑定到新创建的对象
    - 执行构造函数中的代码（this 指向新对象）
    - 如果函数没有返回对象，则返回 this

    重要说明：新创建的对象没有 name 属性的原因是：

    - "name"属性是定义在 obj 对象上的，不是定义在 fun 函数或其原型上
    - 当使用 new 操作符时，新创建的对象只会继承 fun.prototype 上的属性和方法
    - 新对象与 obj 对象完全独立，不会继承 obj 的任何属性
    - 新对象的 this 是一个全新的对象，它不包含 name 属性
    - 所以访问 this.name 时返回 undefined

    可以验证：如果在 fun 函数内部添加 this.name = "newName"，则 new obj.fun()会输出"newName"

this 的绑定规则优先级为：new 绑定 > 显式绑定(call/apply/bind) > 隐式绑定(对象方法) > 默认绑定(window/global/undefined)

## 4

```js
var obj = {
  say: function () {
    var f1 = () => {
      console.log("1111", this);
    };
    f1();
  },
  pro: {
    getPro: () => {
      console.log(this);
    },
  },
};
var o = obj.say;
o();
obj.say();
obj.pro.getPro();
```

1111 window 对象

1111 obj 对象

window 对象

1. var o = obj.say; o();
   这里将 obj.say 方法赋值给变量 o，然后直接调用 o()
   此时 say 函数中的 this 指向全局对象(window)
   因为 o() 是在全局环境下调用的，所以 say 函数内的 this 是 window
   而箭头函数 f1 不绑定自己的 this，它继承 say 函数的 this(即 window)
   所以输出 "1111 window 对象"

2. obj.say();
   这里是通过对象调用方法，say 函数中的 this 指向调用它的对象 obj
   箭头函数 f1 继承了外层 say 函数的 this(即 obj)
   所以输出 "1111 obj 对象"

3. obj.pro.getPro();
   getPro 是一个箭头函数，箭头函数的 this 在定义时就确定了，指向定义时所在作用域的 this
   getPro 定义在 obj.pro 对象中，但由于它是箭头函数，不会绑定到 obj.pro
   它会继承外部作用域的 this，而对象字面量不会创建新的作用域
   所以这个箭头函数中的 this 指向全局对象(window)
   因此输出 "window 对象"

## 5

```js
var myObject = {
  foo: "bar",
  func: function () {
    var self = this;
    console.log(this.foo);
    console.log(self.foo);
    (function () {
      console.log(this.foo);
      console.log(self.foo);
    })();
  },
};
myObject.func();
```

bar

bar

undefined

bar

1. console.log(this.foo) 输出 "bar"
   因为在 myObject.func() 调用中，func 方法内的 this 指向 myObject 对象
   所以 this.foo 就是 myObject.foo，值为 "bar"

2. console.log(self.foo) 输出 "bar"
   因为 self = this，而 this 指向 myObject，所以 self.foo 也是 "bar"

3. console.log(this.foo) 在立即执行函数内输出 undefined
   因为在普通函数调用中，this 默认指向全局对象(非严格模式下是 window/global)
   全局对象上没有 foo 属性，所以输出 undefined

4. console.log(self.foo) 在立即执行函数内输出 "bar"
   因为 self 变量是在外部函数作用域中定义的，通过闭包机制，内部函数可以访问它
   self 仍然引用着 myObject，所以 self.foo 是 "bar"

## 6

```js
window.number = 2;
var obj = {
  number: 3,
  db1: (function () {
    console.log(this);
    this.number *= 4;
    return function () {
      console.log(this);
      this.number *= 5;
    };
  })(),
};
var db1 = obj.db1;
db1();
obj.db1();
console.log(obj.number);
console.log(window.number);
```

winsow 对象

window 对象

obj 对象

15

40

1. 执行环境初始化:

   - 设置 window.number = 2
   - 创建对象 obj，其 number 属性为 3

2. IIFE (立即执行函数) 执行:

   - 由于是在全局作用域中调用的立即执行函数，this 指向 window
   - 第一个 console.log(this) 输出 window 对象
   - window.number 从 2 变为 8 (2\*4)
   - IIFE 返回一个函数，该函数被赋值给 obj.db1

3. 变量赋值: var db1 = obj.db1

   - 仅是函数引用的复制，不改变任何 this 绑定

4. 函数调用 db1():

   - 这是普通函数调用方式，this 指向全局对象 window
   - 第二个 console.log(this) 输出 window 对象
   - window.number 从 8 变为 40 (8\*5)

5. 方法调用 obj.db1():

   - 通过对象调用方法，this 指向调用该方法的对象 obj
   - 第三个 console.log(this) 输出 obj 对象
   - obj.number 从 3 变为 15 (3\*5)

## 7

```js
var length = 10;
function fn() {
  console.log(this.length);
}

var obj = {
  length: 5,
  method: function (fn) {
    fn();
    arguments[0]();
  },
};

obj.method(fn, 1);
```

10

2

第一个输出 10：

- 当执行 obj.method(fn, 1) 时，method 函数内部首先调用 fn()
- 此时的 fn 是普通函数调用，没有指定 this，所以在非严格模式下 this 指向全局对象 window
- window.length 的值是 10（全局变量 length），所以输出 10

第二个输出 2：

- 在 method 函数内部，第二次调用是 `arguments[0]()`
- 此时 fn 通过 arguments 对象调用，所以 this 指向 arguments 对象
- arguments 对象是类数组对象，它的 length 属性表示参数的个数
- obj.method(fn, 1) 传入了两个参数，所以 arguments.length 为 2，因此输出 2

## 8

```js
var a = 1;
function printA() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: printA,
  bar: function () {
    printA();
  },
};

obj.foo();

obj.bar();

var foo = obj.foo;
foo();
```

2

1

1

- obj.foo(); 当函数作为对象的方法调用时，this 指向该对象，所以 this.a 为 obj.a，即 2
- obj.bar();在 bar 函数内部，printA 是作为普通函数调用的，此时 this 指向全局对象（非严格模式下），因此 this.a 为全局变量 a，即 1
- foo(); 将 obj.foo 赋值给变量 foo 后，foo 成为了一个普通函数，调用时 this 指向全局对象，因此 this.a 为全局变量 a，即 1,这就是所谓的 this 隐式丢失问题，当方法被赋值给变量后，this 的指向会改变

## 9

```js
var x = 3;
var y = 4;
var obj = {
  x: 1,
  y: 6,
  getX: function () {
    var x = 5;
    return (function () {
      return this.x;
    })();
  },
  getY: function () {
    var y = 7;
    return this.y;
  },
};
console.log(obj.getX());
console.log(obj.getY());
```

3

6

1. obj.getX()的执行过程：

   - 首先进入 getX 函数，创建局部变量 x = 5
   - 然后执行一个立即调用的函数表达式(IIFE)
   - 在这个 IIFE 中，this 指向的是全局对象(非严格模式下)
   - 在浏览器环境中，全局对象是 window，this.x 引用的是全局变量 x = 3
   - 因此返回值是 3
   - 注意：IIFE 内部的 this 与外层函数的 this 无关，因为函数调用方式决定了 this 的指向

2. obj.getY()的执行过程：

   - 进入 getY 函数，创建局部变量 y = 7
   - 在该函数中，this 指向调用该函数的对象 obj
   - this.y 引用的是 obj.y = 6
   - 因此返回值是 6
   - 注意：局部变量 y 不会影响 this.y 的值

3. this 指向规则：
   - 对象方法调用时，this 指向该对象（如 obj.getY()中的 this 指向 obj）
   - 普通函数调用时，this 指向全局对象（如 IIFE 中的 this 指向全局对象）
   - 箭头函数没有自己的 this，继承外层作用域的 this

## 10

```js
var a = 10;
var obt = {
  a: 20,
  fn: function () {
    var a = 30;
    console.log(this.a);
  },
};
obt.fn();
obt.fn.call();
obt.fn();
```

20

10

20

1. obt.fn()：

   - 这里 fn 作为对象 obt 的方法被调用
   - 此时 fn 中的 this 指向 obt 对象
   - 因此 this.a 等于 obt.a，也就是 20

2. obt.fn.call()：

   - call() 方法可以改变函数执行时的 this 指向
   - 当 call() 不传入参数时，非严格模式下 this 会指向全局对象(window/global)
   - 因此 this.a 等于全局变量 a，也就是 10

3. obt.fn()：
   - 这里又回到了正常调用方式
   - fn 中的 this 重新指向 obt 对象
   - 所以 this.a 再次等于 20

注意：函数内部的局部变量 var a = 30 在所有情况下都不会被访问到，
因为 this.a 是访问 this 对象上的属性 a，而不是函数内的局部变量。
