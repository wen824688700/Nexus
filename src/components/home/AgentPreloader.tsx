"use client";

import { useEffect } from "react";

/**
 * 智能体组件预加载器
 * 在用户可能点击智能体之前，预先加载所有智能体组件
 * 这样首次打开窗口时不需要等待代码加载
 */
export function AgentPreloader() {
  useEffect(() => {
    // 使用 requestIdleCallback 在浏览器空闲时预加载
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleCallback = window.requestIdleCallback(() => {
        // 预加载所有智能体组件
        Promise.all([
          import("./PortraitStudio"),
          import("./DataAnalyst"),
          import("./PromptOptimizerContent"),
          import("./ImageEditor"),
          import("./AudioAnalyzer"),
          import("./SpringFestivalMeme"),
          import("./SeedanceStoryboard"),
          import("./LyricsGenerator"),
        ]);
      });

      return () => {
        window.cancelIdleCallback(idleCallback);
      };
    } else {
      // 降级方案：使用 setTimeout
      const timer = setTimeout(() => {
        Promise.all([
          import("./PortraitStudio"),
          import("./DataAnalyst"),
          import("./PromptOptimizerContent"),
          import("./ImageEditor"),
          import("./AudioAnalyzer"),
          import("./SpringFestivalMeme"),
          import("./SeedanceStoryboard"),
          import("./LyricsGenerator"),
        ]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return null; // 不渲染任何内容
}
