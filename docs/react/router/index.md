官方文档：[https://reactrouter.com/en/main](https://reactrouter.com/en/main)

6.4的版本，不再支持 Class 组件。并且有了数据路由，颠覆了传统模式，核心是为了性能。

# 什么是路由？
1. 多页面：传统模式。
2. 单页面：是以vue、react为代表的项目。

# 环境准备
```bash
npm install react-router-dom
```

# BrowserRouter 
使用这种路由模式，后台需要做一些配置。

问题：在使用这种路由的时候，会遇到404的问题。

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 性能分析
import reportWebVitals from './reportWebVitals';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Bpp = () => {
  return <div>Bpp</div>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename="pc">
    <Routes>
      <Route path="/app" element={<App />} />
      <Route path="/bpp" element={<Bpp />} />
    </Routes>
  </BrowserRouter>
);
```

# HashRouter
访问：`http://localhost:3000/#app` 和 `http://localhost:3000/#bpp`

缺陷：

1. 路径比较丑陋
2. 后期要改造服务端渲染不方便

```jsx
root.render(
  <HashRouter>
    <Routes>
      <Route path="/app" element={<App />} />
      <Route path="/bpp" element={<Bpp />} />
    </Routes>
  </HashRouter>
);
```

# MemoryRouter
内存型路由。

场景：单元测试。

# NativeRouter
顾名思义，react-native 去使用的。

# staticRouter
静态路由

它是给 node 环境进行服务端渲染使用的。node 没有 window 所以它用不了 BrowserRouter。 BrowserRouter 是基于 window.history 实现的。

# Outlet
相当于一个占位符，只有当匹配到 /bpp 的时候才会在 app 组件相应的地方(<Outlet />)显示 bpp 的组件。

比如要实现一个管理后台的 layout 通用的头部和菜单栏。就可以使用这个

```jsx
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <>
      hello world <Outlet />
    </>
  );
}
```

```jsx
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/bpp" element={<Bpp />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
```

# useLocation
它用于访问当前的路由位置（location）对象。这个对象包含了当前页面的 URL 信息，例如路径（pathname）、搜索参数（search）、状态（state）和键（key）。

```jsx
import { Outlet, useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation();
  console.log(location);
  return (
    <>
      Layout <Outlet />
    </>
  );
}

export default Layout;
```

# useNavigate
路由跳转

```jsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

function Layout() {
  const location = useLocation();
  console.log(location);

  const navigate = useNavigate();

  return (
    <>
      Layout <Outlet />
      <button onClick={() => navigate('/app')}>app</button>
      <button onClick={() => navigate('/bpp')}>bpp</button>
    </>
  );
}

export default Layout;
```

## 路由传 state
路由传递state, 通过 useNavigate 的第二个参数 传递一个 state 给 /app 的路由，App 组件通过 useLocation 拿到。

```jsx
import { Outlet, useNavigate } from 'react-router-dom';

function Layout() {

  const navigate = useNavigate();

  return (
    <>
      Layout <Outlet />
      <button onClick={() => navigate('/app', { state: { name: '张三' }  })}>app</button>
      <button onClick={() => navigate('/bpp')}>bpp</button>
    </>
  );
}

export default Layout;
```

```jsx
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  console.log(location);

  return <>hello world {location.state.name}</>;
}

export default App;
```

## 返回上一个页面
```jsx
function Bpp() {
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate(-1)}>返回</button>
    </>
  );
}
```

# 动态路由和 useParams
通过 `<Route path="/user/:id" element={<User />} />` 来设置这个路由是动态的，且必须传 id。

然后用 useParams 来获取传输过来的 id。

```jsx
const User = () => {
  const params = useParams();
  return <div>Userid: {params.id}</div>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/app" element={<App />} />
        <Route path="/bpp" element={<Bpp />} />
        <Route path="/user/:id" element={<User />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
```

嵌套

```jsx
const User = () => {
  const params = useParams();
  return <div>Userid: {params.id} name: {params.name}</div>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/app" element={<App />} />
        <Route path="/bpp" element={<Bpp />} />
        <Route path="/user/:id/:name" element={<User />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
```

# useSearchParams 
## 获取查询参数
获取路由?之后的参数。

比如说访问 /app?name=username

```jsx
import { useSearchParams } from 'react-router-dom';

function Layout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get('name');
  console.log(name);

  return (
    <>
      {name: name}
    </>
  );
}
```

## 设置查询参数
```jsx
import { useSearchParams } from 'react-router-dom';

function Layout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get('name');
  console.log(name);

  return (
    <>
      {name: name}
      <button onCLick={() => setSearchParams({name: '张三'})}>设置参数</button>
    </>
  );
}
```

# Link 标签
也可以设置路由跳转

```jsx
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  return (
    <>
      Layout <Outlet />
      <button onClick={() => navigate('/app', { state: { name: '张三' }  })}>app</button>
      <button onClick={() => navigate('/bpp')}>bpp</button>
      <button>
        <Link to={'/user/123'}>user</Link>
      </button>
    </>
  );
}
```

# useMatch 路由匹配
它用于 当前页面的路由 和 设置的路由有没有匹配上。

如果没有匹配上就返回一个 null。

如果匹配上了，就返回匹配的路由信息。

```jsx
import { useLocation, useMatch } from 'react-router-dom';

function App() {
  const location = useLocation();
  console.log(location);

  const match = useMatch('/app');
  console.log(match);

  return <>hello world {location.state.name}</>;
}
```

# createBrowserRouter
创建一个路由实例。

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout';

const Bpp = () => {
  return <div>Bpp</div>;
};

const User = () => {
  return <div>Userid: 123</div>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />
  },
  {
    path: '/app',
    element: <App />
  },
  {
    path: '/bpp',
    element: <Bpp />
  },
  {
    path: '/user',
    element: <User />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RouterProvider router={router} />);
```

# 数据路由
## loader 和 useLoaderData
路由中有一个参数叫 loader 可以去发起请求拉取数据, 在 user 页面中使用 useLoaderData 获取数据。

Loader 有一个参数，他是一个对象:

1. Context：一个可选的上下文对象,可用于在多个 loader 之间共享数据
2. Params：动态路由的参数 比如 /user/:id:/name 的 id 和 name。
3. Qurey: 请求的实例，包含当前请求的信息,如 URL、方法等。

```jsx
import { createBrowserRouter, RouterProvider, useLoaderData } from 'react-router-dom';
import Layout from './layout';

const Bpp = () => {
  return <div>Bpp</div>;
};

const User = () => {
  const res = useLoaderData();
  console.log(res);
  return (
    <>
      <h1>UseridList</h1>
      {res.map(item => (
      <div key={item.id}>{item.title}</div>
    ))}
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />
  },
  {
    path: '/app',
    element: <App />
  },
  {
    path: '/bpp',
    element: <Bpp />
  },
  {
    path: '/user',
    loader: params => {
      console.log('params', params);
      return fetch('https://jsonplaceholder.typicode.com/posts');
    },
    element: <User />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RouterProvider router={router} />);
```

## 获取地址栏 query参数
 也就是获取 ？ 之后的参数

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />
  },
  {
    path: '/app',
    element: <App />
  },
  {
    path: '/bpp',
    element: <Bpp />
  },
  {
    path: '/user',
    loader: ({ request }) {
      const url = new URL(request.url);
      const searchTerm = url.searchParams.get("userId");
      return fetch(`/api/user/${searchTerm}`);
    },
    element: <User />
  }
]);
```

## 开启分包（懒加载）
```jsx
const App = React.lazy(() => import('./App.js'));
```

## 并行拉取数据和分包
:::warning
通过 loader拉取数据 和 lazy 加载分包。可以做到并行加载。

注意 CreateBrowserRouter 没有 lazy 属性，所以不可以直接使用。

但是 createRoutesFromElements 是有 lazy 的，但是写法不一样。详细见 https://reactrouter.com/en/main/route/lazy#lazy

:::

```jsx
const App = React.lazy(() => import('./App'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/app',
        loader: params => {
          console.log('params', params);
          return fetch('https://jsonplaceholder.typicode.com/posts');
        },
        element: <App />
      },
      {
        path: '/bpp',
        element: <Bpp />
      },
      {
        path: '/user/:id',
        loader: params => {
          console.log('params', params);
          return fetch('https://jsonplaceholder.typicode.com/posts');
        },
        element: <User />
      }
    ]
  }
]);
```

# 面试题
## 单页面和多页面有什么区别？
:::warning
1. Spa: 就是 vue 和 react 这种，通过路由来管理页面导航
2. Mpa：就是传统的一个页面是一个 html 文件这种形式
3. spa 页面之间切换不需要重新加载整个页面，mpa 页面之间切换需要重新加载整个页面
4. spa 首次加载很慢，但是切换页面就很快，它只需要加载需要的资源。map 切换页面就有可能很慢，它需要加载所有html css js。
5. Spa 的话 SEO 很难，因为它的内容都是 js 动态生成的，MPA 就恰恰相反所以 SEO 更简单。

:::

## react-router 和 react-dom-router 有什么区别？
:::warning
实际上 react-router-dom 是浏览器使用的库，内部是依赖 react-router 这个库的。

:::

## BrowserRouter 配置的过程中有没有什么坑？
:::warning
需要后台配合，否则会出现404。

服务端在返回资源的时候什么时候返回接口数据，什么时候返回 index.html。这个时候服务端是不知道的，他需要配置一个 /api 这样的通配符。来获取到是获取接口数据还是路由访问。

:::

## Router 有几种？
:::warning
有5种，BrowserRouter、HashRouter、MemoryRouter、NativeRouter、StaticRouter。

:::

## 如何通过路由传参？
:::warning
通过 useNavigate 的 state 参数传递，在对应的路由页面通过 useLocation 去获取。

:::

## 路由跳转有几种方式？
:::warning
有两种：

1. useNavigate
2. Link 标签

:::

## V6.4 带来了哪些全新的特性？
:::warning
带来了数据路由，使 UI 和数据保持同步，解决了 UI 渲染和数据状态之间的关系，多了一层状态的抽象。之前的项目都是路由切换->加载页面->加载分包->拉取数据 -> 页面渲染。

但是有了数据路由之后，路由切换->加载页面 = 加载分包 = 拉取数据（三步同时执行） -> 页面渲染。

:::

## Router V6.4 解决的核心问题？
:::warning
它就是为解决瀑布流而生的。

可以实现，并行加载：

1. 路由对应的 ui 页面或组件
2. 分包组件的 js
3. 拉取组件或者页面所需要的数据

核心：并行加载资源

:::

## 数据路由感觉写起来比较麻烦?
:::warning
1. 缺点：将数据耦合到 UI 中，增加了项目的耦合性，维护成本升高。
2. 优点：带来了直观的性能提升。
3. 所以说这个世界上没有完美的解决方案。

推荐方案：

1. 传统路由模式结合数据路由
    1. 性能没有问题的页面用传统模式 （90%）
    2. 对性能要求比较高的可以考虑用数据路由优化 （10%）

:::

