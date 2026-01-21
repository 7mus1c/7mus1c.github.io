import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "李程Lc",
  description: "一个有点作用的博客",
  base: "/",
  themeConfig: {
    logo: "https://vitepress.dev/vitepress-logo-mini.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "JS必知", link: "/js/" },
      { text: "CSS必知", link: "/css/" },
      { text: "浏览器", link: "/browser/" },
      { text: "网络", link: "/network/" },
      { text: "Vue", link: "/vue/", activeMatch: "^/vue/" },
      { text: "React", link: "/react/", activeMatch: "^/react/" },
      {
        text: "TypeScript",
        link: "/typescript/",
        activeMatch: "^/typescript/",
      },
      { text: "Node", link: "/node/", activeMatch: "^/node/" },
      {
        text: "性能优化",
        link: "/performance/",
        activeMatch: "^/performance/",
      },
      { text: "工程化", link: "/engineering/", activeMatch: "^/engineering/" },
      { text: "算法", link: "/algorithm/", activeMatch: "^/algorithm/" },
      { text: "面试题", link: "/interview/", activeMatch: "^/interview/" },
      { text: "Ai", link: "/ai/", activeMatch: "^/ai/" },
    ],

    sidebar: {
      "/vue/": [
        {
          text: "Vue",
          collapsed: false,
          items: [
            { text: "基础用法", link: "/vue/" },
            { text: "源码分析", link: "/vue/sourceCode" },
          ],
        },
      ],
      "/react/": [
        {
          text: "React",
          items: [
            { text: "基础用法", link: "/react/" },
            { text: "源码分析", link: "/react/sourceCode" },
            { text: "Next", link: "/react/next" },
            { text: "jotai", link: "/react/jotai" },
          ],
        },
      ],
      "/typescript/": [
        {
          text: "TypeScript",
          items: [{ text: "基础用法", link: "/typescript/" }],
        },
        {
          text: "进阶用法",
          collapsed: true,
          items: [{ text: "类型体操", link: "/typescript/type" }],
        },
      ],
      "/node/": [
        {
          text: "Node",
          items: [{ text: "基础用法", link: "/node/" }],
        },
        {
          text: "pnpm",
          items: [{ text: "基础", link: "/node/pnpm/" }],
        },
      ],
      "/performance/": [
        {
          text: "性能优化",
          items: [
            { text: "性能概述", link: "/performance/" },
            {
              text: "衡量前端性能",
              link: "/performance/measurePerformance",
            },
            { text: "代码逻辑", link: "/performance/codeLogic" },
            { text: "Vue", link: "/performance/vue" },
            { text: "React", link: "/performance/react" },
            { text: "资源加载", link: "/performance/resouceLoading" },
            { text: "白屏时间", link: "/performance/whiteScreenTime" },
            { text: "交互体验", link: "/performance/interactionExperience" },
            { text: "打包策略", link: "/performance/packagingStrategy" },
            { text: "基础设置", link: "/performance/baseSetting" },
          ],
        },
      ],
      "/engineering/": [
        {
          text: "项目工程化",
          items: [
            { text: "webpack", link: "/engineering/webpack/" },
            { text: "vite", link: "/engineering/vit/e" },
            { text: "monorepo", link: "/engineering/monorepo/" },
          ],
        },
      ],
      "/algorithm/": [
        {
          text: "算法",
          items: [
            { text: "算法基础", link: "/algorithm/" },
            { text: "栈", link: "/algorithm/stack/" },
            { text: "队列", link: "/algorithm/queue/" },
          ],
        },
      ],
      "/interview/": [
        {
          text: "面试题",
          items: [
            { text: "js", link: "/interview/" },
            { text: "css", link: "/interview/css" },
            { text: "浏览器", link: "/interview/browser" },
            { text: "网络", link: "/interview/network" },
            { text: "vue", link: "/interview/vue" },
            { text: "react", link: "/interview/react" },
            { text: "ts", link: "/interview/ts" },
            { text: "node", link: "/interview/node" },
            { text: "工程化", link: "/interview/engineering" },
            { text: "算法", link: "/interview/algorithm" },
            { text: "AI", link: "/interview/ai" },
            { text: "其他", link: "/interview/other" },
          ],
        },
      ],
      "/ai/": [
        {
          text: "Ai",
          items: [{ text: "基本概念", link: "/ai/" }],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/7mus1c" }],
  },
});
