# 交互体验

## 骨架屏

骨架屏就是页面加载时显示的骨架，用于显示页面的 loading 效果。

```html
<!-- 占位骨架 -->
<div id="skeleton">
  <div class="skeleton-header">
    <div class="skeleton-avatar"></div>
    <div class="skeleton-line" style="width: 60%"></div>
  </div>
  <div class="skeleton-content">
    <div class="skeleton-line"></div>
    <div class="skeleton-line" style="width: 80%"></div>
  </div>
</div>

<script>
  // 真实内容加载完成后隐藏骨架屏
  window.addEventListener("DOMContentLoaded", () => {
    const skeleton = document.getElementById("skeleton");
    const app = document.getElementById("app");

    // 显示真实内容
    app.style.display = "block";

    // 渐隐骨架屏
    skeleton.style.transition = "opacity 0.3s";
    skeleton.style.opacity = "0";

    setTimeout(() => {
      skeleton.style.display = "none";
    }, 300);
  });
</script>
```

## 滚动优化

利用虚拟列表，将不需要的 DOM 元素隐藏，从而提高滚动性能。比如一次性加载一万行内容，但是只显示 10 个，每次只渲染 10 个.

## 动画优化

1. 减少动画帧数，比如使用 requestAnimationFrame，将动画帧数限制在 60 帧内。
2. 减少动画的计算量，比如使用 CSS3 的 transform 属性，将动画效果移动到 GPU 上处理。

```css
/* ✅ 高性能动画（仅触发合成层） */
.high-performance {
  /* transform和opacity只触发composite */
  animation: slide 0.3s ease;
  transform: translate3d(0, 0, 0); /* 强制开启GPU加速 */
  opacity: 0.9;
  will-change: transform, opacity; /* 提示浏览器提前优化 */
}

@keyframes slide {
  from {
    transform: translateX(-100px);
  }
  to {
    transform: translateX(0);
  }
}

/* ❌ 低性能动画（触发重排） */
.low-performance {
  animation: resize 0.3s ease;
}

@keyframes resize {
  from {
    width: 0;
  } /* 触发重排 */
  to {
    width: 100px;
  }
}
```

## 消息提示

通过 toast 提示，将信息反馈给用户。或者显示一个模态框，将信息反馈给用户。
提示信息，比如成功、失败、警告、提示。

## 过渡动画

加载需要展示 loading...
呈现过渡的动画，比如 fade-in fade-out zoom-in zoom-out
