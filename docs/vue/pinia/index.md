# Pinia

[官方网址](https://pinia.vuejs.org/zh/)
什么是pinia？
Pinia 是 Vue 的专属状态管理库，它允许你跨组件或页面共享状态。

## 核心概念

Pinia 的核心概念包括状态（State）、动作（Actions）和获取器（Getters）。这些概念为你提供了一种组织和管理应用状态的方式。

```js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    // id:'user' 另外一种写法 可以省略第一个参数
    state: () => {
        return {
            name: '李四'
        };
    },
    getters: {
        nameLength: state => state.name.length
    },
    actions: {
        setName(name: string) {
            this.name = name;
        }
    }
});
```

## 安装

```bash
npm install pinia
```

## 配置

```js
import { createPinia } from "pinia";

const pinia = createPinia();

export default pinia;
```

## 挂载

```js
import pinia from "./store";

createApp(App).use(pinia).mount("#app");
```

## 创建

```js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  let name = ref("张三");

  const setName = (newName) => {
    name.value = newName;
  };

  return {
    name,
    setName,
  };
});
```

## 使用

```vue
<script setup>
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();
// 此时userStore 并不是响应式数据 需要变成响应式的
const { name } = storeToRefs(userStore);
// 方法不需要是响应式的 storeToRefs 不会去处理方法 需要去userStore结构
const { updateName } = userStore;

const handleClick = (type) => {
  if (type) {
    updateName("李四");
  } else {
    // 第二种调用action方法的方式
    userStore.$patch({ name: "王二麻子" });
  }
};
</script>

<template>
  <div>用户名: {{ name }}</div>
  <div>用户名长度: {{ name.length }}</div>
  <el-button @click="handleClick(true)">改变用户名</el-button>
</template>
```
