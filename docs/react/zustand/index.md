# zustand

zustand 是一个状态管理库，它使用 Proxy 和 Reflect API 来实现状态管理，相比于 Redux，Zustand 的性能更高，并且更简单。
Zustand 的核心概念是 store，store 是一个对象，对象中的属性就是状态，对象中的方法就是操作状态的方法。

## 下载

```bash
npm install zustand
#或者
pnpm add zustand
```

## 基础使用

```ts
import { create } from "zustand";

interface UserState {
  name: string;
  age: number;
  setName: (name: string) => void;
  setAge: (age: number) => void;
}

const useUserStore = create<UserState>((set) => ({
  name: "张三",
  age: 18,
  setName: (name) => set({ name }),
  setAge: (age) => set({ age }),
}));

export default useUserStore;
```

```tsx
import { useUserStore } from "./store";

function UserProfile() {
  const { name, age, setName, setAge } = useUserStore();

  return (
    <div>
      <p>姓名：{name}</p>
      <p>年龄：{age}</p>
      <button onClick={() => setName("李四")}>修改姓名</button>
      <button onClick={() => setAge(20)}>修改年龄</button>
    </div>
  );
}
```

## immer

zustand 提供了 immer 插件，Immer 让你可以用可变的方式写不可变更新.

```ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// 定义User类型
interface User {
  id: string;
  name: string;
  age: number;
}

// 定义UserState类型
interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  addUser: (userData: Omit<User, "id">) => void;
}

// 更可靠的ID生成函数
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const useUserStore = create<UserState>(
  immer((set) => ({
    users: [],
    currentUser: null,
    loading: false,

    // ❌ 不使用 Immer - 复杂的手动不可变更新
    addUser: (userData) => {
      const newUser: User = {
        ...userData,
        id: generateId(),
      };
      set((state) => ({
        users: [...state.users, newUser],
      }));
    },

    // ✅ 使用 Immer - 简单的修改不可变更新
    addUser: (userData) => {
      set((state) => {
        const newUser: User = {
          ...userData,
          id: generateId(), // 自动生成唯一ID
        };
        state.users.push(newUser);
      });
    },
  })),
);
```

## 持久化

zustand 插件提供了 persist 插件，它可以将 store 持久化到本地存储中。

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface User {
  id: string;
  name: string;
}

interface userState {
  users: User[];
  addUser: (userData: User) => void;
}

const useUserStore = create<userState>()(
  immer(
    persist((set) => ({
      users: [],
      addUser: (userData) => {
        set((state) => {
          state.users.push(userData);
        });
      },
    })),
  ),
);
```
