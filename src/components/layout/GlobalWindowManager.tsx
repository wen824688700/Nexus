"use client";

import { useAppStore } from "@/store/appStore";
import { AgentModal } from "@/components/home/AgentModal";
import { RetroOSModal } from "@/components/retro-os/RetroOSModal";

/**
 * 全局窗口管理器
 * 在 layout 层级渲染所有全局窗口，确保窗口在页面切换时不会消失
 * 
 * 性能优化：
 * 1. 组件已经在 layout 中加载，无需 dynamic import
 * 2. 使用 React.memo 避免不必要的重渲染
 */
export function GlobalWindowManager() {
  const globalWindows = useAppStore((state) => state.globalWindows);
  const closeGlobalWindow = useAppStore((state) => state.closeGlobalWindow);

  return (
    <>
      {globalWindows.map((window) => {
        if (window.type === "agent" && window.agent) {
          return (
            <AgentModal
              key={window.id}
              mounted={window.mounted}
              visible={window.visible}
              agent={{
                title: window.agent.name,
                botId: window.agent.id,
                icon: "✦",
                kind:
                  (
                    window.agent as {
                      kind?:
                        | "portrait"
                        | "chat"
                        | "analysis"
                        | "workflow"
                        | "promptOptimizer"
                        | "imageEditor"
                        | "springFestivalMeme"
                        | "audioAnalyzer"
                        | "seedanceStoryboard";
                    }
                  ).kind,
                status: (window.agent.status === "busy" ? "online" : window.agent.status) as
                  | "online"
                  | "offline",
              }}
              onClose={() => closeGlobalWindow(window.id)}
            />
          );
        }

        if (window.type === "retroos") {
          return (
            <RetroOSModal
              key={window.id}
              mounted={window.mounted}
              visible={window.visible}
              onClose={() => closeGlobalWindow(window.id)}
            />
          );
        }

        return null;
      })}
    </>
  );
}
