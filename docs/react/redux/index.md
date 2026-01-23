# Redux
Redux 官方文档：[Redux - JavaScript 应用程序的状态容器，提供可预测的状态管理。 | Redux中文文档 | Redux中文网](https://www.reduxjs.cn/)

## 核心概念
Redux 是一个单向数据流的共享状态的 js 库，它是通过发布订阅的模式统一的状态。

## 数据流
+ actions 会在用户交互如点击时被 dispatch
+ store 通过执行 reducer 方法计算出一个新的 state
+ UI 读取最新的 state 来展示最新的值

Action: 用户的行为的描述 比如要 +1 或者 -1。

dispath：触发状态更新,当调用 `dispatch(action)` 时,就触发了一个 action,表示想要更新 state 的某些部分

reducer：就是更新状态（state）的

+ 它接收当前的 state 和 action 对象,计算并返回一个新的 state。
+ 通过这种方式, reducer 可以根据不同的 action 类型,对 state 进行相应的更新。

步骤

1. 用户调用 dispath 
2. dispatch 触发 action
3. Store 调用 reducer 计算出新的 state
4. 更新 state
5. 触发相关订阅的 UI 进行更新

<!-- 这是一张图片，ocr 内容为： -->
![](../../assets/images/react/redux/redux.gif)

## 安装
```bash
npm i react-redux @reduxjs/toolkit
```

## 定义 reducer
```javascript
import { createSlice } from '@reduxjs/toolkit';

const countStore = createSlice({
  name: 'count',
  // 初始状态
  initialState: {
    count: 0
  },
  reducers: {
    increment: state => {
      state.count++;
    },
    decrement: (state, action) => {
      console.log(action);
      state.count--;
    }
  }
});

export default countStore.reducer;
// 导出count的action
export const { increment, decrement } = countStore.actions;
```

## 定义 store
```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './modules/count';

const store = configureStore({
  reducer: {
    count: counterReducer // 导入的counterReducer
  }
});

export default store;
```

## 页面使用
### 所有页面拿到 store
```jsx
import { Provider } from 'react-redux';
import store from './store';

root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
```

### 单独页面使用
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { decrement, increment } from './store/modules/count';

function App() {
  // 获取 dispatch 函数
  const dispatch = useDispatch();
  const countStore = useSelector(state => state.count);

  // 定义点击事件处理函数，并在其中调用 dispatch 函数
  const incrementClick = () => {
    dispatch(increment());
  };

  const decrementClick = () => {
    dispatch(decrement(33));
  };

  return (
    <>
      <button onClick={incrementClick}>+1</button>
      <span>{countStore.count}</span>
      <button onClick={decrementClick}>-1</button>
    </>
  );
}

export default App;
```

## 源码
```javascript
// 创建一个store
function CreateStore(reducer) {
  // 初始化state
  let state;
  // 初始化listeners
  const listeners = [];

  // 获取state
  const getState = () => state;

  // 发布订阅
  const subscriber = callback => {
    // 订阅
    listeners.push(callback);
  };

  // 执行action
  const dispatch = action => {
    state = reducer(state, action);
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  };

  // 初始化store
  let store = {
    getState,
    dispatch,
    subscriber
  };

  // 在store的时候需要执行一下reducer
  state = reducer(state, { type: '@@REDUX/INIT' });

  return store;
}

// 设置window.redux
window.redux = {};
// 设置redux.CreateStore
redux.CreateStore = CreateStore;
```

