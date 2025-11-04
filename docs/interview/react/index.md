


# 面试题
## React 和 react-dom 的区别？为什么有两个库？
1. react：这是 react 的核心，它定义了 react 组件的创建和生命周期方法，以及 react 元素的概念，可以将它视为 react 的引擎。
2. React-dom：这个库提供了浏览器环境或者 node 环境中使用 react 的方法，例如将 react 组件渲染到 Dom 中，或者在 Dom 中触发 React 组件的更新。可以将它视为 react 的驱动程序。
3. React-dom/client：是浏览器渲染用的库
4. React-dom/server：是node环境用的库
5. 有两个库是因为要功能解耦，渲染有渲染专用的包，引擎只负责引擎。


## React 是框架吗？
React 的核心是一个渲染的库。为什么是一个渲染的库，其实就是它将两个包去做了拆分。


## React 严格模式的作用
1. 不安全的生命周期：会警告未来将遗弃的生命周期
2. 使用过时的或者遗留的API：会警告当前使用了过时或者遗留的API
3. 意外的副作用：会发现组件中可能的意外副作用
4. 与新版本React不兼容的代码：会警告代码中可能与未来版本不兼容的部分


## JSX 的作用？
1. 可以在 js 中返回 DOM，经过babel 编译成 js 能够识别的代码。
2. JSX 在 React 底层中也就是 react/jsx-runtime 会提供一个`_jsx` 的编译方法，babel 帮我们进行默认的编译。
3. _jsx 编译方法有两个参数
    1. 第一个参数：标签名
    2. 第二个参数：子元素以及标签上的一些属性


## getDerivedStateFromProps 的作用是什么？
1. 它的返回值会对即将渲染的 state 相同属性进行覆盖。如果返回空对象或者 null，将不进行任何更新。
2. 它的执行时机是挂载时和更新时，在 render 之前去执行。


## getSnapshotBeforeUpdate 的特点？
执行时机：它只会在更新时执行，它在 `render` 方法之后和实际的 DOM 更新之前执行。

它的参数有两个：

+ `prevProps`: 表示上一次渲染时的 props。
+ `prevState`: 表示上一次渲染时的 state。

它的作用：返回值可以传递给`componentDidUpdate`使用。

使用场景：获取滚动位置或记录表单输入的当前状态。


## react 的更新是同步还是异步？为什么？
react的更新是异步的，因为 react 的更新时的异步（微任务）队列，会将短时间的 js 对组件的修改合并，1次渲染。


## useEffect 的回调函数执行时机？
它的执行时机分为三种：

1. 依赖项不传入时：挂载和更新都会执行
2. 传入空数组时：只有挂载时会去执行
3. 传入有依赖项时：挂载和更新都会去执行


## useEffect 回调函数的返回函数执行时机？
1. 卸载时会执行
2. 依赖项更新会执行
3. 更新的执行，实际上也是用于卸载操作


## Hooks 的钩子为什么写在顶级作用域？
因为组件内的 hooks 是用单向链表结构来进行连接的，通过 next 属性进行连接的。如果中间的断开，会导致指针找不到下一个节点。


## useEffect 和 useLayoutEffect 的区别？
1. useEffect 是在 commit 阶段，也就是 js 操作 DOM 之前调用，但是在浏览器渲染完成之后执行回调，它是异步的。
2. useLayoutEffect 是 js 操作完 DOM 之后浏览器渲染之前调用，它是同步执行的。


## useLayoutEffect 的应用场景？
1. 比如在更新前调整元素的尺寸或位置
2. React 的异步更新可能导致布局问题。如果这些布局问题需要，`useLayoutEffect`可以用来立即修复这些问题。


## useMemo 的应用场景？
它是用于 react 渲染中的性能优化

使用场景：父组件要进行更新，子组件的重新 render 计算量比较大，而且结果可以复用。就可以用 useMemo 来提升父组件引起的不必要渲染。


## 该在哪些地方使用 useMemo？
一定是在不得已用才使用。比如当组件渲染过程中涉及到昂贵的计算或者操作时。因为：

1. useMemo 本身有性能消耗，缓存消耗内存，包括 useMemo 自身状态的维护也是有性能开销的。
2. useMemo 会增加开发成本，让代码变复杂，不好维护。
3. 官方会在未来取消 useMemo 这个钩子。


## React 的渲染规律？
只要父组件进行了 setState，父组件会重新 render， 所有子组件也会重新 render。


## useMemo 和 useCallback 的区别？
实际上没有本质的区别，只是一个用于缓存函数，一个用于缓存数据。

纯粹为了代码的可维护性。


## forwardRef 的作用？
实际上函数式组件是没有 ref 的，如果想拿到子组件的 DOM 实例，就可以通过 forWardRef。


## useContext 的作用？
1. 主要是用于跨组件传值。
2. 核心是父组件的 provider 包裹，给所有的子组件注入上下文。子组件就可以通过 useContext 拿到顶层组件注入的值。
3. 一般修改状态，可以把状态和修改函数一并传入。


## React 并发更新的作用？
1. 基于 fiber 数据结构进行细粒度的任务拆分。
2. 在浏览器空闲时间执行，用的 requestIdleCallback 的思想。
3. 因为 requestIdleCallback 兼容性不好，所以 react 使用 postMessage 去模拟实现的。它是宏任务的异步。


## useTransition 和 useDeferredValue 的区别？
1. 解决的问题都是一样的，只是应用场景有点细微区别。
2. useDeferredValue 比较适合用于组件接收的 props 参数导致渲染缓慢的优化。
3. useTransition 比较适合组件内部本来进行优化。

场景：

1. 一个组件是我开发的提供给别人使用的，但是我希望别人使用的时候是性能不错的，就可以使用 useTransition。
2. 我拿来一个别人开发的组件来使用，但是想优化这个组件的性能，把它变成低优先级的，就可以使用 useDeferredValue。


## React Hook 一定要写在顶层作用域吗？
不是的，比如说 use 这个hook 就不用。这是一个特殊的存在。


## useDebugValue 的作用？
可以利用调试工具，做组件级别的debug。全部用console堆在一起，不方便。需要开启严格模式


## useId 的应用场景？
在组件库或大型应用中，可能会动态渲染多个相同类型的组件，使用 `useId` 可以为这些组件生成唯一的 `id`，避免 ID 冲突。

为什么不能用随机数？

Node端去做服务端渲染的时候，需要确保Node端生成ID和浏览器的保持一致。


## useImperativeHandle 的应用场景？
作用：自定义转发出去的 ref。

场景：我不希望开发者去直接操作 DOM，你用我给你定义好的就行。


## useInsertionEffect 的应用场景？
如果需要使用 js 插入 style 标签，可以使用这个钩子。


## useSyncExternalStore 的作用？
解决状态撕裂的问题。


