# 代码逻辑

## 代码复杂度

这里的代码复杂度就是所谓的时间复杂度和空间复杂度。
需要我们平常注重代码的逻辑，尽量减少不必要的循环，减少不必要的变量声明，减少不必要的函数调用，减少不必要的内存占用等。
例如：

```js
const list = [
  { name: "tom", age: 18 },
  { name: "jack", age: 20 },
  { name: "lucy", age: 22 },
  { name: "lily", age: 24 },
  { name: "lucy", age: 26 },
  { name: "lucy", age: 28 },
];

const tom = list.find((item) => item.name === "tom");
const jack = list.find((item) => item.name === "jack");
const lucy = list.find((item) => item.name === "lucy");
const lily = list.find((item) => item.name === "lily");
```

上面的代码，我们使用了 find 方法，循环了 6 次，其实我们可以使用 map 方法，将 list 转换成一个对象，这样就可以直接通过对象属性来获取数据了。

```js
const list = [
  { name: "tom", age: 18 },
  { name: "jack", age: 20 },
  { name: "lucy", age: 22 },
  { name: "lily", age: 24 },
  { name: "lucy", age: 26 },
  { name: "lucy", age: 28 },
];

const listMap = {};

for (const item of list) {
  listMap[item.name] = item;
}

const { tom， jack, lucy, lily } = listMap;
```

## 防抖与节流

防抖和节流是两种常见的优化手段，它们的主要作用是避免用户频繁操作导致 js 引擎卡顿，从而影响用户体验。

### 防抖

防抖是短时间内只执行一次，如果用户在短时间内多次操作，那么最后一次操作会覆盖前面的操作。
常见场景比如搜索框的搜索功能，按钮的点击事件等。

```js
/**
 * 防抖函数
 * @param {Function} fn 需要防抖的函数
 * @param {Number} delay 延迟时间
 * @returns {Function} 返回一个防抖函数
 */
function debounce(fn, delay) {
  // 核心变量，用于存储定时器
  let timer = null;
  // 返回一个防抖函数，用户实际调用的这个函数
  return function () {
    // 每次调用防抖函数时，先清除之前的定时器，确保不会执行旧的逻辑。
    if (timer) {
      clearTimeout(timer);
    }
    // 设置一个新的定时器，延迟执行传入的函数
    timer = setTimeout(() => {
      // 防止 this 指向问题，使用 apply 传入正确的 this 和参数
      fn.apply(this, arguments);
    }, delay);
  };
}
```

### 节流

节流是在指定的时间间隔内只执行一次，如果用户在指定的时间间隔内多次操作，那么只会执行一次。
常见场景比如滚动条的滚动事件，窗口的 resize 事件等。

```js
/**
 * 节流函数
 * @param {Function} fn 需要节流的函数
 * @param {Number} delay 延迟时间
 * @returns {Function} 返回一个节流函数
 */
function throttle(fn, delay) {
  // 核心变量，用于存储定时器
  let timer = null;
  // 返回一个节流函数，用户实际调用的这个函数
  return function () {
    // 如果定时器存在，说明上次操作还在延迟时间内，直接返回
    if (timer) {
      return;
    }
    // 设置一个新的定时器，延迟执行传入的函数
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      // 执行完毕之后清除定时器，方便下一次的逻辑进来
      timer = null;
    }, delay);
  };
}
```

## 图片懒加载

图片懒加载是一种常见的优化手段，它的主要作用是避免页面加载过多的图片导致页面卡顿，从而影响用户体验。
主要是首次进入页面后一次性加载所有的图片，实际有很多图片并不在屏幕中展示。从而导致 http 请求过多，页面卡顿。

1. html 本身就支持懒加载，通过 loading 属性即可实现。

```html
<img src="https://xxx.jpg" loading="lazy" src="" />
```

2. 使用 Intersection Observer 来实现。

```html
<img src="" data-src="https://xxx.jpg" />
<img src="" data-src="https://xxx.jpg" />
<img src="" data-src="https://xxx.jpg" />
```

```js
const imgList = document.querySelectorAll("img");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    // isIntersecting 是一个 Boolean 值，判断目标元素当前是否进入 root 视窗（默认 root 是 window 窗口可视区域）
    if (entry.isIntersecting) {
      // 如果进入 root 视窗，则加载图片
      entry.target.src = entry.target.dataset.src;
      // 加载完后，取消监听，释放内存。
      observer.unobserve(entry.target);
    }
  });
});

imgList.forEach((img) => {
  observer.observe(img);
});
```

## 时间切片

时间切片是 React 提出的一个概念，它的主要作用是将一个长时间任务，按照规则拆分成一个个的小任务，通过时间切片的方式，让 js 引擎在空闲时间执行这些小任务，从而避免 js 引擎卡顿，从而影响用户体验。

```js
/**
 * 简单的时间切片函数
 * @param {Array<Function>} tasks - 一个包含所有要执行的小任务的数组
 */
function timeSlice(tasks) {
  // 定义一个函数，这个函数会被 requstIdleCallback 调用，用来执行小任务
  const processTasks = (deadline) => {
    // 如果浏览器有空闲时间，并且还有小任务要执行，则执行小任务
    while (tasks.length > 0 && deadline.timeRemaining() > 0) {
      // 执行一个小任务
      tasks.shift()();
      console.log("执行一个小任务， 生育时间：", deadline.timeRemaining());
    }
    // 如果任务还没执行完，就再次请求浏览器在下一个空闲时段继续执行
    if (tasks.length > 0) {
      console.log("时间不足，等待下一帧空闲时间继续...");
      requestIdleCallback(processTasks);
    } else {
      console.log("所有任务执行完毕");
    }
  };

  // 启动时间切片，当浏览器有空闲时间时，会调用 processTasks 函数
  requestIdleCallback(processTasks);
}

const tasks = [];
for (let i = 0; i < 1000; i++) {
  tasks.push(() => {
    console.log("执行一个小任务");
  });
}

timeSlice(tasks);
```

## Web Worker 子线程

Web Worker 是一种在浏览器中运行的 JavaScript 线程，它的主要作用是将一些耗时的任务放到子线程中执行，从而避免 js 引擎卡顿，从而影响用户体验。
主要场景：比如一些耗时的计算，比如图片处理，比如大数据量计算，大文件切片上传，计算文件 hash，文件越大计算 hash 耗时就越长。

```js
// main.js
const worker = new Worker("worker.js");

worker.postMessage("Hello Worker!");

worker.onmessage = (event) => {
  console.log("收到子线程的消息：", event.data);
};

// worker.js
self.onmessage = (event) => {
  console.log("收到主线程的消息：", event.data);
  // 执行耗时任务
  for (let i = 0; i < 1000000000; i++) {}
  // 发送消息给主线程
  self.postMessage("任务执行完毕");
};
```

## 大文件切片上传

基本思路是：将一个大文件在浏览器端切割成许多小块（切片），然后逐个上传这些切片到服务器。服务器接收所有切片后，再将它们按顺序合并成完整文件。

```js
const file = document.getElementById("file").files[0];
const chunkSize = 1024 * 1024; // 每个切片的大小，这里设置为1MB
const totalChunks = Math.ceil(file.size / chunkSize); // 计算切片数量
const chunks = [];

for (let i = 0; i < totalChunks; i++) {
  // 切片的起始位置
  const start = i * chunkSize;
  // 防止最后一个切片超出文件大小
  const end = Math.min(start + chunkSize, file.size);

  chunks.push({
    index: i,
    // 使用 slice 方法切割文件
    file: file.slice(start, end),
    // 生成一个唯一的标识符，通常是内容的哈希值，用于后续的合并和断点续传
    hash: `${file.name}-${i}`,
  });
}

/**
 * 封装上传切片
 * @param {Object} file 切片数据
 * @param {Number} index 切片的索引
 * @param {String} fileHash 文件的哈希值
 * @return {Promise}
 */
function uploadChunks({ file, index, fileHash }) {
  // 使用formData封装切片数据和其他字段
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("index", index);
  formData.append("fileHash", fileHash);
  formData.append("filename", file.name);

  return fetch("/api/upload/chunk", {
    method: "POST",
    body: formData,
  });
}

const uploadPromises = chunks.map((chunk) => uploadChunks(chunk));

Promise.all(uploadPromises)
  .then(() => {
    console.log("所有切片上传完成！准备通知后端合并文件。");
    // 上传完成后，调用后端合并接口
    // await mergeFile(fileHash);
  })
  .catch((error) => {
    console.error("部分切片上传失败，上传过程终止。", error);
  });
```

## LRU 算法

在做业务时为了提升用户体验（提升二次访问速度），回设计对访问过的数据进行缓存。缓存存储在变量内存或者浏览器本地缓存中。
不管是那种存储，都会有一个存储上限，当存储达到上限时，就需要对数据进行淘汰。LRU（Least Recently Used）算法就是一种常用的淘汰策略，它的主要思想是淘汰最久未使用的数据。

```js
class LRUCache {
  constructor(max) {
    this.max = max; // 存储上限
    this.cache = new Map(); // 存储数据，定义为 Map 类型，优化查找性能
    this.keys = []; // 队列，记录最近节点的 key，用于淘汰最久未使用的数据
  }

  // 访问数据
  get(key) {
    // 如果缓存中存在该数据，则将其移动到队列尾部
    if (this.cache.has(key)) {
      // 更新节点到队列尾部
      this.update(key);

      const value = this.cache.get(key);
      return value;
    }
    return undefined;
  }

  // 添加、更新数据
  put(key, value) {
    // 如果缓存中存在该数据，则更新数据，并将其移动到队列尾部
    if (this.cache.has(key)) {
      this.cache.set(key, value);
      thi.update(key);
    } else {
      // 如果缓存中不存在该数据，则判断缓存是否已满
      if (this.keys.length === this.max) {
        // 如果缓存已满，则删除队列头部的数据（最久未使用的数据）
        const oldestKey = this.keys.shift();
        this.cache.delete(oldestKey);
      }
      // 将新数据添加到缓存中，并将其 key 添加到队列尾部
      this.cache.set(key, value);
      this.keys.push(key);
    }
  }

  // 更新节点到队列尾部
  update(key) {
    const index = this.keys.findIndex((k) => k === key);
    this.keys.splice(index, 1); // 从队列中删除该节点
    this.keys.push(key); // 将该节点添加到队列尾部
  }
}

const cache = new LRUCache(3);

// 1. 添加新数据，此时缓存未满
cache.put("a", 1);
cache.put("b", 2);
cache.put("c", 3);
console.log(cache.keys); // [a, b, c]

// 2. 访问已有数据
cache.get("b");
console.log(cache.keys); // [a, c, b]

// 3. 添加新数据，此时缓存已满
cache.put("d", 4);
console.log(cache.keys); // [c, b, d]
```

## 虚拟滚动列表

虚拟滚动列表是一种优化长列表渲染的技术，它通过只渲染可视区域内的元素来提高性能。当用户滚动列表时，虚拟滚动列表会动态地添加或删除元素，以保持可视区域内的元素数量不变。

假设我们向服务端查询到 1000 条数据，如果原样将这 1000 个数据渲染在页面上，就会生成 1000 个 DOM 节点。
对于用户而言，其实并不关心是否是一次性将数据全部渲染到列表容器中，只要在容器的可视区域内的 DOM 数据能够正常看到就行。所以，我们可以通过虚拟滚动列表技术，只渲染可视区域内的数据，从而大大减少 DOM 节点的数量，提高性能。

思路：结合滚动条 TOP 位置和容器可视区域计算出这个区间的数据想，渲染到滚动容器中。适合应用在 H5 移动端，类似抖音的 短视频 推荐列表。

```html
<div class="virtual-list-container" id="virtual-list-container">
  <div class="virtual-list-phantom" id="virtual-list-phantom"></div>
  <div class="virtual-list" id="virtual-list"></div>
</div>
```

```css
.virtual-list-container {
  height: 400px; /* 可视区域高度 */
  overflow-y: auto; /* 允许垂直滚动 */
  border: 1px solid #ccc;
  position: relative;
}

.virtual-list-phantom {
  /* 幽灵元素，撑开整个列表实际高度，产生滚动条 */
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  height: 40px; /* 固定行高 */
  box-sizing: border-box;
}

.list-item:nth-child(odd) {
  background-color: #f9f9f9;
}
```

```js
const totalItems = 10000; // 加入有一天条数据量
const itemHeight = 40; // 列表项固定高度，需与 CSS 中的一致
const containerHeight = 400; // 容器高度，需与 CSS 中的一致
const bufferItems = 5; // 缓冲区数量，防止滚动时出现白屏
//  1. 数据准备
const data = Array.from({ length: totalItems }).map((_, index) => ({
  id: index,
  text: `列表项 ${index + 1}`,
}));

// 2. DOM 结构
const container = document.getElementById("virtual-list-container"); // 带有滚动条和固定高度的外部容器。
const phantom = document.getElementById("virtual-list-phantom"); // 幽灵元素（占位元素），用于撑开滚动条。
const list = document.getElementById("virtual-list"); // 实际渲染可见列表项的内部容器。

// 3.初始化幽灵元素高度
// 这是实现滚动条的关键一步。将 phantom 元素的高度设置为所有项目堆叠起来的总高度 (10000 * 40px = 400000px)。
// 作用： 浏览器根据这个高度计算出整个页面的实际高度，并生成相应的滚动条。
// 用户滚动滚动条时，感觉就像在滚动一个包含 10000 个项目的长列表一样。
phantom.style.height = `${totalItems * itemHeight}px`;

function renderList() {
  // 计算当前滚动位置
  const scrollTop = container.scrollTop;
  // 计算开始索引
  const startIndex = Math.floor(scrollTop / itemHeight);
  // 缓冲区
  const buffer = Math.max(0, startIndex - bufferItems);
  // 计算结束索引
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(
    totalItems,
    startIndex + visibleCount + bufferItems
  );

  // 获取需要渲染的数据
  const visibleData = data.slice(start, end);

  // 更新列表 DOM
    list.innerHTML = '';
    visibleData.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'list-item';
        itemElement.textContent = item.text;
        // 使用 transform 定位元素到正确的位置
        itemElement.style.transform = `translateY(${start * itemHeight}px)`;
        list.appendChild(itemElement);
    });
}

// 监听滚动事件
container.addEventListener('scroll', updateVisibleItems);

// 初始加载
updateVisibleItems();
```

容器 (container): 负责设置可视区域的高度并监听滚动事件。
幽灵元素 (phantom): 一个高度等于所有列表项总高度的不可见元素 (totalItems \* itemHeight)。它的作用是撑开容器，使浏览器生成一个正常的滚动条。
列表 (list): 真正渲染可见列表项的区域，使用绝对定位使其脱离文档流。
动态定位: 根据当前滚动位置 (scrollTop) 计算出应该渲染的列表项的起始和结束索引，只渲染这个范围内的 DOM 元素。同时，通过 CSS transform: translateY(...) 将渲染区域整体偏移到正确的位置，使得列表项看起来是在正常滚动。
