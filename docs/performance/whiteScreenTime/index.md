# 白屏时间优化

JavaScript文件过大：SPA通常有很多 JavaScript 文件，如果这些文件的大小过大或加载速度慢，就会导致首屏加载缓慢。可以通过代码分割和打包、使用CDN等方式来优化加载速度。
数据请求过多或数据请求太慢：SPA通过 AJAX 或 Fetch 等方式从后端获取数据，如果数据请求过多或数据请求太慢，也会导致首屏加载缓慢。可以通过减少数据请求、使用数据缓存、优化数据接口等方式来优化数据请求速度。
大量图片加载慢：如果首屏需要加载大量图片，而这些图片大小过大或加载速度慢，也会导致首屏加载缓慢。可以通过图片压缩、使用图片懒加载等方式来优化图片加载速度。
过多的渲染和重绘操作：如果在首屏加载时进行大量的渲染和重绘操作，也会导致首屏加载缓慢。可以通过尽可能少的DOM操作、使用CSS3动画代替JS动画等方式来优化渲染和重绘操作。
网络问题：网络问题也会影响SPA首屏加载速度，比如网络延迟、丢包等。可以通过使用CDN、使用HTTP/2等方式来优化网络问题。

## 资源体积控制

减少资源体积，减少加载时间。

1. 压缩图片
2. 压缩代码
3. 减少第三方库体积
4. 使用静态资源 CDN

压缩图片可以使用图片压缩工具，比如 https://tinypng.com/。
压缩代码可以使用代码压缩工具，webpack 和 vite 都有代码压缩功能。
减少第三方库体积可以使用 CDN，比如 https://cdnjs.com/。

## 按需加载

按需加载，即只加载需要的资源，而不是加载所有资源。
比如说首页只需要一个 js 和一个 css 文件，那么就可以只加载这两个文件。

## 预加载

预加载，即在页面加载时提前加载需要的资源，比如首页的 js 和 css 文件。

```js
<!-- 高优先级资源预加载 -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="main.js" as="script">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 提前建立连接，减少DNS、TCP、TLS时间 -->
<link rel="preconnect" href="https://cdn.example.com">
<link rel="preconnect" href="https://api.example.com" crossorigin>
```

## SSR 服务端渲染

服务端渲染，即在服务器上渲染页面，然后将渲染后的页面发送给客户端。
服务端渲染可以减少客户端的请求次数，从而提高页面加载速度。
服务端渲染可以使用 Next.js、Nuxt.js、Gatsby 等框架实现。
