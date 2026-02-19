"use client";

import { useState, useRef, useEffect } from "react";
import { X, Minus, Maximize2, Minimize2, Square, Menu } from "lucide-react";
import { ProgressiveMarkdownPreview } from "./ProgressiveMarkdownPreview";
import { TableOfContents } from "./TableOfContents";
import { useAppStore } from "@/store/appStore";
import type { Article } from "@/types";

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

interface ArticleReaderModalProps {
  article: Article | null;
  isLoading: boolean;
  onClose: () => void;
}

export function ArticleReaderModal({ article, isLoading, onClose }: ArticleReaderModalProps) {
  // 全屏状态管理（用于隐藏导航栏）
  const setKnowledgeFullscreen = useAppStore((state) => state.setKnowledgeFullscreen);

  // 所有 hooks 必须在条件判断之前调用
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [showToc, setShowToc] = useState(true); // 目录显示状态
  const [forceFullContent, setForceFullContent] = useState(false); // 是否强制显示完整内容

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

  // 初始化尺寸
  useEffect(() => {
    if (modalRef.current && size.width === 0 && article) {
      const rect = modalRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, [size.width, article]);

  // 重置位置和尺寸当全屏切换时
  useEffect(() => {
    if (isFullscreen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition({ x: 0, y: 0 });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize({ width: 0, height: 0 });
    } else if (size.height) {
      // 从全屏切换到窗口模式时，调整位置避免被导航栏遮挡
      const navbarHeight = 64;
      const windowHeight = window.innerHeight;
      const modalHeight = size.height || 600;

      // 计算居中位置，但确保顶部不会被导航栏遮挡
      const centeredY = 0; // 默认居中
      const topEdge = windowHeight / 2 + centeredY - modalHeight / 2;

      // 如果顶部会被导航栏遮挡，向下调整
      if (topEdge < navbarHeight) {
        const adjustedY = navbarHeight - windowHeight / 2 + modalHeight / 2 + 20; // 额外 20px 间距
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPosition({ x: 0, y: adjustedY });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    }
    // 同步全屏状态到 store（用于隐藏导航栏）
    setKnowledgeFullscreen(isFullscreen);
  }, [isFullscreen, setKnowledgeFullscreen, size.height]);

  // 鼠标移动处理
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDragging && dragRef.current && modalRef.current) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;

        let newX = dragRef.current.initialX + deltaX;
        let newY = dragRef.current.initialY + deltaY;

        // 获取窗口实际尺寸
        const rect = modalRef.current.getBoundingClientRect();
        const windowWidth = rect.width;
        const windowHeight = rect.height;

        // 计算窗口四个边的实际位置
        // 窗口定位：left: 50% + translateX(newX) - 50% (居中)
        const actualLeft = window.innerWidth / 2 + newX - windowWidth / 2;
        const actualRight = window.innerWidth / 2 + newX + windowWidth / 2;
        const actualTop = window.innerHeight / 2 + newY - windowHeight / 2;
        const actualBottom = window.innerHeight / 2 + newY + windowHeight / 2;

        // 边界限制
        const navbarHeight = 64;
        const minMargin = 0; // 最小边距

        // 限制顶部（不能超出导航栏）
        if (actualTop < navbarHeight) {
          newY = navbarHeight - window.innerHeight / 2 + windowHeight / 2;
        }

        // 限制底部
        if (actualBottom > window.innerHeight - minMargin) {
          newY = window.innerHeight - minMargin - window.innerHeight / 2 - windowHeight / 2;
        }

        // 限制左侧
        if (actualLeft < minMargin) {
          newX = minMargin - window.innerWidth / 2 + windowWidth / 2;
        }

        // 限制右侧
        if (actualRight > window.innerWidth - minMargin) {
          newX = window.innerWidth - minMargin - window.innerWidth / 2 - windowWidth / 2;
        }

        setPosition({
          x: newX,
          y: newY,
        });
      }

      if (isResizing && resizeRef.current && resizeDirection && modalRef.current) {
        e.preventDefault();

        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;

        requestAnimationFrame(() => {
          if (!resizeRef.current || !modalRef.current) return;

          let newWidth = resizeRef.current.initialWidth;
          let newHeight = resizeRef.current.initialHeight;
          let newX = resizeRef.current.initialX;
          let newY = resizeRef.current.initialY;

          const minWidth = 600;
          const minHeight = 400;
          const navbarHeight = 64;

          // 调整宽度（东西方向）
          if (resizeDirection!.includes("e")) {
            const potentialWidth = resizeRef.current.initialWidth + deltaX;
            // 检查右边界
            const actualRight = window.innerWidth / 2 + newX + potentialWidth / 2;
            if (actualRight <= window.innerWidth) {
              newWidth = Math.max(minWidth, potentialWidth);
            } else {
              newWidth = Math.max(minWidth, (window.innerWidth - window.innerWidth / 2 - newX) * 2);
            }
          }

          if (resizeDirection!.includes("w")) {
            const potentialWidth = resizeRef.current.initialWidth - deltaX;
            const potentialX = resizeRef.current.initialX + deltaX;
            // 检查左边界
            const actualLeft = window.innerWidth / 2 + potentialX - potentialWidth / 2;
            if (actualLeft >= 0 && potentialWidth >= minWidth) {
              newWidth = potentialWidth;
              newX = potentialX;
            }
          }

          // 调整高度（南北方向）
          if (resizeDirection!.includes("s")) {
            const potentialHeight = resizeRef.current.initialHeight + deltaY;
            // 检查下边界
            const actualBottom = window.innerHeight / 2 + newY + potentialHeight / 2;
            if (actualBottom <= window.innerHeight) {
              newHeight = Math.max(minHeight, potentialHeight);
            } else {
              newHeight = Math.max(
                minHeight,
                (window.innerHeight - window.innerHeight / 2 - newY) * 2,
              );
            }
          }

          if (resizeDirection!.includes("n")) {
            const potentialHeight = resizeRef.current.initialHeight - deltaY;
            const potentialY = resizeRef.current.initialY + deltaY;
            // 检查上边界（导航栏）
            const actualTop = window.innerHeight / 2 + potentialY - potentialHeight / 2;
            if (actualTop >= navbarHeight && potentialHeight >= minHeight) {
              newHeight = potentialHeight;
              newY = potentialY;
            }
          }

          setSize({ width: newWidth, height: newHeight });
          setPosition({ x: newX, y: newY });
        });
      }
    }

    function handleMouseUp() {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
      dragRef.current = null;
      resizeRef.current = null;
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, resizeDirection]);

  // 如果没有文章，不渲染（所有 hooks 调用完成后才能 return）
  if (!article) return null;

  // 拖拽开始
  function handleDragStart(e: React.MouseEvent) {
    if (isFullscreen || isMinimized) return;

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  }

  // 调整大小开始
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

  // 窗口控制
  const handleMinimize = () => setIsMinimized(!isMinimized);
  const handleMaximize = () => setIsFullscreen(!isFullscreen);
  const handleClose = () => {
    setIsMinimized(false);
    setIsFullscreen(false);
    setKnowledgeFullscreen(false); // 关闭时恢复导航栏
    onClose();
  };

  // 最小化状态
  if (isMinimized) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <button
          onClick={handleMinimize}
          className="bg-cyber-dark/95 border-cyber-cyan/50 hover:bg-cyber-dark shadow-neon-cyan flex items-center gap-2 rounded-lg border px-4 py-2 text-white backdrop-blur-xl transition-colors"
        >
          <span className="font-orbitron max-w-[200px] truncate text-sm">{article.title}</span>
          <Square className="h-4 w-4 flex-shrink-0" />
        </button>
      </div>
    );
  }

  const modalStyle = isFullscreen
    ? { width: "100vw", height: "100vh", transform: "translate(0, 0)" }
    : size.width > 0
      ? {
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: `translate(${position.x}px, ${position.y}px)`,
        }
      : {};

  return (
    <div
      ref={modalRef}
      className={`fixed ${isFullscreen ? "inset-0" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"} bg-cyber-dark/95 z-50 flex flex-col border border-white/10 backdrop-blur-xl ${isFullscreen ? "" : "rounded-xl shadow-2xl"}`}
      style={modalStyle}
    >
      {/* 调整大小手柄 */}
      {!isFullscreen && (
        <>
          <div
            className="absolute top-0 right-0 left-0 z-10 h-2 cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="absolute right-0 bottom-0 left-0 z-10 h-2 cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute top-0 bottom-0 left-0 z-10 w-2 cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute top-0 right-0 bottom-0 z-10 w-2 cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
          <div
            className="absolute top-0 left-0 z-10 h-4 w-4 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute top-0 right-0 z-10 h-4 w-4 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute bottom-0 left-0 z-10 h-4 w-4 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute right-0 bottom-0 z-10 h-4 w-4 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
        </>
      )}

      {/* 标题栏 - 固定在顶部，始终可见 */}
      <div
        className={`bg-cyber-dark/95 flex flex-shrink-0 cursor-move items-center justify-between border-b border-white/10 p-4 backdrop-blur-xl select-none ${isFullscreen ? "" : "rounded-t-xl"}`}
        onMouseDown={handleDragStart}
      >
        <div className="mr-4 flex flex-1 items-center gap-3">
          {/* 目录切换按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowToc(!showToc);
            }}
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            title={showToc ? "隐藏目录" : "显示目录"}
          >
            <Menu className="h-4 w-4" />
          </button>

          <h3 className="font-orbitron truncate text-lg font-bold text-white">{article.title}</h3>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={handleMinimize}
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            title="最小化"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={handleMaximize}
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            title={isFullscreen ? "窗口化" : "最大化"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 内容区 - 左侧目录 + 右侧文章 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧目录 - 始终基于完整内容生成 */}
        {showToc && (
          <div className="cyber-scrollbar w-64 flex-shrink-0 overflow-y-auto border-r border-white/10 bg-white/5">
            <TableOfContents
              content={article.content} // 使用完整内容生成目录
              scrollContainerId="article-content-scroll"
              onItemClick={() => {
                // 点击目录时，强制加载完整内容
                if (!forceFullContent) {
                  setForceFullContent(true);
                }
              }}
            />
          </div>
        )}

        {/* 右侧文章内容 */}
        <div id="article-content-scroll" className="flex-1 overflow-x-hidden overflow-y-auto">
          <ProgressiveMarkdownPreview
            content={article.content}
            fullContent={article.content} // 传递完整内容用于生成正确的 ID
            images={article.images}
            isLoading={isLoading}
            forceFullContent={forceFullContent}
          />
        </div>
      </div>
    </div>
  );
}
