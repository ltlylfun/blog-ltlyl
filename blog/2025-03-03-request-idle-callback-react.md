---
slug: request-idle-callback-react
title: requestIdleCallback 与 React 的调度策略
authors: [fangzhijie]
tags: [javascript, react]
---

# 深入理解 requestIdleCallback 与 React 的调度策略

`requestIdleCallback` 作为浏览器提供的一个强大 API，能够帮助我们在浏览器空闲时执行任务。然而，React 却选择了自己实现调度器而不是直接使用这个 API。

<!-- truncate -->

## 什么是 requestIdleCallback

`requestIdleCallback` 是浏览器提供的一个 API，它允许开发者在浏览器空闲期间执行低优先级的任务，而不会影响关键的渲染和用户交互。

### 基本语法

```javascript
const callbackId = requestIdleCallback(callback, options);
```

- `callback`: 在空闲时期执行的函数
- `options`: 可选参数，包含 `timeout` 属性
- 返回值: 可用于取消回调的 ID

### 简单示例

```javascript
function doWork(deadline) {
  console.log(`剩余时间: ${deadline.timeRemaining()}ms`);

  // 检查是否还有剩余时间
  while (deadline.timeRemaining() > 0) {
    // 执行一些工作
    performUnitOfWork();
  }

  // 如果还有工作要做，安排下一次空闲回调
  if (hasMoreWork()) {
    requestIdleCallback(doWork);
  }
}

requestIdleCallback(doWork);
```

## requestIdleCallback 的工作原理

### 浏览器的帧渲染周期

为了理解 `requestIdleCallback`，我们需要先了解浏览器的渲染周期：

```
一帧 (16.67ms @ 60fps)
├── 输入事件处理（Input）
├── requestAnimationFrame 回调（rAF）
├── JavaScript 执行（含事件处理和同步 DOM 操作）
├── 样式计算（Style）
├── 布局（Layout / Reflow）
├── 分层 & 绘制（Paint）
├── 合成（Composite / Raster / Commit）
└── 空闲时间（Idle） ← requestIdleCallback 在这里执行
```

### 空闲时间的计算

```javascript
function demonstrateIdleTime() {
  requestIdleCallback(function (deadline) {
    console.log("空闲时间:", deadline.timeRemaining());
    console.log("是否超时:", deadline.didTimeout);

    // 模拟一些工作
    const startTime = performance.now();
    while (performance.now() - startTime < 5) {
      // 执行 5ms 的工作
    }

    // 检查剩余时间
    console.log("工作后剩余时间:", deadline.timeRemaining());
  });
}
```

## 实际应用场景

### 1. 大数据渲染优化

```javascript
function renderLargeList(items) {
  let index = 0;

  function renderChunk(deadline) {
    // 在空闲时间内渲染尽可能多的项目
    while (deadline.timeRemaining() > 0 && index < items.length) {
      const item = items[index];
      const element = createListItem(item);
      document.getElementById("list").appendChild(element);
      index++;
    }

    // 如果还有项目要渲染，继续
    if (index < items.length) {
      requestIdleCallback(renderChunk);
    }
  }

  requestIdleCallback(renderChunk);
}

function createListItem(item) {
  const div = document.createElement("div");
  div.textContent = item.name;
  div.className = "list-item";
  return div;
}
```

### 2. 数据预加载

```javascript
class DataPreloader {
  constructor() {
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  addToPreloadQueue(url) {
    this.preloadQueue.push(url);
    this.startPreloading();
  }

  startPreloading() {
    if (this.isPreloading) return;
    this.isPreloading = true;

    requestIdleCallback((deadline) => {
      this.preloadData(deadline);
    });
  }

  preloadData(deadline) {
    while (deadline.timeRemaining() > 0 && this.preloadQueue.length > 0) {
      const url = this.preloadQueue.shift();

      // 预加载数据（非阻塞）
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          // 缓存数据
          this.cacheData(url, data);
        });
    }

    // 如果队列中还有项目，继续预加载
    if (this.preloadQueue.length > 0) {
      requestIdleCallback((deadline) => {
        this.preloadData(deadline);
      });
    } else {
      this.isPreloading = false;
    }
  }

  cacheData(url, data) {
    localStorage.setItem(`cache_${url}`, JSON.stringify(data));
  }
}
```

### 3. 性能监控和分析

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.startMonitoring();
  }

  startMonitoring() {
    requestIdleCallback((deadline) => {
      this.collectMetrics(deadline);
    });
  }

  collectMetrics(deadline) {
    // 在空闲时间收集性能指标
    while (deadline.timeRemaining() > 1) {
      // 保留 1ms 缓冲
      const metric = {
        timestamp: Date.now(),
        memory: performance.memory ? performance.memory.usedJSHeapSize : null,
        timing: performance.timing,
        navigation: performance.navigation,
      };

      this.metrics.push(metric);

      // 如果收集了足够的数据，发送到服务器
      if (this.metrics.length >= 100) {
        this.sendMetricsToServer();
        break;
      }
    }

    // 继续监控
    requestIdleCallback((deadline) => {
      this.collectMetrics(deadline);
    });
  }

  sendMetricsToServer() {
    fetch("/api/metrics", {
      method: "POST",
      body: JSON.stringify(this.metrics),
      headers: { "Content-Type": "application/json" },
    });
    this.metrics = [];
  }
}
```

## React 为什么不直接使用 requestIdleCallback

尽管 `requestIdleCallback` 看起来很适合 React 的并发特性，但 React 团队选择了自己实现调度器。原因包括：

### 1. 浏览器兼容性问题

```javascript
// requestIdleCallback 的兼容性检查
function checkIdleCallbackSupport() {
  if ("requestIdleCallback" in window) {
    console.log("支持 requestIdleCallback");
  } else {
    console.log("不支持 requestIdleCallback，需要 polyfill");
    // Safari 和某些移动浏览器不支持
  }
}

// React 的解决方案：使用 MessageChannel 实现
function createScheduler() {
  const channel = new MessageChannel();
  const port1 = channel.port1;
  const port2 = channel.port2;

  let scheduledCallback = null;

  port2.onmessage = function () {
    if (scheduledCallback) {
      const callback = scheduledCallback;
      scheduledCallback = null;
      callback();
    }
  };

  return function scheduleCallback(callback) {
    scheduledCallback = callback;
    port1.postMessage(null);
  };
}
```

### 2. 更精确的控制需求

```javascript
// requestIdleCallback 的限制
requestIdleCallback(function (deadline) {
  // 只能知道剩余时间，无法控制优先级
  console.log("剩余时间:", deadline.timeRemaining());
});

// React Scheduler 的优势
function ReactSchedulerDemo() {
  // React 可以定义不同的优先级
  const priorities = {
    IMMEDIATE: 1, // 立即执行
    USER_BLOCKING: 2, // 用户交互
    NORMAL: 3, // 正常优先级
    LOW: 4, // 低优先级
    IDLE: 5, // 空闲时执行
  };

  function scheduleWork(callback, priority) {
    // React 可以根据优先级调度任务
    switch (priority) {
      case priorities.IMMEDIATE:
        callback(); // 立即执行
        break;
      case priorities.USER_BLOCKING:
        setTimeout(callback, 0); // 下一个事件循环
        break;
      default:
        // 使用自定义调度逻辑
        scheduleWithCustomLogic(callback, priority);
    }
  }
}
```

### 3. 任务中断和恢复的复杂性

```javascript
// React 需要能够中断和恢复工作
class WorkLoop {
  constructor() {
    this.workInProgress = null;
    this.isWorking = false;
  }

  performWork(deadline) {
    this.isWorking = true;

    while (this.workInProgress && deadline.timeRemaining() > 1) {
      // 执行一个工作单元
      this.workInProgress = this.performUnitOfWork(this.workInProgress);
    }

    // 如果时间用完但还有工作，安排继续
    if (this.workInProgress) {
      this.scheduleWork();
    } else {
      this.isWorking = false;
      this.completeWork();
    }
  }

  performUnitOfWork(fiber) {
    // 处理 Fiber 节点
    // 返回下一个要处理的 Fiber 或 null
    return fiber.child || fiber.sibling || fiber.return;
  }

  scheduleWork() {
    // React 使用自己的调度逻辑
    if ("requestIdleCallback" in window) {
      requestIdleCallback((deadline) => this.performWork(deadline));
    } else {
      // 回退到 setTimeout 或 MessageChannel
      setTimeout(() => this.performWork({ timeRemaining: () => 5 }), 0);
    }
  }
}
```

### 4. React Scheduler 的实现原理

```javascript
// 简化版的 React Scheduler 实现
class ReactScheduler {
  constructor() {
    this.taskQueue = [];
    this.currentTask = null;
    this.isHostCallbackScheduled = false;
    this.startTime = -1;
  }

  scheduleCallback(priorityLevel, callback, options) {
    const currentTime = performance.now();
    const timeout = this.getTimeoutByPriority(priorityLevel);
    const expirationTime = currentTime + timeout;

    const newTask = {
      id: this.generateId(),
      callback,
      priorityLevel,
      startTime: currentTime,
      expirationTime,
      sortIndex: expirationTime,
    };

    this.taskQueue.push(newTask);
    this.taskQueue.sort((a, b) => a.sortIndex - b.sortIndex);

    if (!this.isHostCallbackScheduled) {
      this.isHostCallbackScheduled = true;
      this.requestHostCallback(this.flushWork.bind(this));
    }

    return newTask;
  }

  flushWork(deadline) {
    this.isHostCallbackScheduled = false;

    while (this.taskQueue.length > 0 && deadline.timeRemaining() > 0) {
      const task = this.taskQueue.shift();

      if (task.expirationTime <= performance.now()) {
        // 任务已过期，立即执行
        const result = task.callback();
        if (typeof result === "function") {
          // 如果返回函数，表示任务未完成
          task.callback = result;
          this.taskQueue.unshift(task);
          break;
        }
      }
    }

    // 如果还有任务，继续调度
    if (this.taskQueue.length > 0) {
      this.isHostCallbackScheduled = true;
      this.requestHostCallback(this.flushWork.bind(this));
    }
  }

  getTimeoutByPriority(priorityLevel) {
    switch (priorityLevel) {
      case 1:
        return -1; // IMMEDIATE
      case 2:
        return 250; // USER_BLOCKING
      case 3:
        return 5000; // NORMAL
      case 4:
        return 10000; // LOW
      case 5:
        return 1073741823; // IDLE
      default:
        return 5000;
    }
  }

  requestHostCallback(callback) {
    // 使用 MessageChannel 而不是 requestIdleCallback
    this.schedulePerformWorkUntilDeadline(callback);
  }
}
```

## 结语

`requestIdleCallback` 是一个强大的 Web API，能够帮助我们在不影响用户体验的前提下执行低优先级任务。然而，React 选择实现自己的调度器是因为：

1. **兼容性考虑**：确保在所有环境中都能正常工作
2. **精确控制**：需要更细粒度的优先级和调度控制
3. **复杂需求**：支持任务中断、恢复和优先级调整
4. **性能优化**：针对 React 的特定需求进行优化
