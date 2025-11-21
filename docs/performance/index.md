# 性能优化

Google 提出来分别从加载性能、交互体验和视觉稳定性三个维度来衡量用户体验。

## 核心性能指标

- [LCP（最大内容绘制）](https://web.dev/articles/lcp?hl=zh-cn)
- [CLS（累积布局偏移）](https://web.dev/articles/cls?hl=zh-cn)
- [INP（交互延迟）](https://web.dev/articles/inp?hl=zh-cn)

### LCP （Largest Contentful Paint）

定义：从用户请求网址到页面内最大**文本块**或**图片**或者**视频**渲染所需的时间。也就是最大内容的渲染。这体现了加载性能。
意义：直接反映页面的主要内容何时对用户可见。LCP 越快，用户感觉页面加载速度越快。LCP 的值应该小于等于 2.5。
![LCP](../assets/images/performance/lcp.png)

### CLS （Cumulative Layout Shift）

定义：页面整个生命周期内发生的非预期布局偏移的累积分数。这体现了视觉稳定性。
意义：CLS 越低，用户体验越好。例如，用户正要点击一个按钮，但该按钮突然下移，导致用户误点了广告。这用户体验就非常差。
![cls](../assets/images/performance/cls.png)

### INP （Interaction to Next Paint）

定义：观测网页在用户访问期间发生的所有点击、点按和键盘互动的延迟时间。这代表了交互体验。
意义：从用户触发交互到浏览器下一次绘制被阻塞的时间，低的 INP 值意味着页面能快速响应用户的操作，避免卡顿感。
![inp](../assets/images/performance/inp.png)

## 辅助性能指标
### TTFB（Time To First Byte）
定义：从发起请求到接收到来自服务器的第一个字节所消耗的时间。
意义：TTFB 是衡量服务器响应速度的重要指标，较低的 TTFB 值意味着服务器响应速度快，用户可以更快地看到页面内容。
![TTFB](../assets/images/performance/ttfb.png)
![TTFB](../assets/images/performance/ttfb2.png)

### 

## 如何测量这些指标？
### Lighthouse
[Lighthouse](https://developers.google.com/web/tools/lighthouse)集成在 Chrome DevTools 中的工具，这款工具针对性能、无障碍、SEO等方面的评估网站，并给出优化建议。
![Lighthouse](../assets/images/performance/lighthouse.png)
![Lighthouse](../assets/images/performance/lighthouse2.png)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Performance API](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance_API)
- [Web Vitals](https://web.dev/vitals/)
- [Web Fundamentals](https://web.dev/)
- [Web Almanac](https://almanac.httparchive.org/en/2022/overview)
