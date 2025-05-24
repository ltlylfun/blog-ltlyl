---
title: 原型&继承输出题
sidebar_label: 原型&继承part1
description: JavaScript 与原型&继承相关的输出题
---

## 1

```js
function Foo() {
  getName = function () {
    console.log(1);
  };
  return this;
}

Foo.getName = function () {
  console.log(2);
};

Foo.prototype.getName = function () {
  console.log(3);
};

var getName = function () {
  console.log(4);
};

function getName() {
  console.log(5);
}

Foo.getName();

getName();

Foo().getName();

getName();

new Foo.getName();

new Foo().getName();

new new Foo().getName();
```

2

4

1

1

2

3

3

第一行 Foo.getName(); 结果为 2
解释：直接访问 Foo 函数对象上定义的静态方法。
类似于类的静态方法，直接通过类名调用，与实例无关。

第二行 getName(); 结果为 4
解释：

1. 虽然有函数声明 function getName(){console.log(5)}
2. 但被 var getName = function(){console.log(4)} 覆盖
3. 这说明函数表达式的赋值会覆盖函数声明

第三行 Foo().getName(); 结果为 1
解释：

1. Foo() 执行后，里面的代码将全局 getName 重新赋值为 function(){console.log(1)}
2. Foo() 返回 this，在非严格模式下指向全局对象(浏览器中是 window，Node.js 中是 global)
3. window.getName() 调用的是全局的 getName 函数，输出 1
   注意：这里没有调用原型上的方法，而是调用了全局对象上的方法

第四行 getName(); 结果为 1
解释：由于第三行已经修改了全局 getName 函数，所以输出 1

第五行 new Foo.getName(); 结果为 2
解释：

1. 运算符优先级: 成员访问(.) 优先级(19)高于 new 操作符(带参数列表)(18)
2. 相当于 new (Foo.getName)()
3. 先获取 Foo.getName 函数对象(值为 function(){console.log(2)})
4. 然后用 new 操作符创建这个函数的实例，同时执行这个函数，输出 2

第六行 new Foo().getName(); 结果为 3
解释：

1. 这里的 new Foo() 优先级高是因为使用了括号 () 来提高优先级
2. 相当于 (new Foo()).getName()
3. 先 new Foo() 创建 Foo 实例
4. 然后在这个实例上查找 getName 方法，实例本身没有，查找原型
5. 在 Foo.prototype 上找到 getName 方法并调用，输出 3

第七行 new new Foo().getName(); 结果为 3
解释：

1. 根据运算符优先级规则: 从左到右计算 new 操作符
2. 相当于 new ((new Foo()).getName)()
3. 先执行 new Foo() 创建 Foo 实例
4. 获取实例上的 getName 方法(来自原型)，返回函数 function(){console.log(3)}
5. 然后将这个函数作为构造函数再次使用 new 操作符创建实例
6. 在创建过程中执行这个函数，输出 3

## 2

```js
var F = function () {};
Object.prototype.a = function () {
  console.log("a");
};
Function.prototype.b = function () {
  console.log("b");
};
var f = new F();
f.a();
f.b();
F.a();
F.b();
```

a

Uncaught TypeError: f.b is not a function

a

b

1. f.a() 输出 "a"
   - f 是 F 的实例对象
   - f 本身没有 a 方法
   - JavaScript 会沿着原型链查找：f.**proto** === F.prototype
   - F.prototype 上也没有 a 方法
   - 继续查找：F.prototype.**proto** === Object.prototype
   - 在 Object.prototype 上找到了 a 方法，执行并输出 "a"
2. f.b() 报错：TypeError: f.b is not a function
   - f 是 F 的实例对象
   - f 本身没有 b 方法
   - 沿着原型链查找：f.**proto** === F.prototype
   - F.prototype 上没有 b 方法
   - 继续查找：F.prototype.**proto** === Object.prototype
   - Object.prototype 上也没有 b 方法
   - 原型链查找结束（Object.prototype.**proto** === null）
   - 找不到 b 方法，因此抛出 TypeError
   - 注意：虽然 Function.prototype 上有 b 方法，但 f 的原型链上并不包含 Function.prototype
3. F.a() 输出 "a"
   - F 是一个函数对象
   - F 本身没有 a 方法
   - JavaScript 会沿着原型链查找：F.**proto** === Function.prototype
   - Function.prototype 上没有 a 方法
   - 继续查找：Function.prototype.**proto** === Object.prototype
   - 在 Object.prototype 上找到了 a 方法，执行并输出 "a"
4. F.b() 输出 "b"
   - F 是一个函数对象
   - F 本身没有 b 方法
   - JavaScript 会沿着原型链查找：F.**proto** === Function.prototype
   - 在 Function.prototype 上找到了 b 方法，执行并输出 "b"

原型链关系图：
Object.prototype.**proto** === null
Function.prototype.**proto** === Object.prototype
F.**proto** === Function.prototype
f.**proto** === F.prototype
F.prototype.**proto** === Object.prototype

重要概念：

1. 所有函数对象都是由 Function 构造的，所以它们的 **proto** 都指向 Function.prototype
2. 所有普通对象的原型链最终都指向 Object.prototype
3. 函数的实例对象不会继承 Function.prototype 上的方法，而是继承该函数的 prototype 属性

## 3

```js
function Foo() {
  Foo.a = function () {
    console.log(1);
  };
  this.a = function () {
    console.log(2);
  };
}

Foo.prototype.a = function () {
  console.log(3);
};

Foo.a = function () {
  console.log(4);
};

Foo.a();
let obj = new Foo();
obj.a();
Foo.a();
```

4

2

1

Foo.a(); //输出 4

- 这时直接调用 Foo 函数对象上的静态方法 a
- 由于此时 Foo 对象上的 a 方法是最后定义的那个(输出 4 的版本)
- 所以输出结果是 4

let obj = new Foo();

- 创建 Foo 的实例，执行构造函数体内的代码
- 构造函数内部重新定义了 Foo.a(变成输出 1 的版本)
- 并给 obj 实例添加了自己的 a 方法(输出 2 的版本)

obj.a(); //输出 2

- 调用 obj 实例上的 a 方法
- 由于实例对象本身有 a 方法，不需要查找原型链
- 所以调用的是构造函数中 this.a 定义的方法，输出 2
- 原型上的 a 方法(输出 3)被实例方法覆盖，不会被调用

Foo.a(); //输出 1

- 再次调用 Foo 上的静态方法 a
- 由于在实例化过程中，Foo.a 已被重新定义为输出 1 的函数
- 所以这次输出结果是 1

## 4

```js
function Dog() {
  this.name = "puppy";
}

Dog.prototype.bark = () => {
  console.log("woof!woof!");
};

const dog = new Dog(); // 创建实例

console.log(
  Dog.prototype.constructor === Dog &&
    dog.constructor === Dog &&
    dog instanceof Dog
);
```

true

1. Dog.prototype.constructor === Dog

   - 每个函数被创建时，会自动有一个 prototype 属性，这个属性是一个对象
   - 这个 prototype 对象自动获得 constructor 属性，指回该函数

2. dog.constructor === Dog

   - 当使用 new 操作符创建 dog 实例时，dog 对象内部的[[Prototype]]指向 Dog.prototype
   - dog 自身没有 constructor 属性，所以会沿着原型链查找，找到 Dog.prototype 上的 constructor

3. dog instanceof Dog
   - instanceof 运算符检查 Dog.prototype 是否在 dog 的原型链上
   - 因为 dog 的[[Prototype]]直接指向 Dog.prototype，所以结果为 true

## 5

```js
var A = { n: 4399 };
var B = function () {
  this.n = 9999;
};
var C = function () {
  var n = 8888;
};
B.prototype = A;
C.prototype = A;
var b = new B();
var c = new C();
A.n++;
console.log(b.n);
console.log(c.n);
```

9999

4400

1. 首先创建一个对象 A，其属性 n 值为 4399
2. 定义构造函数 B，当使用 new 调用时，会将 this.n 设置为 9999
3. 定义构造函数 C，其中有一个局部变量 n=8888，但这是函数作用域内的变量，不会成为实例属性
4. 将 A 设置为 B 的原型，即 B.prototype = A
5. 将 A 设置为 C 的原型，即 C.prototype = A
6. 使用 new B()创建实例 b，此时执行 B 函数，b.n 被设置为 9999
7. 使用 new C()创建实例 c，此时执行 C 函数，但 C 内部只有一个局部变量，没有给实例添加任何属性
8. A.n++执行后，A.n 变为 4400

关于输出结果：

- console.log(b.n)输出 9999：因为 b 实例自身有 n 属性，值为 9999
- console.log(c.n)输出 4400：因为 c 实例自身没有 n 属性，所以会沿着原型链查找，找到了 c.**proto**(即 A).n，值为 4400

## 6

```js
function A() {}
function B(a) {
  this.a = a;
}
function C(a) {
  if (a) {
    this.a = a;
  }
}
A.prototype.a = 1;
B.prototype.a = 1;
C.prototype.a = 1;

console.log(new A().a);
console.log(new B().a);
console.log(new C(2).a);
```

1

undefined

2

1. 构造函数 A():

   - 没有给实例设置任何属性
   - 当创建 new A() 实例时，实例本身没有 a 属性
   - 因此 new A().a 会沿着原型链查找，找到 A.prototype.a = 1

2. 构造函数 B(a):

   - 接受一个参数 a 并将其赋值给实例的 a 属性
   - 当调用 new B() 没有传参时，this.a 被赋值为 undefined
   - 实例上有 a 属性(值为 undefined)，不会继续查找原型链
   - 所以 new B().a 输出 undefined

3. 构造函数 C(a):

   - 只有当参数 a 存在(truthy)时，才会设置实例的 a 属性
   - new C(2) 传入了值 2，满足条件，实例设置了 a=2
   - 因此 new C(2).a 直接返回实例上的属性值 2
   - 如果调用 new C() 或 new C(0)，实例不会有 a 属性，会返回原型上的 a=1

4. 属性查找顺序:
   - JavaScript 总是先查找实例自身的属性
   - 如果实例没有该属性，则沿着原型链向上查找
   - 只有当实例自身没有该属性时，才会使用原型上的属性

## 7

```js
function Parent() {
  this.a = 1;
  this.b = [1, 2, this.a];
  this.c = { demo: 5 };
  this.show = function () {
    console.log(this.a, this.b, this.c.demo);
  };
}

function Child() {
  this.a = 2;
  this.change = function () {
    this.b.push(this.a);
    this.a = this.b.length;
    this.c.demo = this.a++;
  };
}

Child.prototype = new Parent();
var parent = new Parent();
var child1 = new Child();
var child2 = new Child();
child1.a = 11;
child2.a = 12;
parent.show(); //1 [ 1, 2, 1 ] 5
child1.show(); //11 [ 1, 2, 1 ] 5
child2.show(); //12 [ 1, 2, 1 ] 5
child1.change();
child2.change();
parent.show(); //1 [ 1, 2, 1 ] 5
child1.show(); //5 [ 1, 2, 1, 11, 12 ] 5
child2.show(); //6 [ 1, 2, 1, 11, 12 ] 5
```

parent.show() 输出: 1 [1,2,1] 5

- parent.a = 1
- parent.b = [1,2,1]
- parent.c.demo = 5

child1.show() 输出: 11 [1,2,1] 5

- child1.a = 11 (自身属性，被重新赋值)
- child1.b = [1,2,1] (继承自 Parent 实例的引用类型属性)
- child1.c.demo = 5 (继承自 Parent 实例的引用类型属性)

child2.show() 输出: 12 [1,2,1] 5

- child2.a = 12 (自身属性，被重新赋值)
- child2.b = [1,2,1] (与 child1 共享同一个 b 数组，来自原型)
- child2.c.demo = 5 (与 child1 共享同一个 c 对象，来自原型)

child1.change() 执行:

- this.b.push(this.a) → [1,2,1,11]
- this.a = this.b.length → 4
- this.c.demo = this.a++ → 4 (this.a 变为 5)

child2.change() 执行:

- this.b.push(this.a) → [1,2,1,11,12]
- this.a = this.b.length → 5
- this.c.demo = this.a++ → 5 (this.a 变为 6)

parent.show() 输出: 1 [1,2,1] 5

- parent 的属性没有受到 child1/child2 操作的影响

child1.show() 输出: 5 [1,2,1,11,12] 5

- child1.a = 5
- child1.b = [1,2,1,11,12] (引用类型，被 child1 和 child2 共同修改)
- child1.c.demo = 5 (被 child2.change() 最后设置的值)

child2.show() 输出: 6 [1,2,1,11,12] 5

- child2.a = 6
- child2.b = [1,2,1,11,12] (与 child1 共享)
- child2.c.demo = 5 (与 child1 共享)

## 8

```js
function SuperType() {
  this.property = true; // 父类定义一个属性
}

SuperType.prototype.getSuperValue = function () {
  return this.property; // 父类原型上定义一个方法
};

function SubType() {
  this.subproperty = false; // 子类定义自己的属性
}

// 关键点：子类原型指向父类实例，建立原型链
SubType.prototype = new SuperType();
// 由于重写了原型对象，所以要在重写后添加子类的原型方法
SubType.prototype.getSubValue = function () {
  return this.subproperty;
};

var instance = new SubType(); // 创建子类实例
console.log(instance.getSuperValue()); // 输出: true
// 子类实例可以访问父类方法，是通过原型链查找实现的
console.log(instance.getSubValue()); // 输出: false
// 子类实例可以访问子类方法
```
