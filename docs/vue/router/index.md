# Vue-router

[官方网址](https://router.vuejs.org/zh/)
前端路由是指在不重新加载整个页面的情况下，通过改变 URL 来加载和显示不同的内容。

## 安装

```bash
npm install vue-router@4
#或者
npm create vue@latest
```

## 例子

```vue
<template>
  <h1>Hello App!</h1>
  <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
  <nav>
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/about">Go to About</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
```

## 创建实例

```js
import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "./HomeView.vue";
import AboutView from "./AboutView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/about", component: AboutView },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
```

## 注册路由

```js
import router from "./router";

createApp(App).use(router).mount("#app");
```

## 动态路由

```js
import User from "./User.vue";
// 这些都会传递给 `createRouter`
const routes = [
  // 动态字段以冒号开始
  { path: "/users/:id", component: User },
];
```

```vue
<template>
  <div>
    <!-- 当前路由可以通过 $route 在模板中访问 -->
    User {{ $route.params.id }}
  </div>
</template>
<script setup>
import { watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

watch(
  () => route.params.id,
  (newId, oldId) => {
    // 对路由变化做出响应...
    console.log(newId, oldId);
  },
);
</script>
```

## 嵌套路由

```vue
<!-- App.vue -->
<template>
  <router-view />
</template>

<!-- User.vue -->
<template>
  <div class="user">
    <h2>User {{ $route.params.id }}</h2>
    <router-view />
  </div>
</template>
<script setup>
const routes = [
  {
    path: "/user/:id",
    component: User,
    children: [
      {
        // 当 /user/:id/profile 匹配成功
        // UserProfile 将被渲染到 User 的 <router-view> 内部
        path: "profile",
        component: UserProfile,
      },
      {
        // 当 /user/:id/posts 匹配成功
        // UserPosts 将被渲染到 User 的 <router-view> 内部
        path: "posts",
        component: UserPosts,
      },
    ],
  },
];
</script>
```

## 编程式导航

```js
import { useRouter, useRoute } from "vue-router";

// 使用 useRouter 获取路由实例
const router = useRouter();

// 当前的路由地址
const route = useRoute();

// 字符串路径
router.push("/users/eduardo");

// 带有路径的对象
router.push({ path: "/users/eduardo" });

// 带查询参数，结果是 /register?plan=private
router.push({ path: "/register", query: { plan: "private" } });

// 回退
router.go(-1);
```
