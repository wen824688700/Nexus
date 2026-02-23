"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { RetroOSState, RetroOSActions, PowerState, WindowType, Article } from "./types";
import { loadArticleContent } from "./useArticles";

interface RetroOSContextValue {
  state: RetroOSState;
  actions: RetroOSActions;
}

const RetroOSContext = createContext<RetroOSContextValue | null>(null);

export function RetroOSProvider({ children }: { children: ReactNode }) {
  const [powerState, setPowerState] = useState<PowerState>("off");
  const [openWindows, setOpenWindows] = useState<RetroOSState["openWindows"]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [loadingArticles, setLoadingArticles] = useState<Set<string>>(new Set());

  const togglePower = useCallback(() => {
    if (powerState === "off") {
      setPowerState("booting");
    } else if (powerState === "on") {
      setPowerState("shutting_down");
      setTimeout(() => {
        setPowerState("off");
        setOpenWindows([]);
      }, 1500);
    }
  }, [powerState]);

  const openWindow = useCallback(
    async (type: WindowType, data?: Article) => {
      const id = `${type}-${Date.now()}`;
      
      // 如果是文章窗口且内容为空，先加载内容
      if (type === "article" && data && !data.content) {
        const articleId = data.id;
        
        // 添加到加载中列表
        setLoadingArticles((prev) => new Set(prev).add(articleId));
        
        try {
          // 按需加载文章内容
          const content = await loadArticleContent(articleId);
          data = { ...data, content };
        } catch (error) {
          console.error("Failed to load article content:", error);
          data = {
            ...data,
            content: "# 内容加载失败\n\n无法获取文章内容，请稍后重试。",
          };
        } finally {
          // 从加载中列表移除
          setLoadingArticles((prev) => {
            const next = new Set(prev);
            next.delete(articleId);
            return next;
          });
        }
      }
      
      const newWindow = {
        id,
        type,
        data,
        zIndex: nextZIndex,
        position:
          type === "folder" ? { top: "80px", left: "120px" } : { top: "120px", left: "160px" },
      };
      setOpenWindows((prev) => [...prev, newWindow]);
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex],
  );

  const closeWindow = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setOpenWindows((prev) => {
        const window = prev.find((w) => w.id === id);
        if (!window) return prev;
        const others = prev.filter((w) => w.id !== id);
        return [...others, { ...window, zIndex: nextZIndex }];
      });
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex],
  );

  const state: RetroOSState = {
    powerState,
    openWindows,
    nextZIndex,
  };

  const actions: RetroOSActions = {
    togglePower,
    setPowerState,
    openWindow,
    closeWindow,
    focusWindow,
  };

  return <RetroOSContext.Provider value={{ state, actions }}>{children}</RetroOSContext.Provider>;
}

export function useRetroOS() {
  const context = useContext(RetroOSContext);
  if (!context) {
    throw new Error("useRetroOS must be used within RetroOSProvider");
  }
  return context;
}
