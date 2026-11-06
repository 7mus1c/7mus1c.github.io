import DefaultTheme from "vitepress/theme";
import { nextTick, onMounted, watch } from "vue";
import { inBrowser, useData, useRoute } from "vitepress";
import "./mermaid.css";

type Mermaid = typeof import("mermaid")["default"];

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute();
    const { isDark } = useData();
    let mermaid: Mermaid | null = null;

    // 串行执行，避免首次加载尚未完成时路由/主题切换把渲染整个丢掉
    let task: Promise<void> = Promise.resolve();

    const renderMermaid = async (): Promise<void> => {
      if (!inBrowser) return;

      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("pre.mermaid")
      );
      if (nodes.length === 0) return;

      mermaid ??= (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark.value ? "dark" : "default",
        securityLevel: "strict",
        fontFamily: "inherit",
        flowchart: { useMaxWidth: true },
      });

      // 重绘（主题切换 / 路由切换）时先还原源码，mermaid 才会重新生成 SVG
      for (const node of nodes) {
        const source = node.dataset.mermaidSource ?? node.textContent ?? "";
        node.dataset.mermaidSource = source;
        node.removeAttribute("data-processed");
        node.textContent = source;
      }

      await mermaid.run({ nodes, suppressErrors: true });
    };

    const schedule = (): void => {
      task = task
        .then(() => nextTick())
        .then(renderMermaid)
        .catch((error: unknown) => {
          console.error("[mermaid] 渲染失败", error);
        });
    };

    onMounted(schedule);
    watch(() => route.path, schedule);
    watch(isDark, schedule);
  },
};
