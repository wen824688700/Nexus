"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface WindowFrameProps {
  id: string;
  title: string;
  icon?: string;
  zIndex: number;
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  onClose: () => void;
  onFocus: () => void;
  children: ReactNode;
}

export function WindowFrame({
  title,
  icon,
  zIndex,
  width = "320px",
  height = "240px",
  top = "40px",
  left = "60px",
  onClose,
  onFocus,
  children,
}: WindowFrameProps) {
  const [position, setPosition] = useState({ top, left });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startTop: 0, startLeft: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // 只在标题栏上触发拖拽
    if ((e.target as HTMLElement).closest(".window-titlebar")) {
      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startTop: parseInt(position.top),
        startLeft: parseInt(position.left),
      };
      onFocus();
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      const newTop = dragRef.current.startTop + deltaY;
      const newLeft = dragRef.current.startLeft + deltaX;

      // 限制窗口不超出边界（简单版本，可以根据需要调整）
      const boundedTop = Math.max(0, Math.min(newTop, 600 - 100)); // 600是CRT高度
      const boundedLeft = Math.max(0, Math.min(newLeft, 800 - 100)); // 800是CRT宽度

      setPosition({
        top: `${boundedTop}px`,
        left: `${boundedLeft}px`,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position.top, position.left]);

  return (
    <div
      className="absolute flex flex-col overflow-hidden border-2 border-t-white/10 border-r-black/50 border-b-black/50 border-l-white/10 bg-[#1f1f1f] shadow-2xl"
      style={{ width, height, top: position.top, left: position.left, zIndex }}
      onMouseDown={handleMouseDown}
    >
      {/* 标题栏 */}
      <div className="window-titlebar flex cursor-move items-center justify-between bg-[#0a2540] p-1 px-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="truncate font-mono text-[10px] font-bold text-white uppercase">
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-4 w-4 items-center justify-center border border-t-white/10 border-r-black border-b-black border-l-white/10 bg-[#1f1f1f] text-[9px] text-white"
        >
          ✕
        </button>
      </div>

      {/* 内容区 */}
      <div className="m-1 flex-1 overflow-auto border-2 border-t-black/50 border-r-white/10 border-b-white/10 border-l-black/50 bg-[#0a0a0a]">
        {children}
      </div>
    </div>
  );
}
