"use client";

import { useState, useRef, useEffect } from "react";
import { X, Minus, Maximize2, Minimize2, Square, Menu } from "lucide-react";
import { ProgressiveMarkdownPreview } from "./ProgressiveMarkdownPreview";
import { TableOfContents } from "./TableOfContents";
import { useAppStore } from "@/store/appStore";
import type { Article } from "@/types";

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

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
  
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
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
      setPosition({ x: 0, y: 0 });
      setSize({ width: 0, height: 0 });
    } else {
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
          y: newY
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
          if (resizeDirection!.includes('e')) {
            const potentialWidth = resizeRef.current.initialWidth + deltaX;
            // 检查右边界
            const actualRight = window.innerWidth / 2 + newX + potentialWidth / 2;
            if (actualRight <= window.innerWidth) {
              newWidth = Math.max(minWidth, potentialWidth);
            } else {
              newWidth = Math.max(minWidth, (window.innerWidth - window.innerWidth / 2 - newX) * 2);
            }
          }
          
          if (resizeDirection!.includes('w')) {
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
          if (resizeDirection!.includes('s')) {
            const potentialHeight = resizeRef.current.initialHeight + deltaY;
            // 检查下边界
            const actualBottom = window.innerHeight / 2 + newY + potentialHeight / 2;
            if (actualBottom <= window.innerHeight) {
              newHeight = Math.max(minHeight, potentialHeight);
            } else {
              newHeight = Math.max(minHeight, (window.innerHeight - window.innerHeight / 2 - newY) * 2);
            }
          }
          
          if (resizeDirection!.includes('n')) {
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
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
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
      initialY: position.y
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
      initialY: position.y
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
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleMinimize}
          className="flex items-center gap-2 px-4 py-2 bg-cyber-dark/95 backdrop-blur-xl border border-cyber-cyan/50 rounded-lg text-white hover:bg-cyber-dark transition-colors shadow-neon-cyan"
        >
          <span className="font-orbitron text-sm truncate max-w-[200px]">{article.title}</span>
          <Square className="w-4 h-4 flex-shrink-0" />
        </button>
      </div>
    );
  }

  const modalStyle = isFullscreen
    ? { width: '100vw', height: '100vh', transform: 'translate(0, 0)' }
    : size.width > 0
      ? { 
          width: `${size.width}px`, 
          height: `${size.height}px`,
          transform: `translate(${position.x}px, ${position.y}px)`
        }
      : {};

  return (
    <div
      ref={modalRef}
      className={`fixed ${isFullscreen ? 'inset-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} z-50 flex flex-col bg-cyber-dark/95 backdrop-blur-xl border border-white/10 ${isFullscreen ? '' : 'rounded-xl shadow-2xl'}`}
      style={modalStyle}
    >
      {/* 调整大小手柄 */}
      {!isFullscreen && (
        <>
          <div className="absolute top-0 left-0 right-0 h-2 cursor-n-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'n')} />
          <div className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize z-10" onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className="absolute top-0 bottom-0 left-0 w-2 cursor-w-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'w')} />
          <div className="absolute top-0 bottom-0 right-0 w-2 cursor-e-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'e')} />
          <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
          <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        </>
      )}

      {/* 标题栏 - 固定在顶部，始终可见 */}
      <div
        className={`flex items-center justify-between p-4 border-b border-white/10 bg-cyber-dark/95 backdrop-blur-xl cursor-move select-none flex-shrink-0 ${isFullscreen ? '' : 'rounded-t-xl'}`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-3 flex-1 mr-4">
          {/* 目录切换按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowToc(!showToc);
            }}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={showToc ? "隐藏目录" : "显示目录"}
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <h3 className="text-lg font-orbitron font-bold text-white truncate">
            {article.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleMinimize}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="最小化"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={isFullscreen ? "窗口化" : "最大化"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 内容区 - 左侧目录 + 右侧文章 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧目录 */}
        {showToc && (
          <div className="w-64 border-r border-white/10 bg-white/5 overflow-y-auto cyber-scrollbar flex-shrink-0">
            <TableOfContents 
              content={article.content}
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
        <div id="article-content-scroll" className="flex-1 overflow-y-auto overflow-x-hidden">
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
