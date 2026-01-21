# 打包策略

## 按需加载路由

在一个大型应用中，通常会设定多个路由页面。默认这些页面会被 Webpack 打包到同一个 chunk 文件中（main.js）。
在这种情况下，首屏渲染时就会出现白屏时间过长问题。
因此需要将每个页面的路由组件,拆成单独的 chunk 文件。

在 Webpack 中，我们可以将代码拆分成多个 chunk 文件，然后通过 import() 函数动态加载。
拆分后的 chunk 文件会根据路由进行加载，从而实现按需加载。

```jsx
// utils/lazyLoad.jsx
import React, { lazy, Suspense } from "react";
import Loading from "../components/Loading";

/**
 * 增强的lazy加载组件
 * @param {Function} importFn - import()函数
 * @param {number} delay - 最小加载时间（避免闪烁）
 */
export function lazyLoad(importFn, delay = 300) {
  const LazyComponent = lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, delay)),
    ]).then(([module]) => module),
  );

  return (props) => (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// 使用示例
export const Home = lazyLoad(
  /* webpackChunkName: "Home" */ () => import("@/pages/Home"),
);
export const About = lazyLoad(
  /* webpackChunkName: "Home" */ () => import("@/pages/About"),
);
<Router>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</Router>;
```

## 合理分包

webpack 的 splitChunks 可以用来拆包和提取公共代码。

1. 拆包：将一些模块拆分到单独的 chunk 文件中，如将第三方模块拆分到 vendor.js 中；
2. 提取公共代码：将多处引入的模块代码，提取到单独的 chunk 文件中，防止代码被重复打包，如拆分到 common.js 中。

```js
module.exports = {
  splitChunks: {
    // cacheGroups 配置拆分(提取)模块的方案（里面每一项代表一个拆分模块的方案）
    cacheGroups: {
      // 禁用默认的缓存组，使用下方自定义配置
      defaultVendors: false,
      default: false,
      // 将 node_modules 中第三方模块抽离到 vendors.js 中
      vendors: {
        name: "vendors",
        test: /[\\/]node_modules[\\/]/,
        filename: "vendors.js",
        priority: -10,
        chunks: "all",
      },
      // 按照模块的被引用次数，将公共模块抽离到 common.js 中
      common: {
        name: "common",
        priority: -20,
        chunks: "all",
        // 模块被引入两次及以上，拆分到 common chunk 中
        minChunks: 2,
      },
      // 将 React 生态体系作为一个单独的 chunk，减轻 vendors 的体积
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
        name: "react-packages",
        priority: 0,
        chunks: "all",
        enforce: true,
      },
    },
  },
};
```

## 代码压缩

TerserWebpackPlugin 和 CssMinimizerWebpackPlugin 都是 Webpack 官方提供的压缩工具。

```js
const TerserWebpackPlugin = require("terser-webpack-plugin"); // JS 压缩
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // CSS 压缩

module.exports = {
  optimization: {
    minimize: process.env.NODE_ENV === "production",
    minimizer: [
      new TerserWebpackPlugin({
        // 不提取注释到单独的 .txt 文件
        extractComments: false,
        // 使用多进程并发运行以提高构建速度。并发运行的默认数量：os.cpus().length - 1。
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
};
```

## 特定模块查找路径

老项目中有使用过 moment.js 时，默认 Webpack 打包会包含所有语言包，导致打包文件非常大。
配置 ContextReplacementPlugin 告诉 Webpack 只打包特定语言包。

```js
module.exports = {
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn|zh-hk|en/),
    ];
}
```

## externals 外部模块

在 Webpack 中，externals 配置项可以告诉 Webpack 不去打包某些模块，而是在运行时从外部获取这些模块。
比如: React 和 ReactDOM 是外部模块，它们不应该被 Webpack 打包，而是应该从 CDN 中获取。

```js
module.exports = {
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM'
        // jquery 通过 script 引入之后，全局中即有了 jQuery 变量
        jquery: "jQuery",
    }
}
```

## 静态图片管理

静态图片优化:

1. 静态图片处理：将静态图片处理成 base64，减少 HTTP 请求。
2. 图片优化处理：使用 image-webpack-loader 优化图片，如压缩、去色、去白边、去透明色、去背景色、去注释、去元信息等。

vite

```js
import { defineConfig } from "vite";
import viteImagemin from "vite-plugin-imagemin";

export default defineConfig({
  plugins: [
    // 图片压缩插件
    viteImagemin({
      // 无损压缩配置
      optipng: {
        optimizationLevel: 7, // 1-7，数值越大压缩率越高
      },
      // 有损压缩配置（JPG/WebP）
      mozjpeg: {
        quality: 80, // 质量 0-100，根据业务调整
      },
      // WebP 转换
      webp: {
        quality: 80,
      },
      // AVIF 转换（比WebP更小）
      avif: {
        quality: 75,
      },
    }),
  ],
  // 静态资源处理：小图片转Base64（减少HTTP请求）
  build: {
    assetsInlineLimit: 4096, // 小于4KB的图片转Base64，可根据业务调整
  },
});
```

webpack

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            // 小图片转Base64
            loader: "url-loader",
            options: {
              limit: 4096, // 小于4KB转Base64
              name: "assets/img/[name].[hash:8].[ext]", // 输出路径和命名
            },
          },
          {
            // 图片压缩
            loader: "image-webpack-loader",
            options: {
              mozjpeg: { quality: 80, progressive: true },
              optipng: { enabled: false },
              pngquant: { quality: [0.75, 0.9], speed: 4 },
              gifsicle: { interlaced: false },
              webp: { quality: 80 },
            },
          },
        ],
      },
    ],
  },
};
```

## 明确目标环境

我们编写的 ES6+ 代码会经过 Babel 进行降级转换和 polyfill 后得到 ES5 代码运行在浏览器上，不过这会增大 chunk 资源的体积。
但是如果明确我们的网站仅运行在主流浏览器上，不考虑 IE11，可以将构建目标调整为 ES2015，这样可以减少 Babel 的降级处理和 polyfill 的引入，减小打包后的 chunk 资源体积。

```json
// package.json
{
  "browserslist": [
    "last 2 versions",
    "> 1%",
    "not dead",
    "not IE 11"
  ]
}

// babel.config.json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": { "esmodules": true }, // 仅支持 ES Module 的浏览器
        "useBuiltIns": "entry",
        "corejs": 3
      }
    ]
  ]
}
```

## 优化构建速度

### 配置查找范围

```js
// webpack.config.js
module.exports = {
  // 1. 明确入口，避免自动推断
  entry: "./src/index.js",

  // 2. 排除不需要解析的模块（如已编译的第三方库）
  module: {
    noParse: /^(vue|react|react-dom|lodash)$/, // 正则匹配无需解析的库
    rules: [
      /* 你的loader规则 */
    ],
  },

  // 3. 限定模块查找范围，减少文件遍历
  resolve: {
    // 明确扩展名，避免Webpack尝试所有可能的扩展名
    extensions: [".js", ".jsx", ".vue", ".ts", ".tsx", ".json"],
    // 明确模块查找目录，优先找node_modules，避免上层目录查找
    modules: [path.resolve(__dirname, "node_modules")],
    // 别名：减少路径解析耗时，同时简化代码导入
    alias: {
      "@": path.resolve(__dirname, "src"),
      vue$: "vue/dist/vue.runtime.esm.js", // 指向更轻量的版本
    },
  },

  // 4. 排除不需要处理的文件（如node_modules、测试文件）
  externals: {
    // 将大型第三方库通过CDN引入，不打入bundle（生产环境推荐）
    jquery: "jQuery",
    lodash: "_",
  },
};
```

### 配置 babel 编译范围

```js
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: ["babel-loader"],
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
};
```

### 开启 babel 编译缓存

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            // ✅ 开启缓存
            cacheDirectory: true,
            // ✅ 禁用缓存压缩（提升性能）
            cacheCompression: false,
          },
        },
      },
    ],
  },
};
```

### 开启多进程压缩代码

```js
module.exports = {
  optimization: {
    minimize: process.env.NODE_ENV === "production",
    minimizer: [
      new TerserWebpackPlugin({
        // 不提取注释到单独的 .txt 文件
        extractComments: false,
        // 使用多进程并发运行以提高构建速度。并发运行的默认数量：os.cpus().length - 1。
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
};
```

### 使用 swc 替换 babel

swc 是 Rust 编写的编译器，速度比 babel 快 20 倍以上

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "swc-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
```

### 使用 esbuild-loader 替换 terser

生产环境替换 terser-webpack-plugin，压缩速度提升 10 倍

```js
const ESBuildMinifyPlugin = require('esbuild-loader').ESBuildMinifyPlugin;

module.exports = {
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015' // 兼容目标
      })
    ]
  }
};
```
