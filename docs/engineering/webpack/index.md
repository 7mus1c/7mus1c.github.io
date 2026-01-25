# Webpack
## commonjs
1. 每一个文件就是一个模块，有自己的作用域。内部定义的变量、函数、类都是私有的。对其他文件不可见。
2. 在文件中可以使用 global 定义全局变量，无需导出，其他文件可以访问。
3. 每个模块内部，module 变量代表了当前模块。它的 exports （module.exports）是对外的接口。
4. 通过 require() 导入一个模块，读取并加载 js 文件，然后返回该模块的 exports 对象。
5. 所有代码都运行在模块的作用域，不会污染全局。
6. 所有模块的首次加载会被运行一次，然后被缓存下来，之后再去加载都是去获取缓存。要先让模块再次运行必须清除缓存。
7. 模块加载的顺序就是按照代码中出现的顺序。

## module
[CommonJS 模块 | Node.js v22 文档](https://nodejs.cn/api/modules.html#module)

每个模块内部都有一个 node 注入的 module 对象，代表当前模块。

它有以下属性：

+ id：当前模块的id，一般是路径（绝对路径）加上文件名
+ path：当前模块的路径（绝对路径）
+ exports：对外抛出的对象
+ filename：当模块的文件名，一般是路径（绝对路径）加上文件名
+ loaded：返回一个 boolean，表示该模块是否加载完毕
+ children：返回一个数组，表示该模块内部用到的其他模块
+ paths：返回一个数组，模块的搜索路径

## module.exports 和 exports 的区别
module.exports 和 exports 都是用来导出模块的接口，但是 module.exports 会覆盖掉 exports 的结果。

而且 exports 不能直接抛出一个值。例如：

```javascript
exports = 'abc';// 报错
```

因为 exports 是 module.exports 的引用，会直接覆盖 module.exports 。

# AMD CMD UMD
adm 就是 requireJS 提出的，主要用于异步加载模块。

```javascript
define(['dependency1', 'dependency2'], function(dep1, dep2) {
  // 模块实现
  return moduleExports;
});
```

Cmd 就是 seaJS 提出的，与AMD类似，也是用于异步加载模块。

```javascript
define(function(require, exports, module) {
  var dep1 = require('dependency1');
  var dep2 = require('dependency2');
  // 模块实现
  return moduleExports;
});
```

AMD CMD 就是通过动态的创建 Script 标签和 src 插入页面的一种方法。

Umd 就是一种用来兼容 commonjs、AMD、CMD 的兼容写法。它会先判断是否支持 exports 这种写法。也就是判断是否是 nodejs 的环境，如果是就用 commonjs ，然后再去判断是否支持 AMD 这种写法，如果都不支持就挂载到全局的 window 上。

## ES module 和 commonjs 的区别
1. Commonjs 模块输出的是一个值的拷贝，ES module 输出的是值的引用。
2. Commonjs 是运行时加载，ES module 是编译时加载。
3. Commonjs 的 require 是同步任务，ES module 的 import 是异步任务。

## Webpack 打包流程
1. 初始化参数：读取合并配置文件(webpack.config.js)与命令行的配置创建一个 compiler 对象。
2. 开始编译：加载所有初始化的插件，调用 Compiler 对象的 run 方法开始编译
3. 解析入口：webpack 确定入口，通过入口解析模块的依赖关系，生成依赖关系图
4. 加载模块：调用 loader，通过依赖关系图，对所有模块递归的进行编译，这个过程是串行的
5. 代码优化：webpack 通过插件对代码进行优化，如压缩、合并、提取公共代码等
6. 输出文件：根据配置进行文件的输出
7. 完成打包：weback完成打包，调用回调函数，输出打包结果。

## Npx
Npx 是 npm 在 V5.2.0 开始新增的的命令。

### Npx 的作用
+ Npm 只能管理包的依赖，npx 则可以快捷的运用包中的命令行工具和其他可执行文件，让项目内部安装的模块用起来更方便。
+ 当执行 `npx <command>` 时，npx 会先本地找查找（可以是项目中的 也可以是本地的）这个 `comoand`。
    - 找到了：就用本地的版本
    - 没找到：直接下载最新的版本
    - 使用完之后就删除，不会在本机或者项目中留下任何东西
    - 这样不会污染本机，永远使用最新版本

### 总结
1. 方便的执行可执行的依赖
2. 可以无需安装直接执行，并且自动删除，避免依赖污染
3. 可以指定版本执行

## Chunk
在 Webpack 中，chunk 指的是一组模块的集合。

webpack 通过分析模块之间的引用关系，将相关的模块组合在一起，形成一个chunk。

## bundle
Bundle 是打包处理之后形成的文件。

## Css-loader 和 style-loader 的作用？
+ Css-loader： 会把 css 转换为 js，使用 webpack 能够将 css 进行打包管理。
+ Style-loader：会把 css 插入到 html 当中去，也就是冬天创建了一个 style 标签。

Webpack 的 use 加载 loader 的时候是**从右往左**，所以下面代码是先进行 css 转换，然后再进行 style 创建。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
}
```

## MiniCssExtractPlugin
它是用来处理 css 文件的插件，它主要作用是把 css 从 js 冲抽离出来，生成 css 文件。

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: (
    new MiniCssExtractPlugin({ 
      filename: 'style/style.css' // 控制从打包后的入口 JS 文件中提取 CSS 样式生成的 CSS 文件的名
    })
  ),
  module: {
    rules: (
      { 
        test: /\.(css|less)$/, 
        use: (MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader') 
      }
    )
  }
}
```

## MiniCssExtractPlugi 和 Style-loader 的区别？
Style-loader 并不会生成独立的 css 文件。

style-loader 一般用于开发环境。MiniCssExtractPlugin 用于生产环境。

Style-loader 在热更新时支持的更好更加快速，而 MiniCssExtractPlugin 更适合用于浏览器的缓存，和并行加载。

## css-next
[cssnext - Use tomorrow’s CSS syntax, today.](https://cssnext.github.io/)

### 安装
```bash
npm install postcss postcss-cssnext --save-dev
```

### 配置 postcss.config.js
```javascript
module.exports = {
  plugins: {
    'postcss-cssnext': {} 
  }
};

// 或者 
module.exports = {
  plugins: [
    require('postcss-cssnext')
  ]
};
```

### 使用
使用之前 webpack 要配置 postcss-loader

```css
:root {
  --mainColor: #ffc001; 
}

.test {
  background: var(--mainColor); 
}
```

## HtmlWebpackPlugin
它能够将 Webpack 打包生成的 JavaScript 和 CSS 资源自动注入到生成的 HTML 中，确保页面能够正确加载这些资源。

### 安装
```bash
npm i --save-dev html-webpack-plugin
```

### 使用
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [new HtmlWebpackPlugin({
    title: '标题标题',
    filename: 'index.html',
    template: resolve(__dirname, '../public/index.html'),
  })]
}
```

## 手动发布
1. 安装依赖
2. 构建，生成 dist
3. 除了 html，剩下的 css、js、图片等 上传到CND。cos 是 cdn 的源站。
4. 上传到 cos 之后会生成一个链接
5. 链接配置在 webpack.config.js，这个时候打包之后静态资源就会加上 cdn 的前缀。

```javascript
module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js',
    publicPath: 'https://xxx-xxx.cos.ap-guangzhou.myqcloud.com/'
  },
}
```

1. html 要给到后台，后台来部署环境。

## 自动发布
核心：让手动操作的部分改为自动，让机器或者脚本帮助发布

将以下两个步骤改为自动：

1. 安装依赖
2. 构建
3. 自动上传静态资源

使用工具：coding 

https://coding.net/

## Hash chunkHash contentHash 有什么区别
+ hash: 根据 webpack 所有模块生成的，有任何变化整个项目的 Hash 重新生成，而且唯一
+ chunkHash：根据 chunk 依赖生成的，当前 chunk 中的依赖发生变化，就会把当前 chunk 的文件的 Hash 重新生成
+ contentHash：根据文件来的，只有文件内容发生变化，才会重新生成当前文件的 hash。

## externals
忽略指定的依赖，例如已经引用了第三方 CDN 的 jquery

## splitChunks
+ Chunks: 拆包的模式 all，async，inital，直接使用 all，可以把异步和非异步的包都抽离出去，默认 async。
+ minSize：指定chunk的体积（字节），当包超过这个大小时，就会开始分包
+ minChunks：当前模块共享chunk数量，比如一个模块在共享两个chunk里面，那才会提取到新的chunk中，默认是1
+ maxAsyncRequests：按需加载并行请求的数量，默认值是5
+ maxInitialRequests：入口点的最大并行请求数。限制了初始页面加载时的并行请求数量。默认值3
+ automationNameDelimiter：打包分隔符
+ cacheGroups: 设置缓存的 chunk
+ cacheGroups.priority: 缓存的优先级
+ cacheGroups.vendor：打出来包的名称 可以叫 vendor 也可以叫别的
+ cacheGroups.vendor.chunks：拆包的模式
+ cacheGroups.vendor.test：正则校验，把哪些包打成 vendor
+ cacheGroups.vendor.name：chunk 的名称
+ cacheGroups.vendor.minSize：指定chunk的体积
+ cacheGroups.vendor.minChunks：至少被几个模块依赖才会打包
+ cacheGroups.vendor.maxAsyncRequests：按需加载并行请求的数量
+ cacheGroups.vendor.maxInitialRequests：初始化最大请求数
+ cacheGroups.vendor.reuseExistingChunk：true，可设置是否重用该chunk

## optimization.runtimeChunk
用于将 Webpack 运行时代码提取到一个单独的 chunk 文件中。运行时代码通常是指在模块交互时，用于连接加载和解析逻辑的辅助代码。

比如我三个组件组件实际代码并不多，但是打包出来很大，说明里面添加运行时的代码，需要把运行时单独抽离成一个chunk，和实际业务代码分割。

```javascript
module.exports = {
  //...其他配置
  optimization: {
    runtimeChunk: true 
  }
};
```

## 性能优化
1. Loader 添加 include 属性，指定只编译那个目录下的代码
2. 减少 resolve 相关的文件系统调用，关闭 npm link的相关配置，
3. 使用 DllPlugin 提高编译速度
4. 使用 splitChunks 分包
5. worker池，可以 loader 的多线程，需要视情况而定
6. sourceMap 的 eval 性能最好但是不能转义代码，最佳选择是 eval-cheap-module-source-map
7. 开发环境不需要压缩代码和图片
8. 使用 runtimeChunk 提取运行时代码到独立的 Chunk 
9. Ts-loader ranspileOnly设置为 true 关闭 ts-loader 的类型检查
10. Bable 指定编译的目录和排除编译的目录

## 热更新和HMR的区别？
1. hrm是一种不需要更新页面，就可以更新视图的技术，核心原理就是 module.hot 重新执行 render
2. 热更新是文件改了，webpack 自动帮助刷新页面

## Tree shaking
1. 使用 sideEffect 告诉webpack 没有副作用
2. Css 要标记有副作用，否则会产生打包出来的文件没有css

```javascript
{"name": "your-project","sideEffects": ["./src/some-side-effectful-file.js", "*.css"]}
```
3. Babel 会把一些没有副作用的代码变成有副作用的

