"use client";

import { useState, useEffect } from "react";
import { useRetroOS } from "./RetroOSContext";

export function Taskbar() {
  const [time, setTime] = useState("");
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const { state, actions } = useRetroOS();

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="absolute bottom-0 z-[200] flex h-8 w-full items-center justify-between border-t-2 border-white/10 bg-[#1f1f1f] px-1">
        <div className="flex flex-1 items-center gap-1">
          <button
            type="button"
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            className={`flex h-6 items-center gap-1 border-2 px-2 font-mono text-[10px] font-bold ${
              isStartMenuOpen
                ? "border-t-black border-r-white/10 border-b-white/10 border-l-black"
                : "border-t-white/10 border-r-black border-b-black border-l-white/10 hover:bg-[#2a2a2a]"
            } bg-[#1f1f1f]`}
          >
            🪟 开始
          </button>
          
          {/* 打开的窗口列表 */}
          {state.openWindows.map((window) => (
            <button
              key={window.id}
              type="button"
              onClick={() => actions.focusWindow(window.id)}
              className="flex h-6 max-w-[150px] items-center gap-1 border-2 border-t-white/10 border-r-black border-b-black border-l-white/10 bg-[#1f1f1f] px-2 font-mono text-[10px] font-bold hover:bg-[#2a2a2a]"
            >
              <span className="text-xs">
                {window.type === "folder" ? "📂" : window.data?.icon || "📄"}
              </span>
              <span className="truncate text-[#e5e5e5]">
                {window.type === "folder" ? "项目文档" : window.data?.title || "Document"}
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex h-6 items-center border-t-2 border-l-2 border-black/50 px-2 font-mono text-[10px] font-bold text-[#e5e5e5]">
          {time}
        </div>
      </div>

      {/* 开始菜单 */}
      {isStartMenuOpen && (
        <div className="absolute bottom-8 left-0 z-[210] w-40 border-2 border-t-white/10 border-r-black/50 border-b-black/50 border-l-white/10 bg-[#1f1f1f] p-1 shadow-2xl">
          <div
            className="cursor-pointer px-3 py-2 text-[10px] text-[#e5e5e5] hover:bg-[#0a2540] hover:text-white"
            onClick={() => {
              actions.openWindow("folder");
              setIsStartMenuOpen(false);
            }}
          >
            📂 我的文档
          </div>
          <div className="my-1 h-px bg-white/10"></div>
          <div
            className="cursor-pointer px-3 py-2 text-[10px] text-[#e5e5e5] hover:bg-[#0a2540] hover:text-white"
            onClick={() => {
              actions.togglePower();
              setIsStartMenuOpen(false);
            }}
          >
            🚪 关闭系统...
          </div>
        </div>
      )}
    </>
  );
}
