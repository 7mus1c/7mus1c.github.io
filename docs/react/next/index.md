# Next基础用法
## 路由

nextjs 的路由是基于文件的，所以路由的配置就是文件目录的配置。路由的配置文件是`app`目录下的文件。

### 静态路由

在 `app` 目录下创建一个文件夹，文件夹的名称就是路由的名称，文件夹中的`page.tsx`文件就是路由的页面。

比如在 `app` 目录下创建一个`dashboard`文件夹，文件夹中的`page.tsx`文件就是路由的页面。访问`/dashboard`就是访问这个页面。

#### 子路由

在路由的文件夹下创建一个新的文件夹，那么新的文件夹就是子路由。

比如在`dashboard`文件夹中创建一个`users`文件夹，那么访问`/dashboard/users`就是访问这个页面。

### 动态路由

现在我们要创建一个动态路由，动态路由就是路由的名称中有变量，比如`/users/[id]`，`[id]`就是变量，变量的值就是路由的名称。比如`/users/1`，`/users/2`，`/users/3`等等。

所以我们需要在`users`文件夹下创建一个`[id]`文件夹。

在通过访问`users/1`，`users/2`，`users/3`的时候，通常还要获得这个 id，通过 id 去查询用户信息等一系列操作。

那么需要通过函数的参数去获取：

```tsx
type Params = Promise<{ id: string }>;
export default async function UserPage({ params }: { params: Params }) {
  const { id } = await params; // 文件夹 [id] 所以这里是id
  return <div>User,user id - {id}</div>;
}
```

### 路由跳转

在 next 中不要使用`a href`,因为这会触发浏览器刷新，重新加载资源。会破坏客户端路由状态。同时会破坏 nextjs 的自动预加载。nextjs 会自动预加载的`Link`组件所在页面资源（用户鼠标悬停时触发），大幅提升速度。

所以 next 使用 `Link` 组件，通过`Link`组件进行路由跳转。

```tsx
<Link href="/dashboard/users">路由跳转</Link>
```

## 布局

在`app`文件夹下，有一个`layout.md`文件，这个文件是所有页面的父级，它将所有页面包裹起来，并定义了页面的样式。

可以理解为平常 react 项目的`index.html`文件。

但是其他文件夹下的`layout.tsx`是在**多个页面之间共享的 UI。并且保留状态，保持交互性，并且不会重新渲染**。

比如说：`layout.tsx`内包含一个侧边栏，它将所在路由的所有页面都会存在，并且切换页面后保持侧边栏的状态，保持交互性，并且不会重新渲染。

例如：

```tsx
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Nav For Dashboard</h1>
      {children}
    </div>
  );
}
```

`children`是子组件，也就是页面内容，`children`会渲染到`<div>`标签内。

`h1`标签也会在所有以`/dashboard`的页面下显示。`/dashboard`，`/dashboard/settings`，`/dashboard/users`，`/dashboard/users/1`。

## 路由组

有些时候我们不可能共用同一套布局，比如说登录注册。登录注册页面不需要导航栏，所以我们需要创建一个新的布局。

那此时就需要使用路由组来进行隔离。路由组就是将路由进行分组，每个路由组都有自己的布局。

通过新建文件夹`(auth)`，再在文件夹下创建`login`和`register`文件夹。此时访问并不需要`/auth/login`，`/auth/register`，而是直接访问`/login`，`/register`。因为路由组的文件夹并不会创建 url 的链接。

## 服务端组件和客户端组件

什么是服务器组件？服务器组件是一种只在服务器上运行的组件，这也意味着可以在服务器组建中获取数据。

服务器组件只能在服务器上运行，它不会发送任何 js 的包，所以服务器组件非常快。因为没有 js 包，所以项目最后的打包会很小。

但是服务器组件不能使用需要交互的功能和浏览器 API，因为这需要 js，而服务器组件不会编译出任何 js 的包，输出纯 HTML。

什么是客户端组件？客户端组件就是可以使用交互式 UI 的服务器预渲染的组件。要使用客户端组件需要在页面开头添加`use client`。

Next.js 的服务端组件和客户端组件是用于优化渲染逻辑的两种组件模式：

服务端组件：

运行环境：仅在服务端渲染，不向浏览器发送 JavaScript。

用途：处理数据获取、访问敏感资源（如数据库）、生成静态内容，适合 SEO 优先页面。

特点：无法使用 useState 等客户端 API，输出纯 HTML。

客户端组件：

运行环境：在浏览器中运行，支持交互。

用途：处理用户交互（如表单、动画）、使用浏览器 API（如 localStorage）。

特点：需添加 'use client' 指令，支持 React 状态和生命周期。

核心差异：服务端组件减少客户端代码量，提升首屏性能；客户端组件实现动态交互。两者可嵌套使用（如服务端组件包裹客户端组件传递初始数据）。

### 服务端组中使用客户端组件

```tsx
"use client"; // 这个指令表示这是一个客户端组件

import { useState } from "react";

export default function ClientComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

import ClientComponent from "./ClientComponent";

export default async function ServerComponent() {
  return (
    <div>
      <h1>Server Component</h1>
      <p>This is a server component.</p>
      {/* 使用客户端组件 */}
      <ClientComponent />
    </div>
  );
}
```

## 获取数据

```tsx
type Post = {
  id: string;
  title: string;
};

const getblog = () => {
  const data = await fetch("https://api.vercel.app/blog");
  const posts: Post[] = await data.json();
  return posts;
};

export default async function Page() {
  const posts = await getblog();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

不过 nextjs 更加推荐使用集中统一的管理请求的方式。而不是把每一个请求都放在页面里。

创建一个`data`文件夹来保存各种请求，然后在页面中引入。

`app/data/blog/getBlog.ts`

```ts
type Post = {
  id: string;
  title: string;
};

export async function getBlog() {
  const data = await fetch("https://api.vercel.app/blog");
  const posts: Post[] = await data.json();
  return posts;
}
```

```tsx
import { getBlog } from "@/app/data/blog/getBlog";

export default async function Page() {
  const posts = await getBlog();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

此时`getblog`就被管理了起来，`getblog`如果是获取的用户的私密数据，那么就需要让这个数据只能在服务端组件中使用。

通过`import "server-only";`来设置这个文件的方法只能在服务端使用。

## 渐进式 UI 渲染（流式传输）

在 nextjs 中可以在服务器加载路由的内容时，显示一个加载状态，一旦加载完成，新的内容就会自动替换进来。例如：骨架屏、占位图、loading 等。

在 nextjs 中实现流式传输有两种方法：

1. 使用`loading.tsx`；
2. 使用 react 的 `Suspense`；

`loading.tsx`和`page.tsx`在同一个层级。`loading.tsx`会默认页面加载时展示的内容，当然这是整个页面的加载状态。

`Suspense`就是单独某个组件的加载状态了。`fallback` 属性允许一个 jsx 来展示组件加载成功之前的展示效果。

```tsx
<Suspense fallback={<p>Loading feed...</p>}>
  <PostFeed />
</Suspense>
```

## Server Actions and Mutations

它是指只在服务端运行的异步函数，但是可被服务端和客户端组件调用。用于处理 Next.js 应用中的表单提交和数据变更。它可以无需通过 API 去获取数据，不会在网络调试中看到接口请求，比如它可以直接访问数据库数据而不通过接口。

它的声明方式有两种：

1. 在文件顶部声明`"use server"`，声明整个文件；
2. 在页面声明, 在函数内部声明`"use server"`，使得这个函数是服务端函数；

```tsx
export default function page() {
  async function create() {
    "use server";
  }

  return <div>page</div>;
}
```

```tsx
"use server";

export async function create() {}
```

```tsx
"use client";

import { create } from "./actions";

export function Button() {
  <ClientComponent create={create} />;

  return <button onClick={() => create()}>Create</button>;
}
```

**服务端函数可以通过 props 传递给客户端组件去使用，也可以通过 import 导入到客户端组件去使用**。

```tsx
// server Actions
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  // 验证数据
  if (!title || !content) {
    return { error: "标题和内容必填" };
  }

  // 执行数据库操作（Mutation）
  await db.post.create({
    data: { title, content },
  });

  // 重定向
  redirect("/posts");
}

// 客户端组件
("use client");

import { createPost } from "@/actions/post";

export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input type="text" name="title" />
      <textarea name="content" />
      <button type="submit">发布</button>
    </form>
  );
}
```

## 路由处理程序

路由处理程序就是生成标准 API 路由的，通过创建文件夹`app/api`来创建 api。

比如：访问`/api/users`，那么就需要在`api`文件夹下创建一个`route.ts`，然后通过设置`GET POST`等去处理接口请求。

```ts
import { NextResponse } from "next/server";

export async function GET() {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "password",
      role: "admin",
    },
    {
      id: 2,
      name: "Eric Json",
      email: "eric@example.com",
      password: "password",
    },
    {
      id: 3,
      name: "name is sayHello",
      email: "name@example.com",
      password: "password",
    },
  ];

  return NextResponse.json({ users });
}
```

如果要访问动态路由的话文件夹要跟之前的路由一样文件夹名称`[id]`，然后在目录下创建`route.ts`

```ts
import { NextResponse, NextRequest } from "next/server";

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "password",
    role: "admin",
  },
  {
    id: 2,
    name: "Eric Json",
    email: "eric@example.com",
    password: "password",
  },
  {
    id: 3,
    name: "name is sayHello",
    email: "name@example.com",
    password: "password",
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: userId } = await params;
  const user = users.find((item) => item.id === Number(userId));

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
```

## middleware

它本质是一个函数，用来处理请求到达服务器前和响应到达页面前拦截和处理。它主要用来修改请求和响应，比如：身份验证、权限校验、日志记录、AB 测试、地域限制等。

在根目录下创建`middleware.ts`, 通过 `matcher` 配置拦截范围。

```ts
import { NextResponse, NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken");

  // 未登录用户重定向到登录页
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", // 匹配 /dashboard 下所有路径
    "/((?!api|_next/static|favicon.ico).*)", // 排除特定路径
  ],
};
```

## 元数据

nextjs 提供了一个元数据的 API 来定义 html 的`meta`和`link`应该改善 seo。元数据分为静态元数据和动态元数据。

静态元数据是从`layout`或`page`里面通过导出`Metadata常量对象`来定义。

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "...",
  description: "...",
};

export default function Page() {}
```

动态元数据是通过导出`generateMetadata函数`来定义。

```tsx
import getUserInfo from "@/app/data/user/getUserInfo";
import type { Metadata } from "next";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserInfo(id);

  return {
    title: `${user.name} | dashboard`,
    description: user.email,
  };
}

export default async function UserPage({ params }: { params: Params }) {}
```

## 错误处理

使用`error.tsx`来处理错误的页面崩溃，它跟`page`、`layout`在同一个层级。等于使用一个错误 ui 展示，而不是一整个崩溃的页面。

```tsx
export default async function TestPage() {
  const res = await fetch("http://localhost:3000/api/users/abc").then((res) =>
    res.json()
  );
  if (!res.ok) {
    throw Error("错误了");
  }

  return <h1>测试错误处理</h1>;
}
```

```tsx
"use client"; // 错误边界必须是客户端组件
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 将错误记录到错误报告服务
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>出了点问题！</h2>
      <button
        onClick={
          // 尝试通过重新渲染段来恢复
          () => reset()
        }
      >
        重试
      </button>
    </div>
  );
}
```

## 缓存

nextjs 有 4 种缓存机制：

1. 请求记忆化
2. 数据缓存
3. 完整路由缓存
4. 路由器缓存

### 请求记忆化

说白了就是 fetch 请求缓存，在同一个页面渲染中，如果在不同的组件节点多次请求同一个接口，实际上只会发送一次网络请求，其余的请求都会使用已经缓存的数据。

```tsx
// lib/products.js
export const getProducts = async () => {
  const res = await fetch("https://mystoreapi.com/products");
  return res.json();
};

// app/product/page.tsx
import { getProducts } from "../../../lib/products";
import ProductList from "../productList/page";

const Product = async () => {
  const products = await getProducts(); // 第一次请求，会真正发起网络请求
  const totalProducts = products?.length;

  return (
    <div>
      <div>{`There are ${totalProducts} products in the store.`}</div>
      <ProductList />
    </div>
  );
};

export default Product;

// app/product/productList/page.jsx
import { getProducts } from "../../../lib/products";

const ProductList = async () => {
  const products = await getProducts(); // 第二次请求，数据将从缓存中读取，无需再次网络请求
  return (
    <ul>
      {products?.map(({ id, title }) => (
        <li key={id}>{title}</li>
      ))}
    </ul>
  );
};

export default ProductList;
```

### 数据缓存

数据缓存是一种持久化的服务器端缓存机制，用于存储通过 fetch 请求获取的数据结果，以减少重复请求数据源的开销。

通过扩展原生的 fetch API，Next.js 允许每个请求设置自己的持久缓存语义。可以使用 fetch 的 cache 和 next.revalidate 选项来配置缓存行为。

```ts
// 启用数据缓存并设置 1 小时重新验证
const data = await fetch("https://api.example.com/posts", {
  cache: "force-cache", // 启用数据缓存
  next: { revalidate: 3600 }, // 每小时刷新一次（缓存时间）
}).then((res) => res.json());

// 禁用缓存，每次请求都获取最新数据
const data = await fetch("https://api.example.com/real-time-stats", {
  cache: "no-store",
}).then((res) => res.json());

// 按需重新验证
import { revalidatePath } from "next/cache";

async function handleSubmit() {
  await fetch("/api/posts", { method: "POST", body: newPost });
  revalidatePath("/posts"); // 清除 `/posts` 路径的缓存
}
```

### 完整路由缓存

完整路由缓存是将整个页面（包含 HTML 和 RSC Payload）在构建时(`npm run build`)缓存起来。静态页面只需构建一次，然后就可以多次为用户提供相同页面的数据。这种缓存方式能带来接近纯静态文件的加载速度。

```tsx
// pages/blog/[slug].js
export async function getStaticPaths() {
  const posts = await fetch('https://api.example.com/posts');
  return { paths: posts.map(post => ({ params: { slug: post.slug } }), fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`);
  return { props: { post }, revalidate: 3600 }; // 缓存1小时
}
```

Next.js 在构建时预渲染所有 getStaticPaths 返回的路径，生成 HTML 和 RSC Payload，并存入完整路由缓存。

用户首次访问 /blog/my-post 时，直接返回缓存的静态内容，无需服务器实时渲染。

若 revalidate 时间（如 1 小时）到期，Next.js 会在后台重新生成页面并更新缓存。

```tsx
// app/dashboard/page.js
export const dynamic = "force-dynamic"; // 禁用完整路由缓存

async function DashboardPage() {
  const data = await fetch("https://api.example.com/real-time-data", {
    cache: "no-store",
  });
  return <div>{data}</div>;
}
```

动态渲染：`dynamic = 'force-dynamic'` 会跳过缓存，每次请求均动态渲染页面。

禁用数据缓存：`cache: 'no-store'` 确保每次 fetch 都从数据源获取最新结果。

### 客户端路由器缓存

路由器缓存是 Next.js 在客户端实现的一种缓存机制,它通过在客户端存储之前访问过的路由段的 RSC 负载来改善导航体验。当用户在路由之间导航时，Next.js 会检查路由器缓存中是否存储了 RSC 负载，如果存在，则跳过向服务器发送新请求。

简单来说就是 使用`next/link` 导航时，自动预加载目标页面代码，并缓存已访问的页面组件，实现快速切换。
