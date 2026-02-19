"use client";

import { useId, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, Minus, Maximize2, Minimize2 } from "lucide-react";
import { GlitchText, ScanLine } from "@/components/cyber";
import { useAppStore } from "@/store/appStore";
import type { Agent } from "./types";

// 懒加载大型组件，只在需要时才加载
const PortraitStudio = dynamic(
  () => import("./PortraitStudio").then((mod) => ({ default: mod.PortraitStudio })),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="bg-cyber-cyan absolute h-12 w-12 animate-ping rounded-full opacity-75" />
            <div className="bg-cyber-cyan relative h-8 w-8 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.8)]" />
          </div>
          <span className="text-cyber-cyan animate-pulse font-mono text-sm">
            [ LOADING PORTRAIT STUDIO ]
          </span>
        </div>
      </div>
    ),
    ssr: false,
  },
);

const DataAnalyst = dynamic(
  () => import("./DataAnalyst").then((mod) => ({ default: mod.DataAnalyst })),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="bg-cyber-cyan absolute h-12 w-12 animate-ping rounded-full opacity-75" />
            <div className="bg-cyber-cyan relative h-8 w-8 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.8)]" />
          </div>
          <span className="text-cyber-cyan animate-pulse font-mono text-sm">
            [ LOADING DATA ANALYST ]
          </span>
        </div>
      </div>
    ),
    ssr: false,
  },
);

const PromptOptimizerContent = dynamic(
  () => import("./PromptOptimizerContent").then((mod) => ({ default: mod.PromptOptimizerContent })),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="bg-cyber-cyan absolute h-12 w-12 animate-ping rounded-full opacity-75" />
            <div className="bg-cyber-cyan relative h-8 w-8 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.8)]" />
          </div>
          <span className="text-cyber-cyan animate-pulse font-mono text-sm">
            [ LOADING PROMPT OPTIMIZER ]
          </span>
        </div>
      </div>
    ),
    ssr: false,
  },
);

const ImageEditor = dynamic(
  () => import("./ImageEditor").then((mod) => ({ default: mod.ImageEditor })),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="bg-cyber-cyan absolute h-12 w-12 animate-ping rounded-full opacity-75" />
            <div className="bg-cyber-cyan relative h-8 w-8 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.8)]" />
          </div>
          <span className="text-cyber-cyan animate-pulse font-mono text-sm">
            [ LOADING IMAGE EDITOR ]
          </span>
        </div>
      </div>
    ),
    ssr: false,
  },
);

const AudioAnalyzer = dynamic(
  () => import("./AudioAnalyzer").then((mod) => ({ default: mod.AudioAnalyzer })),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="bg-cyber-cyan absolute h-12 w-12 animate-ping rounded-full opacity-75" />
            <div className="bg-cyber-cyan relative h-8 w-8 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.8)]" />
          </div>
          <span className="text-cyber-cyan animate-pulse font-mono text-sm">
            [ LOADING AUDIO ANALYZER ]
          </span>
        </div>
      </div>
    ),
    ssr: false,
  },
);

const SpringFestivalMeme = dynamic(() => import("./SpringFestivalMeme"), {
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-12 w-12 animate-ping rounded-full bg-red-500 opacity-75" />
          <div className="relative h-8 w-8 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
        </div>
        <span className="animate-pulse font-mono text-sm text-red-400">
          [ LOADING MEME GENERATOR ]
        </span>
      </div>
    </div>
  ),
  ssr: false,
});

const SeedanceStoryboard = dynamic(
  () => import("./SeedanceStoryboard").then((mod) => ({ default: mod.SeedanceStoryboard })),
  {
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="bg-cyber-magenta absolute h-12 w-12 animate-ping rounded-full opacity-75" />
            <div className="bg-cyber-magenta relative h-8 w-8 rounded-full shadow-[0_0_20px_rgba(255,0,255,0.8)]" />
          </div>
          <span className="text-cyber-magenta animate-pulse font-mono text-sm">
            [ LOADING STORYBOARD ASSISTANT ]
          </span>
        </div>
      </div>
    ),
    ssr: false,
  },
);

type Props = {
  mounted: boolean;
  visible: boolean;
  agent: Agent | null;
  onClose: () => void;
};

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

export function AgentModal({ mounted, visible, agent, onClose }: Props) {
  const titleId = useId();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 当模态框首次打开时，重置全屏状态
  useEffect(() => {
    if (visible && !isMinimized) {
      setIsFullscreen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const setAgentModalOpen = useAppStore((state) => state.setAgentModalOpen);
  const setAgentModalFullscreen = useAppStore((state) => state.setAgentModalFullscreen);
  const opacity = useAppStore((state) => state.agentModalOpacity);
  const setOpacity = useAppStore((state) => state.setAgentModalOpacity);

  // 更新全局状态：AgentModal 是否打开
  useEffect(() => {
    setAgentModalOpen(visible && !isMinimized);
  }, [visible, isMinimized, setAgentModalOpen]);

  // 更新全局状态：AgentModal 是否全屏
  useEffect(() => {
    setAgentModalFullscreen(visible && !isMinimized && isFullscreen);
  }, [visible, isMinimized, isFullscreen, setAgentModalFullscreen]);

  // 初始化尺寸
  useEffect(() => {
    if (modalRef.current && size.width === 0) {
      const rect = modalRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, [visible, size.width]);

  // 重置位置和尺寸当全屏切换时
  useEffect(() => {
    if (isFullscreen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition({ x: 0, y: 0 });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize({ width: 0, height: 0 });
    }
  }, [isFullscreen]);

  function handleResizeStart(e: React.MouseEvent, direction: ResizeDirection) {
    if (isFullscreen || isMinimized || !modalRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeDirection(direction);

    const rect = modalRef.current.getBoundingClientRect();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: rect.width,
      initialHeight: rect.height,
      initialX: position.x,
      initialY: position.y,
    };
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isResizing && resizeRef.current && resizeDirection) {
        e.preventDefault(); // 防止选中文本

        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;

        // 使用 requestAnimationFrame 优化性能
        requestAnimationFrame(() => {
          if (!resizeRef.current) return;

          let newWidth = resizeRef.current.initialWidth;
          let newHeight = resizeRef.current.initialHeight;
          let newX = resizeRef.current.initialX;
          let newY = resizeRef.current.initialY;

          // 最小尺寸限制
          const minWidth = 400;
          const minHeight = 300;

          // 根据方向调整尺寸和位置
          if (resizeDirection!.includes("e")) {
            newWidth = Math.max(minWidth, resizeRef.current.initialWidth + deltaX);
          }
          if (resizeDirection!.includes("w")) {
            const potentialWidth = resizeRef.current.initialWidth - deltaX;
            if (potentialWidth >= minWidth) {
              newWidth = potentialWidth;
              newX = resizeRef.current.initialX + deltaX;
            }
          }
          if (resizeDirection!.includes("s")) {
            newHeight = Math.max(minHeight, resizeRef.current.initialHeight + deltaY);
          }
          if (resizeDirection!.includes("n")) {
            const potentialHeight = resizeRef.current.initialHeight - deltaY;
            if (potentialHeight >= minHeight) {
              newHeight = potentialHeight;
              newY = resizeRef.current.initialY + deltaY;
            }
          }

          setSize({ width: newWidth, height: newHeight });
          setPosition({ x: newX, y: newY });
        });
      }
    }

    function handleMouseUp() {
      if (isResizing) {
        setIsResizing(false);
        setResizeDirection(null);
        resizeRef.current = null;
      }
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, resizeDirection]);

  function handleCloseClick() {
    setShowConfirm(true);
  }

  function handleConfirmClose() {
    setShowConfirm(false);
    onClose();
  }

  function handleCancelClose() {
    setShowConfirm(false);
  }

  function handleMinimize() {
    setIsMinimized(!isMinimized);
  }

  function handleFullscreen() {
    setIsFullscreen(!isFullscreen);
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (isFullscreen || isMinimized) return;

    // 只在头部区域允许拖动
    const target = e.target as HTMLElement;
    if (!target.closest("[data-drag-handle]")) return;

    // 排除控制按钮和透明度滑块区域
    if (target.closest("button") || target.closest("input") || target.closest("[data-no-drag]"))
      return;

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isDragging || !dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      // 使用 requestAnimationFrame 优化性能
      requestAnimationFrame(() => {
        if (!dragRef.current) return; // 再次检查，防止在 RAF 回调时已被清空
        setPosition({
          x: dragRef.current.initialX + deltaX,
          y: dragRef.current.initialY + deltaY,
        });
      });
    }

    function handleMouseUp() {
      setIsDragging(false);
      dragRef.current = null;
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!mounted) return null;

  return (
    <>
      {/* 最小化标签 - 固定在左侧 */}
      {isMinimized && visible ? (
        <button
          type="button"
          onClick={handleMinimize}
          className="border-cyber-cyan/30 bg-cyber-dark/95 hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10 fixed top-1/2 left-0 z-[51] -translate-y-1/2 rounded-r-2xl border-y border-r p-4 backdrop-blur-xl transition-all"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-2 w-2 items-center justify-center">
              <div className="bg-cyber-cyan absolute h-2 w-2 animate-ping rounded-full opacity-75" />
              <div className="bg-cyber-cyan relative h-1.5 w-1.5 rounded-full shadow-[0_0_8px_#00f3ff]" />
            </div>
            <span className="font-orbitron text-sm font-bold tracking-wider text-white">
              {agent?.title ?? "AI 助手"}
            </span>
          </div>
        </button>
      ) : null}

      {/* 主模态框 - 赛博朋克风格 */}
      <div
        ref={modalRef}
        className={[
          "fixed",
          visible && !isMinimized ? "opacity-100" : "pointer-events-none opacity-0",
          isFullscreen ? "inset-0 z-[55]" : "z-[52]",
          // 只在非拖动/缩放时应用 transition
          !isDragging && !isResizing ? "transition-opacity duration-500" : "",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={
          !isFullscreen && !isMinimized
            ? {
                transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`,
                width: size.width > 0 ? `${size.width}px` : "min(1200px, calc(100vw - 120px))",
                height: size.height > 0 ? `${size.height}px` : "calc(100vh - 120px)",
                left: "50%",
                top: "60px",
                willChange: isDragging || isResizing ? "transform, width, height" : "auto",
              }
            : isFullscreen
              ? {
                  width: "100%",
                  height: "100%",
                }
              : undefined
        }
      >
        {/* 缩放手柄 - 只在非全屏和非最小化时显示 */}
        {!isFullscreen && !isMinimized && (
          <div className="pointer-events-none absolute inset-0 z-[200] select-none">
            {/* 四个角 */}
            <div
              className="pointer-events-auto absolute -top-1 -left-1 h-4 w-4 cursor-nw-resize"
              onMouseDown={(e) => handleResizeStart(e, "nw")}
            />
            <div
              className="pointer-events-auto absolute -top-1 -right-1 h-4 w-4 cursor-ne-resize"
              onMouseDown={(e) => handleResizeStart(e, "ne")}
            />
            <div
              className="pointer-events-auto absolute -bottom-1 -left-1 h-4 w-4 cursor-sw-resize"
              onMouseDown={(e) => handleResizeStart(e, "sw")}
            />
            <div
              className="pointer-events-auto absolute -right-1 -bottom-1 h-4 w-4 cursor-se-resize"
              onMouseDown={(e) => handleResizeStart(e, "se")}
            />

            {/* 四条边 */}
            <div
              className="pointer-events-auto absolute -top-1 right-4 left-4 h-2 cursor-n-resize"
              onMouseDown={(e) => handleResizeStart(e, "n")}
            />
            <div
              className="pointer-events-auto absolute right-4 -bottom-1 left-4 h-2 cursor-s-resize"
              onMouseDown={(e) => handleResizeStart(e, "s")}
            />
            <div
              className="pointer-events-auto absolute top-4 bottom-4 -left-1 w-2 cursor-w-resize"
              onMouseDown={(e) => handleResizeStart(e, "w")}
            />
            <div
              className="pointer-events-auto absolute top-4 -right-1 bottom-4 w-2 cursor-e-resize"
              onMouseDown={(e) => handleResizeStart(e, "e")}
            />
          </div>
        )}
        {/* 背景层 */}
        <div
          className="bg-cyber-dark absolute inset-0 backdrop-blur-2xl"
          style={{ opacity: opacity / 100 }}
        />

        {/* 背景网格效果 */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        {/* LED 灯效边框 */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* 顶部 LED 灯带 */}
          <div className="absolute top-0 right-0 left-0 h-1">
            <div
              className="animate-led-flow via-cyber-cyan absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-80"
              style={{ backgroundSize: "200% 100%" }}
            />
            <div className="bg-cyber-cyan/40 absolute inset-0 blur-md" />
          </div>

          {/* 右侧 LED 灯带 */}
          <div className="absolute top-0 right-0 bottom-0 w-1">
            <div
              className="animate-led-flow-vertical via-cyber-magenta absolute inset-0 bg-gradient-to-b from-transparent to-transparent opacity-80"
              style={{ backgroundSize: "100% 200%", animationDelay: "0.5s" }}
            />
            <div className="bg-cyber-magenta/40 absolute inset-0 blur-md" />
          </div>

          {/* 底部 LED 灯带 */}
          <div className="absolute right-0 bottom-0 left-0 h-1">
            <div
              className="animate-led-flow-reverse via-cyber-purple absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-80"
              style={{ backgroundSize: "200% 100%", animationDelay: "1s" }}
            />
            <div className="bg-cyber-purple/40 absolute inset-0 blur-md" />
          </div>

          {/* 左侧 LED 灯带 */}
          <div className="absolute top-0 bottom-0 left-0 w-1">
            <div
              className="animate-led-flow-vertical-reverse via-cyber-cyan absolute inset-0 bg-gradient-to-b from-transparent to-transparent opacity-80"
              style={{ backgroundSize: "100% 200%", animationDelay: "1.5s" }}
            />
            <div className="bg-cyber-cyan/40 absolute inset-0 blur-md" />
          </div>

          {/* 角落强化光效 */}
          <div className="bg-cyber-cyan/60 absolute top-0 left-0 h-8 w-8 blur-xl" />
          <div className="bg-cyber-magenta/60 absolute top-0 right-0 h-8 w-8 blur-xl" />
          <div className="bg-cyber-purple/60 absolute right-0 bottom-0 h-8 w-8 blur-xl" />
          <div className="bg-cyber-cyan/60 absolute bottom-0 left-0 h-8 w-8 blur-xl" />
        </div>

        {/* 内容容器 */}
        <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10">
          {/* 扫描线效果 */}
          <ScanLine speed="normal" />

          {/* 头部 - 可拖动区域 */}
          <div
            data-drag-handle
            onMouseDown={handleMouseDown}
            className={[
              "border-cyber-cyan/20 from-cyber-dark via-cyber-dark/95 to-cyber-dark relative z-[100] flex items-center justify-between border-b bg-gradient-to-r p-4",
              !isFullscreen && !isMinimized ? "cursor-move select-none" : "",
            ].join(" ")}
          >
            {/* 左侧：状态指示器 + 标题 */}
            <div className="flex items-center gap-4">
              {/* 状态指示器 */}
              <div className="relative flex items-center gap-2">
                <div className="relative flex h-3 w-3 items-center justify-center">
                  <div
                    className={`absolute h-3 w-3 animate-ping rounded-full ${agent?.status === "offline" ? "bg-red-500" : "bg-cyber-cyan"} opacity-75`}
                  />
                  <div
                    className={`relative h-2 w-2 rounded-full ${agent?.status === "offline" ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-cyber-cyan shadow-[0_0_10px_#00f3ff]"}`}
                  />
                </div>
                <span
                  className={`font-mono text-[10px] font-bold tracking-widest uppercase ${agent?.status === "offline" ? "text-red-500" : "text-cyber-cyan"}`}
                >
                  {agent?.status === "offline" ? "Offline" : "Online"}
                </span>
              </div>

              {/* 分隔线 */}
              <div className="h-6 w-px bg-white/10" />

              {/* 标题 */}
              <div>
                <h2 id={titleId}>
                  <GlitchText
                    as="span"
                    className="font-orbitron text-lg font-bold tracking-wide text-white"
                    intensity="low"
                  >
                    {agent?.title ?? "AI 数字分身助手"}
                  </GlitchText>
                </h2>
                <p className="font-mono text-[9px] tracking-widest text-white/40 uppercase">
                  Agent ID: {agent?.botId ?? "unknown"}
                </p>
              </div>
            </div>

            {/* 右侧：控制按钮 */}
            <div className="flex items-center gap-2">
              {/* 透明度滑块 */}
              <div
                data-no-drag
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              >
                <span className="font-mono text-[9px] tracking-widest text-white/60 uppercase">
                  透明度
                </span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="[&::-webkit-slider-thumb]:bg-cyber-cyan h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_8px_#00f3ff]"
                />
                <span className="text-cyber-cyan font-mono text-[9px] font-bold">{opacity}%</span>
              </div>

              {/* 最小化按钮 */}
              <button
                type="button"
                onClick={handleMinimize}
                className="group hover:border-cyber-purple/50 hover:bg-cyber-purple/10 relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all"
                aria-label="Minimize"
              >
                <Minus className="group-hover:text-cyber-purple h-5 w-5 text-white/60 transition-colors" />
                <div className="bg-cyber-purple/0 group-hover:bg-cyber-purple/20 absolute inset-0 rounded-lg opacity-0 blur-xl transition-all group-hover:opacity-100" />
              </button>

              {/* 全屏按钮 */}
              <button
                type="button"
                onClick={handleFullscreen}
                className="group hover:border-cyber-magenta/50 hover:bg-cyber-magenta/10 relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all"
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="group-hover:text-cyber-magenta h-5 w-5 text-white/60 transition-colors" />
                ) : (
                  <Maximize2 className="group-hover:text-cyber-magenta h-5 w-5 text-white/60 transition-colors" />
                )}
                <div className="bg-cyber-magenta/0 group-hover:bg-cyber-magenta/20 absolute inset-0 rounded-lg opacity-0 blur-xl transition-all group-hover:opacity-100" />
              </button>

              {/* 关闭按钮 */}
              <button
                type="button"
                onClick={handleCloseClick}
                className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all hover:border-red-500/50 hover:bg-red-500/10"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-white/60 transition-colors group-hover:text-red-500" />
                <div className="absolute inset-0 rounded-lg bg-red-500/0 opacity-0 blur-xl transition-all group-hover:bg-red-500/20 group-hover:opacity-100" />
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="relative z-[50] flex-1 overflow-hidden">
            {agent?.kind === "portrait" ? (
              <PortraitStudio agentKey={agent.botId} />
            ) : agent?.kind === "analysis" ? (
              <DataAnalyst agentKey={agent.botId} />
            ) : agent?.kind === "promptOptimizer" ? (
              <PromptOptimizerContent />
            ) : agent?.kind === "imageEditor" ? (
              <ImageEditor agentKey={agent.botId} />
            ) : agent?.kind === "audioAnalyzer" ? (
              <AudioAnalyzer agentKey={agent.botId} />
            ) : agent?.kind === "springFestivalMeme" ? (
              <SpringFestivalMeme />
            ) : agent?.kind === "seedanceStoryboard" ? (
              <SeedanceStoryboard />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                {/* 图标 */}
                <div className="relative mb-8">
                  <div className="bg-cyber-cyan/20 absolute inset-0 animate-pulse rounded-full blur-3xl" />
                  <div className="border-cyber-cyan/30 from-cyber-cyan/10 to-cyber-purple/10 relative flex h-24 w-24 items-center justify-center rounded-2xl border bg-gradient-to-br text-5xl backdrop-blur-sm">
                    {agent?.icon ?? "🤖"}
                  </div>
                </div>

                {/* 标题 */}
                <GlitchText
                  as="h3"
                  className="font-orbitron mb-4 text-3xl font-bold text-white"
                  intensity="medium"
                >
                  正在接入智能体接口
                </GlitchText>

                {/* 代码块 */}
                <div className="border-cyber-purple/30 relative w-full max-w-md rounded-2xl border bg-black/60 p-6 backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="bg-cyber-magenta h-2 w-2 rounded-full" />
                    <span className="text-cyber-magenta font-mono text-[10px] tracking-widest uppercase">
                      API Endpoint
                    </span>
                  </div>
                  <pre className="text-cyber-cyan font-mono text-[11px] leading-relaxed">
                    <code>
                      {"// Placeholder\n"}
                      {"POST /api/agents/:agentKey/run\n"}
                      {"\n"}
                      {"// Coming Soon..."}
                    </code>
                  </pre>
                </div>

                {/* 装饰性元素 */}
                <div className="mt-8 flex items-center gap-4">
                  <div className="to-cyber-cyan/50 h-px w-12 bg-gradient-to-r from-transparent" />
                  <span className="font-mono text-[9px] tracking-widest text-white/30 uppercase">
                    Initializing
                  </span>
                  <div className="to-cyber-cyan/50 h-px w-12 bg-gradient-to-l from-transparent" />
                </div>
              </div>
            )}
          </div>

          {/* 底部装饰条 */}
          <div className="from-cyber-cyan/0 via-cyber-cyan/50 to-cyber-cyan/0 relative z-[50] h-1 bg-gradient-to-r" />
        </div>
      </div>

      {/* 确认关闭对话框 - 赛博朋克风格 */}
      {showConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="border-cyber-magenta/30 bg-cyber-dark/98 relative m-4 w-full max-w-md overflow-hidden rounded-2xl border p-8 backdrop-blur-xl">
            {/* LED 边框效果 */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div
                className="animate-led-flow via-cyber-magenta absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-80"
                style={{ backgroundSize: "200% 100%" }}
              />
              <div
                className="animate-led-flow-reverse via-cyber-magenta absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-80"
                style={{ backgroundSize: "200% 100%" }}
              />
            </div>

            {/* 标题 */}
            <div className="relative mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="border-cyber-magenta/30 bg-cyber-magenta/10 flex h-16 w-16 items-center justify-center rounded-full border">
                  <X className="text-cyber-magenta h-8 w-8" />
                </div>
              </div>
              <GlitchText as="h3" className="font-orbitron mb-2 text-xl font-bold text-white">
                确认关闭？
              </GlitchText>
              <p className="text-sm leading-relaxed text-white/60">关闭后将清空当前输入与结果</p>
            </div>

            {/* 按钮 */}
            <div className="relative flex gap-3">
              <button
                type="button"
                onClick={handleCancelClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm font-semibold tracking-wider text-white uppercase transition-all hover:border-white/20 hover:bg-white/10"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="border-cyber-magenta/50 bg-cyber-magenta/20 hover:bg-cyber-magenta/30 flex-1 rounded-xl border px-4 py-3 font-mono text-sm font-semibold tracking-wider text-white uppercase transition-all"
              >
                确认关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
