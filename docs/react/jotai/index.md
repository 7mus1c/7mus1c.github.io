# jotai

## jotai 是什么？

jotai 是一个用于 react 的状态管理库，它使用原子（atom）的概念来管理状态。

## jotai 的特点

- 原子化状态管理：状态被分解为最小单位"原子"(atom)
- 无模板代码：没有 reducer/action/provider 的样板代码，使用起来非常简洁
- React 式：像 useState 一样自然，但可跨组件共享

```js
// 传统思维：集中状态
const store = { user: {}, settings: {}, cart: [] };

// Jotai思维：分散原子
const userAtom = atom({});
const settingsAtom = atom({});
const cartAtom = atom([]);
```

## jotai 的使用

### 安装

```bash
npm install jotai

# pnpm
pnpm add jotai
```

### 基本用法

```jsx
import { atom, useAtom } from "jotai";

// 创建原子（全局定义，但无状态）
const countAtom = atom(0); // 初始值

function Counter() {
  const [count, setCount] = useAtom(countAtom);

  return <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>;
}
```

### 原始 Atom

```js
const textAtom = atom("hello");
```

### 派生类型的 Atom

```js
// 只读
const lengthAtom = atom((get) => get(textAtom).length);

// 可写
const upperTextAtom = atom(
  (get) => get(textAtom).toUpperCase(),
  (get, set, newValue) => set(textAtom, newValue.toLowerCase())
);

// 在组件中使用
function Text() {
  const [text, setText] = useAtom(textAtom);
  const [length] = useAtom(lengthAtom);
  const [upperText, setUpperText] = useAtom(upperTextAtom);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <div>Length: {length}</div>
      <div>Upper Text: {upperText}</div>
      <button onClick={() => setUpperText(text)}>Set Upper Text</button>
    </div>
  );
}
```

### 异步派生类型的 Atom

```js
const fetchUserAtom = atom(async (get) => {
  const id = get(userIdAtom);
  const res = await fetch(`/api/user/${id}`);
  return res.json();
});

// 在组件中使用
function User() {
  const [user] = useAtom(fetchUserAtom);
  return <div>{user.name}</div>;
}
```

### 只读只写

当 atom 的值为只允许读或写时，要使用 `useAtomValue` 和 `useSetAtom` 这两个 hook 来 优化重新渲染的效率。

```jsx
// 在同一个组件中读写
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

const animeAtom = atom([
  {
    title: "One Piece",
    year: 1999,
    watched: false,
  },
]);

// 在不同组件中读取和写入
import { useAtomValue, useSetAtom } from "jotai";

const AnimeList = () => {
  const anime = useAtomValue(animeAtom);

  return (
    <ul>
      {anime.map((item) => (
        <li key={item.title}>{item.title}</li>
      ))}
    </ul>
  );
};

const AddAnime = () => {
  const setAnime = useSetAtom(animeAtom);

  return (
    <button
      onClick={() => {
        setAnime((anime) => [
          ...anime,
          {
            title: "Cowboy Bebop",
            year: 1998,
            watched: false,
          },
        ]);
      }}
    >
      Add Cowboy Bebop
    </button>
  );
};
```

### 持久化

使用 `atomWithStorage` 可以将状态持久化到本地存储中。

```js
import { atomWithStorage } from "jotai/utils";

const atom = atomWithStorage(key, initialValue, storage, options);
const themeAtom = atomWithStorage("theme", "light");
```

- key (必需): 存储的唯一标识符
- initialValue (必需): 默认值
- storage (可选): 自定义存储对象，默认使用 localStorage
- options (可选): 配置对象，如 { getOnInit: boolean }

### TypeScript

```ts
import { atom } from "jotai";

const countAtom = atom<number>(0);
const countAtom = atom<number | undefined>(undefined);
const countAtom = atom<number | null>(null);
const countAtom = atom<number | undefined>(undefined, (get, set) => {
  const count = get(countAtom);
  set(countAtom, count + 1);
});
```

### 复位 Atom

```js
import { useAtom } from "jotai";
import { atomWishReset, useResetAtom } from "jotai/utils";

const todoListAtom = atomWithReset([
  { description: "Add a todo", checked: false },
]);

const TodoList = () => {
  const [todos, setTodos] = useAtom(todoListAtom);
  const resetTodos = useResetAtom(todoListAtom);

  return (
    <>
      <ul>
        {todoList.map((todo) => (
          <li>{todo.description}</li>
        ))}
      </ul>

      <button
        onClick={() =>
          setTodos((todos) => [
            ...todos,
            { description: "New todo", checked: false },
          ])
        }
      >
        Add Todo
      </button>
      <button onClick={resetTodos}>Reset</button>
    </>
  );
};
```

## immer

Immer 是一个处理不可变状态的 JavaScript 库，核心思想是：让你用"可变"的写法，自动产生不可变的结果。

### 问题背景

在 React 中，状态是不可变的，更新嵌套对象非常繁琐：

```js
// ❌ 直接修改（违背 React 原则）
const newState = state;
newState.user.profile.name = "New Name";

// ✅ 正确但繁琐（深拷贝）
const newState = {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      name: "New Name",
    },
  },
};
```

### immer 解决方案

#### 安装 immer

```bash
npm i immer jotai-immer
```

#### 使用 immer

```jsx
import { atomWishImmer } from "jotai-immer";

const userAtom = atomWithImmer({
  name: "Lee",
  age: 30,
  tags: ["developer"],
});

function Profile() {
  const [user, setUser] = useAtom(userAtom);

  const updateName = () => {
    setUser((draft) => {
      draft.name = "New Name"; // 直接修改 draft
      draft.age += 1;
    });
  };

  const addTag = (tag) => {
    setUser((draft) => {
      draft.tags.push(tag); // 直接 push，无需展开运算符
    });
  };

  return (
    <>
      <button onClick={()=> updateName()}>update</button>
      <button onClick={()=> addTag("tag")}>add tag</button>
    </>
  );
}
```
