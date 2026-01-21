# React 优化

## 分离重新渲染的代码

当组件重新渲染时，会重新执行函数组件，所有的子组件会重新渲染。那么就需要把只和状态有关的代码，和状态无关的代码分离出来。

```tsx
/* ❌ count发生改变会造成Text组件重新渲染 */
import { useState } from "react";

function Text() {
  return <p>这是一段普通文本。</p>;
}

function App() {
  const [count, setCount] = useState(0);

  const handleCountChange = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <Text />
      <p>Count: {count}</p>
      <button onClick={handleCountChange}>Increment</button>
    </div>
  );
}

/* ✅ 正确的做法是把跟状态相关的抽离 */

function Text() {
  return <p>这是一段普通文本。</p>;
}

function Count() {
  const [count, setCount] = useState(0);

  const handleCountChange = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleCountChange}>Increment</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <Text />
      <Count />
    </div>
  );
}
```

## 避免组件重新渲染

有些时候没办法抽离，那么就需要避免组件重新渲染。需要使用 React.memo 来避免组件重新渲染。
只要组件的 props 没有变化，那么组件就不会重新渲染。
React.memo 的原理是浅比较 props，如果 props 没有变化，那么组件就不会重新渲染。

```tsx
import { useState, memo } from "react";

const Text = memo((text: string) => {
  return <p>{text}</p>;
});

function App() {
  const [count, setCount] = useState(0);

  const handleCountChange = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <Text text="这是一段普通文本。" />
      <p>Count: {count}</p>
      <button onClick={handleCountChange}>Increment</button>
    </div>
  );
}
```

上面的例子是浅比较，如果 props 没有变化，那么组件就不会重新渲染。但是如果 props 是一个对象，那么浅比较就会导致组件重新渲染。因为他们引用的地址不一样，所以浅比较会认为 props 发生了变化。
那么就需要 useMemo 来避免组件重新渲染。

```tsx
import { useState, memo, useMemo } from "react";

const Text = memo((props: { title: string; text: string }) => {
  return (
    <>
      <h1>{props.title}</h1>
      <p>{props.text}</p>
    </>
  );
});

function App() {
  const [count, setCount] = useState(0);

  const handleCountChange = () => {
    setCount(count + 1);
  };

  const text = useMemo(() => {
    return {
      title: "这是标题",
      text: "这是一段普通文本。",
    };
  }, []);

  return (
    <div>
      <Text {...text} />
      <p>Count: {count}</p>
      <button onClick={handleCountChange}>Increment</button>
    </div>
  );
}
```

好了，现在组件就不会重新渲染了。但是如果组件上有方法怎么避免重新渲染呢？
useCallback 缓存函数，当依赖项不发生改变时，函数就不会重新创建。

```tsx
import { useState, memo, useMemo, useCallback } from "react";

const Child = memo((props: { onClick: () => void }) => {
  return <button onClick={props.onClick}>点击我</button>;
});

function App() {
  const [count, setCount] = useState(0);

  const handleCountChange = () => {
    setCount(count + 1);
  };

  const onClick = useCallback(() => {
    console.log("点击了");
  }, []);

  return (
    <div>
      <Child onClick={onClick} />
      <p>Count: {count}</p>
      <button onClick={handleCountChange}>Increment</button>
    </div>
  );
}
```

## 组件懒加载

使用 React.lazy 和 Suspense 来实现组件懒加载。

```tsx
import { lazy, Suspense } from "react";

const Child = lazy(() => import("./Child"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Child />
    </Suspense>
  );
}
```

## 数据预加载

react router 6 开始，允许路由在渲染组件之前预加载数据，使用 Loader 来实现。
当然 Loader 可以做很多其他的事，而不是简单的数据预加载。

```tsx
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
} from "react-router-dom";

async function homeLoader() {
  const res = await fetch(`/api/home`);
  if (!res.ok) throw new Response("Not Found", { status: 404 });
  return res.json();
}

const Home = () => {
  const data = useLoaderData();
  return <div>{data.title}</div>;
};

const router = createBrowserRouter([
  {
    path: "/",
    loader: homeLoader,
    element: <Home />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```
