---
slug: cors-guide
title: 理解跨域
authors: [fangzhijie]
tags: [javascript, http, web-security]
---

# 理解跨域问题

Web 开发中，跨域问题几乎是每个前端开发者都会遇到的经典问题。今天，我们来探讨跨域的本质、成因以及各种解决方案。

<!-- truncate -->

## 什么是跨域？

跨域（Cross-Origin）指的是当一个 Web 页面尝试访问与当前页面不同源的资源时所遇到的限制。这个限制源于浏览器的**同源策略**（Same-Origin Policy）。

### 同源策略的定义

同源策略是浏览器的一个重要安全特性，它规定只有在**协议**、**域名**和**端口**三者完全相同的情况下，页面才能访问另一个页面的资源。

让我们通过例子来理解什么是"同源"：

```javascript
// 假设当前页面URL为：https://www.example.com:8080/page

// 同源的URL
"https://www.example.com:8080/api/users"; // ✅ 同源
"https://www.example.com:8080/data.json"; // ✅ 同源

// 跨域的URL
"http://www.example.com:8080/api"; // ❌ 协议不同 (https vs http)
"https://api.example.com:8080/users"; // ❌ 域名不同 (www vs api)
"https://www.example.com:3000/api"; // ❌ 端口不同 (8080 vs 3000)
"https://www.other.com:8080/api"; // ❌ 域名完全不同
```

## 为什么需要同源策略？

同源策略是 Web 安全的基石，它主要防止以下安全问题：

### 1. 恶意脚本攻击

```javascript
// 恶意网站 evil.com 上的脚本
// 如果没有同源策略，这段代码可能会读取用户在银行网站的敏感信息
fetch("https://bank.com/account-info")
  .then((response) => response.json())
  .then((data) => {
    // 将用户银行信息发送到恶意服务器
    sendToEvilServer(data);
  });
```

### 2. 跨站请求伪造攻击

```html
<!-- 恶意网站上的隐藏表单 -->
<form action="https://bank.com/transfer" method="POST" style="display:none;">
  <input name="to" value="evil-account" />
  <input name="amount" value="10000" />
</form>
<script>
  // 自动提交表单，利用用户的登录状态
  document.forms[0].submit();
</script>
```

## 跨域请求的表现

当发生跨域请求时，不同类型的请求会有不同的表现：

### 简单请求 vs 预检请求

**简单请求**满足以下条件：

- 请求方法：`GET`、`POST`、`HEAD`
- 请求头只包含安全的字段（如 `Content-Type: text/plain`）

```javascript
// 简单请求示例
fetch("https://api.other-domain.com/data", {
  method: "GET",
  headers: {
    "Content-Type": "text/plain",
  },
});
```

**预检请求**（Preflight）会先发送 `OPTIONS` 请求：

```javascript
// 复杂请求示例 - 会触发预检
fetch("https://api.other-domain.com/users", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer token123",
  },
  body: JSON.stringify({ name: "John" }),
});
```

浏览器会先发送预检请求：

```http
OPTIONS /users HTTP/1.1
Host: api.other-domain.com
Origin: https://my-app.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization
```

## 跨域解决方案详解

### 1. CORS（跨域资源共享）

CORS 是现代 Web 开发中最常用的跨域解决方案。

#### 服务端配置示例

**Node.js/Express:**

```javascript
const express = require("express");
const app = express();

// 基本 CORS 设置
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // 或指定域名
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 预检请求的响应
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 使用 cors 中间件（推荐）
const cors = require("cors");
app.use(
  cors({
    origin: ["https://my-app.com", "https://admin.my-app.com"],
    credentials: true, // 允许携带 cookies
  })
);
```

#### 前端请求示例

```javascript
// 带凭证的跨域请求
fetch("https://api.other-domain.com/user", {
  method: "POST",
  credentials: "include", // 携带 cookies
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  },
  body: JSON.stringify(userData),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .catch((error) => {
    console.error("跨域请求失败:", error);
  });
```

### 2. 代理服务器

在开发环境中，代理是最常用的解决方案。

#### Webpack Dev Server 代理

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "", // 重写路径
        },
      },
    },
  },
};
```

#### Vite 代理配置

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
};
```

### 3. JSONP（仅支持 GET 请求）

JSONP 比较老旧。

### 4. PostMessage（窗口间通信）

用于不同域之间的窗口通信：

```javascript
// 父窗口（https://parent.com）
const iframe = document.getElementById("childFrame");

// 向子窗口发送消息
iframe.contentWindow.postMessage(
  {
    type: "GREETING",
    data: "Hello from parent!",
  },
  "https://child.com"
);

// 监听子窗口的回复
window.addEventListener("message", (event) => {
  // 验证来源
  if (event.origin !== "https://child.com") return;

  console.log("收到子窗口消息:", event.data);
});

// 子窗口（https://child.com）
window.addEventListener("message", (event) => {
  // 验证来源
  if (event.origin !== "https://parent.com") return;

  console.log("收到父窗口消息:", event.data);

  // 回复消息
  event.source.postMessage(
    {
      type: "REPLY",
      data: "Hello back from child!",
    },
    event.origin
  );
});
```
