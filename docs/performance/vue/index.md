# Vue 性能优化

## 路由懒加载

```js
const routes = [
  {
    path: "/home",
    component: () => import(/* webpackChunkName: "home" */ "./views/Home.vue"),
  },
];
```

## 组件异步加载

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComp />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from "vue";

const AsyncComp = defineAsyncComponent(() =>
  import("./components/MyComponent.vue")
);
</script>
```

## 使用 v-if 替代 v-show

除非频繁切换，否则使用 v-if 替代 v-show。避免重复销毁和创建 DOM 节点。

## 释放内存资源

onUnmounted 中清理定时器、事件监听器等，释放内存，防止内存泄漏。

```js
import { onUnmounted } from "vue";

onUnmounted(() => {
  // 清理定时器
  clearInterval(timer);
  // 移除事件监听器
  document.removeEventListener("click", handleClick);
});
```

## computed 存储缓存

使用 computed 存储计算结果，避免重复计算。

```js
import { computed, ref } from "vue";
const count = ref(1);
const doubleCount = computed(() => count.value * 2);
```

## 只渲染一次的内容 v-once

对于只渲染一次的内容，可以使用 v-once 指令，避免重复渲染。组件重新渲染会跳过 v-once 指令的代码。

## 缓存模板子树

渲染海量节点时，使用 v-memo 指令缓存模板子树，避免重复渲染。

```vue
<template>
  <ul>
    <li
      v-for="item in list"
      :key="item.id"
      /*
         只有当 item.id 等于 selectedId 的状态发生变化时，
         这一行对应的 DOM 才会重新比对更新。
         其他项将直接沿用上次的缓存。
      */
      v-memo="[item.id === selectedId]"
    >
      {{ item.name }} - {{ item.id === selectedId ? '【选中】' : '' }}
      <button @click="selectedId = item.id">选中我</button>
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'

const selectedId = ref(1)
const list = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }))
)
</script>
```

当组件的 selected 状态改变，默认会重新创建大量的 vnode，尽管绝大部分都跟之前是一模一样的。
v-memo 用在这里本质上是在说“只有当该项的被选中状态改变时才需要更新”。这使得每个选中状态没有变的项能完全重用之前的 vnode 并跳过差异比较。

## store 拆分

避免在 store 中存储过多的临时状态，可以将 store 拆分成多个 store。

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMainStore = defineStore("main", () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  return {
    count,
    doubleCount,
  };
});

export const useUserStore = defineStore("user", () => {
  const name = ref("");
  const age = ref(0);

  return {
    name,
    age,
  };
});
```
