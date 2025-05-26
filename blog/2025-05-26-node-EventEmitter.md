---
slug: node-event-emitter
title: Node.js EventEmitter：事件驱动编程的核心
authors: [fangzhijie]
tags: [node.js, javascript]
---

# Node.js EventEmitter：事件驱动编程的核心

EventEmitter 是 Node.js 中最重要的核心模块之一，它是 Node.js 事件驱动架构的基础。许多 Node.js 的核心 API 都是基于 EventEmitter 构建的，比如 HTTP 服务器、文件流、子进程等。

<!-- truncate -->

## 什么是 EventEmitter？

EventEmitter 是一个实现了观察者模式的类，允许对象监听和触发事件。它提供了一种优雅的方式来处理异步事件和回调。

```javascript
const EventEmitter = require("events");

// 创建一个 EventEmitter 实例
const myEmitter = new EventEmitter();

// 监听事件
myEmitter.on("hello", () => {
  console.log("Hello World!");
});

// 触发事件
myEmitter.emit("hello"); // 输出: Hello World!
```

## 基本用法

### 1. 监听事件

使用 `on()` 或 `addListener()` 方法来监听事件：

```javascript
const EventEmitter = require("events");
const emitter = new EventEmitter();

// 方式1：使用 on
emitter.on("data", (data) => {
  console.log("接收到数据:", data);
});

// 方式2：使用 addListener（功能相同）
emitter.addListener("error", (err) => {
  console.error("发生错误:", err);
});
```

### 2. 触发事件

使用 `emit()` 方法触发事件：

```javascript
// 触发事件并传递参数
emitter.emit("data", { id: 1, name: "Node.js" });
emitter.emit("error", new Error("Something went wrong"));
```

### 3. 一次性监听

使用 `once()` 方法监听只会触发一次的事件：

```javascript
emitter.once("start", () => {
  console.log("应用启动完成");
});

emitter.emit("start"); // 输出: 应用启动完成
emitter.emit("start"); // 不会再次输出
```

## 高级特性

### 1. 移除监听器

```javascript
const callback = (data) => {
  console.log("处理数据:", data);
};

// 添加监听器
emitter.on("process", callback);

// 移除特定监听器
emitter.removeListener("process", callback);

// 移除所有监听器
emitter.removeAllListeners("process");

// 移除所有事件的所有监听器
emitter.removeAllListeners();
```

### 2. 获取监听器信息

```javascript
// 获取监听器数量
console.log(emitter.listenerCount("data"));

// 获取所有监听器
console.log(emitter.listeners("data"));

// 获取所有事件名称
console.log(emitter.eventNames());
```

### 3. 设置最大监听器数量

默认情况下，EventEmitter 对单个事件最多允许 10 个监听器：

```javascript
// 设置最大监听器数量
emitter.setMaxListeners(20);

// 获取当前最大监听器数量
console.log(emitter.getMaxListeners());
```

## 继承 EventEmitter

通过继承 EventEmitter，可以创建自定义的事件驱动类：

```javascript
const EventEmitter = require("events");

class MyClass extends EventEmitter {
  constructor() {
    super();
    this.name = "MyClass";
  }

  doSomething() {
    // 执行一些操作
    console.log("执行操作中...");

    // 触发事件
    this.emit("done", { message: "操作完成" });
  }

  start() {
    this.emit("start");
    setTimeout(() => {
      this.doSomething();
    }, 1000);
  }
}

// 使用自定义类
const myInstance = new MyClass();

myInstance.on("start", () => {
  console.log("开始执行");
});

myInstance.on("done", (result) => {
  console.log("结果:", result);
});

myInstance.start();
```

## 实际应用场景

### 1. 文件处理器

```javascript
const EventEmitter = require("events");
const fs = require("fs");

class FileProcessor extends EventEmitter {
  processFile(filePath) {
    this.emit("start", filePath);

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        this.emit("error", err);
        return;
      }

      // 处理文件内容
      const lines = data.split("\n");
      this.emit("progress", lines.length);

      // 模拟处理过程
      setTimeout(() => {
        this.emit("complete", { lines: lines.length, size: data.length });
      }, 100);
    });
  }
}

// 使用文件处理器
const processor = new FileProcessor();

processor.on("start", (filePath) => {
  console.log(`开始处理文件: ${filePath}`);
});

processor.on("progress", (lines) => {
  console.log(`文件包含 ${lines} 行`);
});

processor.on("complete", (result) => {
  console.log(`处理完成: ${result.lines} 行, ${result.size} 字节`);
});

processor.on("error", (err) => {
  console.error("处理错误:", err.message);
});

// processor.processFile('./example.txt');
```

### 2. 简单的聊天系统

```javascript
const EventEmitter = require("events");

class ChatRoom extends EventEmitter {
  constructor() {
    super();
    this.users = new Map();
  }

  addUser(id, name) {
    this.users.set(id, name);
    this.emit("userJoined", { id, name });
  }

  removeUser(id) {
    const name = this.users.get(id);
    this.users.delete(id);
    this.emit("userLeft", { id, name });
  }

  sendMessage(userId, message) {
    const userName = this.users.get(userId);
    if (userName) {
      this.emit("message", {
        userId,
        userName,
        message,
        timestamp: new Date(),
      });
    }
  }
}

// 使用聊天室
const chatRoom = new ChatRoom();

chatRoom.on("userJoined", (user) => {
  console.log(`${user.name} 加入了聊天室`);
});

chatRoom.on("userLeft", (user) => {
  console.log(`${user.name} 离开了聊天室`);
});

chatRoom.on("message", (msg) => {
  console.log(
    `[${msg.timestamp.toLocaleTimeString()}] ${msg.userName}: ${msg.message}`
  );
});

// 模拟使用
chatRoom.addUser(1, "Alice");
chatRoom.addUser(2, "Bob");
chatRoom.sendMessage(1, "Hello everyone!");
chatRoom.sendMessage(2, "Hi Alice!");
chatRoom.removeUser(1);
```

## 错误处理

EventEmitter 有一个特殊的 'error' 事件。如果触发了 'error' 事件但没有监听器，Node.js 会抛出异常：

```javascript
const emitter = new EventEmitter();

// 正确的错误处理
emitter.on("error", (err) => {
  console.error("捕获到错误:", err.message);
});

// 安全地触发错误事件
emitter.emit("error", new Error("Something went wrong"));

// 如果没有错误监听器，这会导致程序崩溃
// emitter.emit('error', new Error('Uncaught error'));
```

## 性能注意事项

1. **避免内存泄漏**：记得移除不再需要的监听器
2. **监听器数量限制**：默认最多 10 个监听器，超过会有警告
3. **同步 vs 异步**：EventEmitter 的事件是同步触发的

```javascript
const emitter = new EventEmitter();

emitter.on("test", () => {
  console.log("监听器 1");
});

emitter.on("test", () => {
  console.log("监听器 2");
});

console.log("触发前");
emitter.emit("test");
console.log("触发后");

// 输出顺序:
// 触发前
// 监听器 1
// 监听器 2
// 触发后
```

## EventEmitter 的简单实现

```js
class EventEmitter {
  constructor() {
    // 存储事件和对应的监听器
    this.events = {};
  }

  /**
   * 添加事件监听器
   * @param {string} eventName 事件名称
   * @param {function} listener 监听器函数
   */
  on(eventName, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("监听器必须是一个函数");
    }

    // 如果事件不存在，创建一个空数组
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    // 添加监听器到数组中
    this.events[eventName].push(listener);

    return this; // 支持链式调用
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {...any} args 传递给监听器的参数
   */
  emit(eventName, ...args) {
    // 如果事件不存在，直接返回
    if (!this.events[eventName]) {
      return this;
    }

    // 创建监听器数组的副本，防止在执行过程中数组被修改
    const listeners = [...this.events[eventName]];

    // 依次执行所有监听器
    listeners.forEach((listener) => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`事件 "${eventName}" 的监听器执行出错:`, error);
      }
    });

    return this; // 支持链式调用
  }

  /**
   * 移除事件监听器
   * @param {string} eventName 事件名称
   * @param {function} listener 要移除的监听器函数
   */
  off(eventName, listener) {
    if (!this.events[eventName]) {
      return this;
    }

    if (typeof listener !== "function") {
      // 如果没有提供监听器，移除该事件的所有监听器
      delete this.events[eventName];
      return this;
    }

    // 找到并移除指定的监听器
    const index = this.events[eventName].indexOf(listener);
    if (index !== -1) {
      this.events[eventName].splice(index, 1);
    }

    // 如果该事件没有监听器了，删除该事件
    if (this.events[eventName].length === 0) {
      delete this.events[eventName];
    }

    return this;
  }

  /**
   * 添加一次性事件监听器
   * @param {string} eventName 事件名称
   * @param {function} listener 监听器函数
   */
  once(eventName, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("监听器必须是一个函数");
    }

    // 创建一个包装函数，执行一次后自动移除
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(eventName, onceWrapper);
    };

    // 保存原始监听器的引用，用于移除
    onceWrapper.originalListener = listener;

    this.on(eventName, onceWrapper);

    return this;
  }

  /**
   * 移除所有监听器或指定事件的所有监听器
   * @param {string} eventName 可选，事件名称
   */
  removeAllListeners(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }

    return this;
  }

  /**
   * 获取指定事件的监听器列表
   * @param {string} eventName 事件名称
   * @returns {function[]} 监听器数组
   */
  listeners(eventName) {
    return this.events[eventName] ? [...this.events[eventName]] : [];
  }

  /**
   * 获取指定事件的监听器数量
   * @param {string} eventName 事件名称
   * @returns {number} 监听器数量
   */
  listenerCount(eventName) {
    return this.events[eventName] ? this.events[eventName].length : 0;
  }

  /**
   * 获取所有事件名称
   * @returns {string[]} 事件名称数组
   */
  eventNames() {
    return Object.keys(this.events);
  }

  /**
   * 在指定事件前添加监听器
   * @param {string} eventName 事件名称
   * @param {function} listener 监听器函数
   */
  prependListener(eventName, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("监听器必须是一个函数");
    }

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].unshift(listener);

    return this;
  }

  /**
   * 在指定事件前添加一次性监听器
   * @param {string} eventName 事件名称
   * @param {function} listener 监听器函数
   */
  prependOnceListener(eventName, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("监听器必须是一个函数");
    }

    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(eventName, onceWrapper);
    };

    onceWrapper.originalListener = listener;

    this.prependListener(eventName, onceWrapper);

    return this;
  }
}

// 导出EventEmitter类
module.exports = EventEmitter;

// 如果在浏览器环境中运行，也可以使用以下方式导出
if (typeof window !== "undefined") {
  window.EventEmitter = EventEmitter;
}
```

test.js

```js
const EventEmitter = require("./EventEmitter");

// 创建EventEmitter实例
const emitter = new EventEmitter();

console.log("=== EventEmitter 测试 ===\n");

// 测试基本的on和emit功能
console.log("1. 测试基本的on和emit功能:");
emitter.on("test", (message) => {
  console.log(`收到消息: ${message}`);
});

emitter.emit("test", "Hello World!");

// 测试多个监听器
console.log("\n2. 测试多个监听器:");
emitter.on("multi", () => console.log("监听器1"));
emitter.on("multi", () => console.log("监听器2"));
emitter.on("multi", () => console.log("监听器3"));

emitter.emit("multi");

// 测试once功能
console.log("\n3. 测试once功能:");
emitter.once("onceTest", () => console.log("这个只会执行一次"));

emitter.emit("onceTest");
emitter.emit("onceTest"); // 这次不会执行

// 测试off功能
console.log("\n4. 测试off功能:");
const handler = () => console.log("这个会被移除");
emitter.on("removeTest", handler);
emitter.emit("removeTest"); // 会执行

emitter.off("removeTest", handler);
emitter.emit("removeTest"); // 不会执行

// 测试链式调用
console.log("\n5. 测试链式调用:");
emitter
  .on("chain1", () => console.log("链式调用1"))
  .on("chain2", () => console.log("链式调用2"))
  .emit("chain1")
  .emit("chain2");

// 测试监听器数量和事件名称
console.log("\n6. 测试统计功能:");
console.log(`multi事件监听器数量: ${emitter.listenerCount("multi")}`);
console.log(`所有事件名称: ${emitter.eventNames().join(", ")}`);

// 测试removeAllListeners
console.log("\n7. 测试removeAllListeners:");
console.log(`清理前事件数量: ${emitter.eventNames().length}`);
emitter.removeAllListeners();
console.log(`清理后事件数量: ${emitter.eventNames().length}`);

console.log("\n=== 测试完成 ===");
```
