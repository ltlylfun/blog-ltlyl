---
slug: html-summary
title: HTML 知识点小结
authors: [fangzhijie]
tags: [html]
---

# HTML 知识点小结

<!-- truncate -->

## 知识点 1：src 和 href 的区别

**src** 表示"源"，用于嵌入资源，将外部资源直接插入到当前文档中。使用 src 时，浏览器会暂停解析文档直到资源加载完成，资源会成为文档的一部分。

**href** 表示"超文本引用"，用于建立链接关系，指向外部资源的位置。使用 href 不会阻塞文档解析，只是建立当前文档与外部资源的关系。

```html
<!-- src - 嵌入资源 -->
<img src="image.jpg" alt="图片" />
<script src="script.js"></script>
<iframe src="page.html"></iframe>

<!-- href - 建立链接关系 -->
<a href="https://example.com">链接</a>
<link href="style.css" rel="stylesheet" />
```

**src 是把资源"拿过来"，href 是"指向"资源**。

## 知识点 2：对 HTML 语义化的理解

HTML 语义化就是**用正确的标签做正确的事情**，让标签本身就能表达内容的含义和结构。

**为什么要语义化？**

- 提高代码可读性和可维护性
- 有利于 SEO，搜索引擎更好理解页面内容
- 提升无障碍访问性，屏幕阅读器能正确解读
- 即使没有 CSS 样式，页面结构依然清晰

```html
<!-- 不语义化的写法 -->
<div class="header">网站头部</div>
<div class="nav">导航</div>
<div class="main">主要内容</div>
<div class="footer">网站底部</div>

<!-- 语义化的写法 -->
<header>网站头部</header>
<nav>导航</nav>
<main>主要内容</main>
<footer>网站底部</footer>
```

**常用语义化标签：**

```html
<article>文章内容</article>
<section>章节</section>
<aside>侧边栏</aside>
<figure>图表</figure>
<time>时间</time>
<mark>重要标记</mark>
```

**核心原则：标签的选择要基于内容的含义，而不是样式需求**。

## 知识点 3：DOCTYPE(文档类型) 的作用

DOCTYPE 是**文档类型声明**，告诉浏览器当前 HTML 文档使用哪个版本的 HTML 规范，必须放在 HTML 文档的第一行。

**主要作用：**

- 触发浏览器的**标准模式**，确保页面按照标准规范渲染
- 防止浏览器进入**怪异模式**(兼容模式)，避免渲染异常
- 帮助浏览器正确解析 HTML 和 CSS

```html
<!-- HTML5 的 DOCTYPE (推荐) -->
<!DOCTYPE html>

<!-- HTML 4.01 严格模式 -->
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<!-- XHTML 1.0 严格模式 -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

**如果缺少 DOCTYPE 会怎样？**
浏览器会进入怪异模式，可能导致：

- CSS 盒模型解析错误
- 部分 CSS 属性失效
- 页面布局异常

**现在统一使用 HTML5 的 DOCTYPE：`<!DOCTYPE html>`，简洁且向后兼容**。

## 知识点 4：script 标签中 defer 和 async 的区别

默认情况下，浏览器遇到 script 标签会**暂停 HTML 解析**，先下载并执行 JavaScript，再继续解析 HTML。defer 和 async 可以改变这个行为。

**defer（延迟执行）:**

- 并行下载脚本，但**等 HTML 解析完成后**再执行
- 多个 defer 脚本按照**文档顺序**依次执行
- 适合需要操作 DOM 或依赖其他脚本的情况

**async（异步执行）:**

- 并行下载脚本，**下载完立即执行**，不等 HTML 解析完成
- 多个 async 脚本执行顺序**不确定**
- 适合独立的脚本，如统计代码、广告等

```html
<!-- 默认：阻塞HTML解析 -->
<script src="script.js"></script>

<!-- defer：HTML解析完成后执行，保持顺序 -->
<script src="script1.js" defer></script>
<script src="script2.js" defer></script>

<!-- async：下载完立即执行，顺序不确定 -->
<script src="analytics.js" async></script>
<script src="ads.js" async></script>
```

**简单记忆：defer 是"等一下"，async 是"马上走"**。

## 知识点 5：常用的 meta 标签有哪些

meta 标签提供关于 HTML 文档的**元数据**，不会显示在页面上，但对浏览器和搜索引擎很重要。

**基础 meta 标签：**

```html
<!-- 字符编码 -->
<meta charset="UTF-8" />

<!-- 视口设置（移动端必备） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- 页面描述（SEO重要） -->
<meta name="description" content="页面内容描述，会显示在搜索结果中" />

<!-- 关键词 -->
<meta name="keywords" content="关键词1,关键词2,关键词3" />

<!-- 作者信息 -->
<meta name="author" content="作者姓名" />
```

**HTTP 相关：**

```html
<!-- 自动刷新页面 -->
<meta http-equiv="refresh" content="30" />

<!-- 禁用缓存 -->
<meta http-equiv="cache-control" content="no-cache" />

<!-- 设置过期时间 -->
<meta http-equiv="expires" content="Wed, 26 Feb 1997 08:21:57 GMT" />
```

**社交媒体分享（Open Graph）：**

```html
<meta property="og:title" content="页面标题" />
<meta property="og:description" content="页面描述" />
<meta property="og:image" content="分享图片URL" />
<meta property="og:url" content="页面URL" />
```

**其中 charset、viewport、description 是现代网页的标配**。

## 知识点 6：HTML5 有哪些更新

HTML5 相比 HTML4 带来了许多重要更新，主要围绕**语义化、多媒体、表单、API**四个方面。

**新增语义化标签：**

```html
<header>头部</header>
<nav>导航</nav>
<main>主内容</main>
<article>文章</article>
<section>章节</section>
<aside>侧边栏</aside>
<footer>底部</footer>
<figure>图表</figure>
<figcaption>图表说明</figcaption>
```

**多媒体支持：**

```html
<!-- 原生视频播放 -->
<video controls>
  <source src="movie.mp4" type="video/mp4" />
</video>

<!-- 原生音频播放 -->
<audio controls>
  <source src="music.mp3" type="audio/mp3" />
</audio>

<!-- 画布绘图 -->
<canvas id="myCanvas"></canvas>
```

**增强的表单控件：**

```html
<input type="email" placeholder="邮箱" />
<input type="date" placeholder="日期" />
<input type="number" min="1" max="100" />
<input type="range" min="0" max="100" />
<input type="color" />
<input type="search" placeholder="搜索" />
```

**重要的 JavaScript API：**

- **localStorage/sessionStorage** - 本地存储
- **Geolocation** - 地理位置
- **WebSocket** - 实时通信
- **Web Workers** - 多线程处理

**HTML5 让网页更语义化、更强大、用户体验更好**。

## 知识点 7：img 的 srcset 属性的作用

srcset 属性让浏览器可以**根据设备条件自动选择最合适的图片**，实现响应式图片加载，提升性能和用户体验。

**基本用法：**

```html
<!-- 根据屏幕密度选择图片 -->
<img
  src="image-1x.jpg"
  srcset="image-1x.jpg 1x, image-2x.jpg 2x, image-3x.jpg 3x"
  alt="响应式图片"
/>

<!-- 根据视口宽度选择图片 -->
<img
  src="small.jpg"
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 25vw"
  alt="不同尺寸图片"
/>
```

**配合 picture 元素使用：**

```html
<picture>
  <source media="(max-width: 480px)" srcset="mobile.jpg" />
  <source media="(max-width: 800px)" srcset="tablet.jpg" />
  <img src="desktop.jpg" alt="默认图片" />
</picture>
```

**主要优势：**

- **节省带宽**：移动设备加载小图，桌面设备加载大图
- **提升性能**：避免加载过大的图片
- **优化体验**：高分辨率屏幕显示更清晰的图片
- **自动适配**：浏览器根据设备条件自动选择

**srcset 让图片真正做到"因地制宜"，在合适的设备上显示合适的图片**。

## 知识点 8：行内元素、块级元素和空元素

HTML 元素根据显示特性分为**行内元素、块级元素和空元素**三类，它们有不同的布局行为。

**行内元素（inline）：**

- 在同一行显示，不会独占一行
- 不能设置宽高，宽高由内容决定
- 只能设置左右 margin 和 padding

```html
<!-- 常见行内元素 -->
<span>文本</span>
<a href="#">链接</a>
<strong>粗体</strong>
<em>斜体</em>
<code>代码</code>
<img src="image.jpg" alt="图片" />
<input type="text" />
<label>标签</label>
```

**块级元素（block）：**

- 独占一行，从新行开始显示
- 可以设置宽高、margin、padding
- 默认宽度为父容器的 100%

```html
<!-- 常见块级元素 -->
<div>容器</div>
<p>段落</p>
<h1>标题</h1>
<ul>
  <li>列表</li>
</ul>
<header>头部</header>
<section>章节</section>
<article>文章</article>
<footer>底部</footer>
```

**空元素（void/self-closing）：**

- 没有内容的元素，不需要闭合标签
- 在 XHTML 中需要自闭合 `/>`

```html
<!-- 常见空元素 -->
<br />
<!-- 换行 -->
<hr />
<!-- 分割线 -->
<img />
<!-- 图片 -->
<input />
<!-- 输入框 -->
<meta />
<!-- 元数据 -->
<link />
<!-- 外部资源 -->
<area />
<!-- 图像映射区域 -->
<base />
<!-- 基础URL -->
```

**记忆要点：行内排成行，块级占一行，空元素无内容**。

## 知识点 9：对 Web Worker 的理解

Web Worker 是 HTML5 提供的**多线程解决方案**，允许在后台线程中运行 JavaScript，避免阻塞主线程（UI 线程）。

**主要特点：**

- **独立线程**：在单独的线程中执行，不影响页面响应
- **无法操作 DOM**：不能直接访问 window、document 等对象
- **消息通信**：通过 postMessage 和 onmessage 与主线程通信
- **适合处理**：复杂计算、数据处理、文件操作等耗时任务

**基本用法：**

```javascript
// 主线程 - main.js
const worker = new Worker("worker.js");

// 向worker发送数据
worker.postMessage({ data: [1, 2, 3, 4, 5] });

// 接收worker返回的结果
worker.onmessage = function (e) {
  console.log("计算结果:", e.data);
};

// worker线程 - worker.js
self.onmessage = function (e) {
  const numbers = e.data.data;
  // 执行复杂计算
  const result = numbers.reduce((sum, num) => sum + num * num, 0);

  // 返回结果给主线程
  self.postMessage(result);
};
```

**实际应用场景：**

- **数据处理**：大量 JSON 解析、数组排序
- **图像处理**：Canvas 图像滤镜、压缩
- **加密解密**：密码加密、文件签名
- **实时计算**：游戏物理引擎、数学运算

**Web Worker 让 JavaScript 真正实现多线程，重计算任务不再卡 UI**。

## 知识点 10：HTML5 的离线存储

HTML5 提供了多种**离线存储技术**，让 Web 应用可以在没有网络连接时继续工作，提升用户体验。

**主要存储方式：**

**1. localStorage（本地存储）：**

- 持久化存储，除非手动清除否则永久保存
- 存储容量通常为 5-10MB
- 只能存储字符串，需要 JSON 序列化

```javascript
// 存储数据
localStorage.setItem("username", "zhangsan");
localStorage.setItem("userInfo", JSON.stringify({ name: "张三", age: 25 }));

// 读取数据
const username = localStorage.getItem("username");
const userInfo = JSON.parse(localStorage.getItem("userInfo"));

// 删除数据
localStorage.removeItem("username");
localStorage.clear(); // 清空所有
```

**2. sessionStorage（会话存储）：**

- 会话级存储，关闭标签页后自动清除
- 使用方法与 localStorage 相同

**3. Application Cache（已废弃）：**

- 使用 manifest 文件定义缓存资源
- 已被 Service Worker 替代

**4. Service Worker + Cache API（现代方案）：**

```javascript
// 注册Service Worker
navigator.serviceWorker.register("/sw.js");

// sw.js - 缓存资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(["/", "/styles.css", "/script.js"]);
    })
  );
});
```

**使用场景：**

- **用户偏好设置**：主题、语言等
- **表单数据暂存**：防止数据丢失
- **离线阅读**：缓存文章内容
- **购物车数据**：临时保存商品

**现代离线存储首选 Service Worker，功能强大且可控性好**。
