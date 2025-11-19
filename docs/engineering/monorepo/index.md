# Monorepo

## monorepo 和 multirepo

- Monorepo 是将多个项目放在一个代码仓库中，而 Multirepo 是将多个项目放在多个代码仓库中。
- Monorepo 可以更方便地管理和协作，因为它将所有代码放在一个地方，可以更容易地共享代码和依赖关系。

monorepo 项目结构

```bash
monorepo-project/
├── packages/
│   ├── shared-ui/      # UI 组件库
│   ├── shared-utils/   # 工具函数库
│   ├── web-app/        # Web 应用
│   ├── mobile-app/     # 移动端应用
│   └── admin-panel/    # 管理后台
├── apps/
│   ├── docs/           # 文档站点
│   └── playground/     # 开发调试
├── tools/
│   ├── build-scripts/  # 构建脚本
│   └── eslint-config/  # 共享配置
└── package.json
```

## multirepo 的痛点

1. 代码复用：多个项目需要相同的工具函数、UI 组件等，需要在每个项目中重复编写。修改一个样式，需要同步多个仓库。
2. 版本管理：项目 A`@company/utils: 2.1.5`，项目 B`@company/utils: ^1.1.0`，版本严重不一致，兼容问题难以追踪，需要手动维护版本。
3. 开发调试：A 项目是 B 项目的依赖。A 每次修改后手动运行多个命令，B 手动更新修改。然后再次开始调试。循环如此！
4. 跨项目难：一个功能涉及了多个项目，需要手动在多个项目中修改，然后手动运行多个命令，最后手动合并多个项目的结果。
5. 依赖管理：每个项目都有自己的依赖管理，依赖版本不一致，导致兼容性问题。
6. 工具链：每个项目都需要单独配置工具链，如构建工具、测试框架、代码规范等，维护成本高。而且往往几个项目都工具链一模一样。
7. CI/CD：每个项目都需要单独配置 CI/CD，维护成本高。而且还有可能每个项目的构建工具不统一。
8. 权限访问：每个项目都需要单独配置权限访问，维护成本高。而且往往几个项目权限配置一模一样。
9. 知识共享：相同的解决方案，在不同的项目中重复编写，导致知识共享困难。

### 成本问题

**基础设施成本**：

1. Git 仓库
2. CI/CD 流水线
3. NPM 包发布配置
4. 文档站点
5. 监控和告警

**人力成本**：

1. 跨团队协调会议
2. 重复相同的问题
3. 维护多个版本的文档
4. 培训新成员了解多个项目结构

总的来说：

1. 协作壁垒 - 团队和项目间存在人为隔阂
2. 效率瓶颈 - 重复工作和复杂流程拖慢开发速度
3. 质量风险 - 不一致的标准和难以追踪的依赖关系
4. 成本膨胀 - 基础设施和人力成本随项目数量线性增长
5. 创新阻力 - 跨项目更改的高成本抑制了架构演进

## monorepo 的优势

以上问题都可以通过 monorepo 来解决。

```bash
company/
├── web-app/           # 主站 (React 18)
├── mobile-app/        # 移动端 (React Native)
├── admin-panel/       # 后台 (Vue 3)
├── shared-utils/      # 工具库
├── ui-components/     # UI 组件
├── api-client/        # API 客户端
└── design-system/     # 设计系统

# 问题：
# - 12个独立仓库
# - 3种不同的框架
# - 5个不同的构建工具
# - 跨团队更改需要2-3周协调


# 从 Multirepo 迁移到 Monorepo
company-monorepo/
├── apps/
│   ├── web-app/
│   ├── mobile-app/
│   └── admin-panel/
├── packages/
│   ├── utils/
│   ├── ui/
│   ├── api-client/
│   └── design-system/
├── tools/           # 共享工具链
└── package.json     # 统一依赖管理
```

### 优势

| 痛点领域 | Multirepo           | Monorepo            |
| -------- | ------------------- | ------------------- |
| 代码共享 | ❌ 困难，需要发布包 | ✅ 直接源码引用     |
| 依赖管理 | ❌ 版本碎片化       | ✅ 统一版本         |
| 开发体验 | ❌ 跨项目调试复杂   | ✅ 一站式开发       |
| CI/CD    | ❌ 配置重复         | ✅ 统一配置         |
| 代码质量 | ❌ 标准不一致       | ✅ 统一规范         |
| 团队协作 | ❌ 权限复杂         | ✅ 简化协作         |
| 重构成本 | ❌ 高昂，需要协调   | ✅ 低成本，原子提交 |

## 使用场景

1. 组件库
2. 微前端架构
3. 全栈项目

## 不适合场景

1. 独立的项目，如博客、游戏平台、电商网站，这些没有意义不建议放在一起。
2. 不同技术栈的项目，如一个项目用 React，另一个项目用 Vue，这些项目放在一起，反而会增加维护成本。
3. 大型团队有严格的权限管理，每个团队只能访问自己的项目，不建议放在一起。

## 搭建 Monorepo 项目

- 小型项目： pnpm workspace
- 中型项目：pnpm + Turborepo 加速构建
- 大型项目：pnpm + Nx 提供更多功能

### 1. 初始化项目

```bash
mkdir monorepo-demo && cd monorepo-demo

pnpm init
```

### 2. 配置 pnpm-workspace.yaml

新增 pnpm-workspace.yaml 文件，配置工作区

```yaml
packages:
  - "packages/*" # 存放共享的包（如组件、工具库）
  - "apps/*" # 存放应用程序（如Demo、文档站点）
```

此配置告诉 pnpm：packages 和 apps 目录下的每个子目录都是一个独立的包。

### 3. 创建目录

```bash
monorepo-demo/
├── package.json
├── pnpm-workspace.yaml
├── packages/
│   ├── utils/
│   │   ├── package.json
│   │   └── index.js
│   └── components/
│       ├── package.json
│       └── index.js
└── apps/
    ├── web-app/
    │   ├── package.json
    │   └── src/
    │       └── main.js
    └── docs/
        ├── package.json
        └── src/
            └── main.js
```

分别在 utils 、components、web-app、docs 目录下执行 `pnpm init` 初始化。

### 4. 包名修改

```json
{
  "name": "@company/utils",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}

{
  "name": "@company/components",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
}
```

### 5. 依赖管理

#### 5.1 全局安装

-w 代表在根目录下安装依赖，适合全局共享的依赖。比如： typescript、eslint、prettier 等。

```bash
pnpm add typescript -w -D
```

#### 5.2 子包安装

--filter 代表在某个子包下安装依赖，适合子包私有的依赖。比如：webpack、vite 等。

```bash
pnpm add react --filter packages/web-app
```

### 6. 子包共享

#### 6.1 子包引用

比如我要在 docs 子包中引用 utils 子包，只需要在根目录 package.json 中添加 utils 子包的依赖即可。

```bash
pnpm add @company/utils --workspace  -w
```

**注意**：别忘了修改 utils 子包的 package.json，将 type 修改为 module。

```js
// utils
function add(a, b) {
  return a + b;
}

export default add;
```

```js
// docs
import add from "@company/utils";
console.log(add(1, 2));
```

```bash
node apps/docs/src/main.js. #此时应该输入3
```

**当然也可以在开发阶段使用 ../../ 这种相对路径直接引入**。

### 7.Turborepo
[中文网站](https://turbo.net.cn/)

#### 什么是 turborepo

它是一个高性能的构建系统，专门构建 monorepo 的 JS 和 TS 的项目。
它通过并行化任务、缓存结果、减少重复工作等方式，大大提高了构建速度。

#### 它有什么特点？

- 增量构建：只构建发生变化的文件，大大减少了构建时间。
- 云缓存：将构建结果缓存到云端，大大减少了重复构建的时间。
- 任务管道：用配置文件定义任务之间的关系，然后优化构建内容和时间
- 并行执行：同时执行多个任务，大大提高了构建速度。
- 构建文件：可以生成构建文件，并且可以导入到浏览器去了解哪些任务花费时间最长。

#### 核心概念

##### 管道

定义任务之间的关系，优化构建内容和时间。它允许开发者定义和执行跨多个包的自定义任务。
在 pipeline 中的每一个 key 都指向 pacages.json 的 scripts 中的一个脚本。并在 pipeline 中的每一个 key 都可以被 turbo run 所执行，
并且可以传递参数。
在执行 turbo run xxx 命令的时候，tubor 会根据定义的 piplines 里对命令的各种配置去对每个 package 中的 scripts 的命令进行执行。

##### DependsOn

在 Turborepo 中，DependsOn 是一种配置属性，它允许制定任务之间的依赖关系，通过使用 DependsOn 属性，可以指定一个任务在另一个任务完成之后才能开始执行。
DependsOn 的主要功能是定义任务之间的依赖关系，确保任务按照正确的顺序执行，避免出现任务之间的竞争条件或数据不一致的问题。比如如测试或部署需要等待其他任务如构建或编译完成后才能开始。

##### Cache

Cache 是 Turborepo 的一个重要特性，它允许开发者将构建结果缓存到本地，以便在下次构建时可以快速地加载这些结果，从而大大提高构建速度。

##### Remote Caching

远程缓存：将构建结果缓存到云端（vervel），大大减少了重复构建的时间。

##### OutputLogs

设置输出日志详细程度，默认为 full。

- full： 默认显示所有构建结果
- hash-only： 只显示构建结果的哈希值
- new-only： 只显示新构建的结果
- errors-only： 只显示构建错误
- none： 不显示任何构建结果

##### Filtering Packages

如果只想要构建或测试某些包，可以使用 --filter 来指定这些包。

- --filter： 只构建指定的包
- --filter-with： 只构建匹配指定正则表达式的包

## 基于 Turborepo 的 Monorepo 项目

### 安装

```bash
pnpm dlx create-turbo@latest
```

输入项目名称，选择使用 pnpm。
此时会得到一个项目目录
```bash
my-tuborepo/
├── apps/
│   ├── docs
│   └── web
├── packages
│   ├── eslint-config
│   ├── typescript-config
│   └── ui
├── .npmrc
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── turbo.json
```

查看 package.json，可以看到 turborepo 默认配置了几个命令。
```json
{
  "name": "my-turborepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "check-types": "turbo run check-types"
  },
  "devDependencies": {
    "prettier": "^3.6.2",
    "turbo": "^2.6.1",
    "typescript": "5.9.2"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=18"
  }
}

```

### 启动

```bash
pnpm run dev
```

通过启动项目，在控制台可以看到有两个项目在同时运行，web 和 docs。


### 查看 turbo.json

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"], // 先构建依赖项
      "inputs": ["$TURBO_DEFAULT$", ".env*"], // 构建输入
      "outputs": [".next/**", "!.next/cache/**"] // 缓存输出
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false, // 开发模式不缓存
      "persistent": true
    }
  }
}
```