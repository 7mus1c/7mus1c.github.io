import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "李程Lc",
  description: "一个有点作用的博客",
  base: '/',
  themeConfig: {
    logo: "https://vitepress.dev/vitepress-logo-mini.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "React", link: "/react/", activeMatch: "^/react/" },
      { text: "Vue", link: "/vue/", activeMatch: "^/vue/" },
      { text: "TypeScript", link: "/typescript/", activeMatch: "^/typescript/" },
      { text: "项目工程化", link: "/engineering/", activeMatch: "^/engineering/" },
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
      "/engineering/": [
        {
          text: "项目工程化",
          items: [
            { text: "webpack", link: "/engineering/webpack" },
            { text: "vite", link: "/engineering/vite" },
            { text: "monorepo", link: "/engineering/monorepo" }
          ]
        }
      ],
      "/algorithm/": [
        {
          text: "算法",
          items: [
            { text: "排序算法", link: "/algorithm/sort" },
            { text: "二分查找", link: "/algorithm/binarySearch" },
            { text: "动态规划", link: "/algorithm/dp" },
          ],
        }
      ],
      "/interview/": [
        {
          text: "面试题",
          items: [
            { text: "js", link: "/interview/" },
          ]
        }
      ],
      "/ai/": [
        {
          text: "Ai",
          items: [
            { text: "基础用法", link: "/ai/" },
          ]
        }
      ]
    },

    socialLinks: [{ icon: "github", link: "https://github.com/7mus1c" }],
  },
});
