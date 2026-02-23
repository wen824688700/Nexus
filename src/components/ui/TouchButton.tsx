"use client";

import { ButtonHTMLAttributes, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

/**
 * TouchButton - 移动端优化的触摸按钮组件
 * 
 * 特性：
 * - 最小触摸目标 44x44px
 * - 触摸反馈动画（active:scale-95）
 * - 300ms 防抖处理
 * - 支持 primary/secondary/ghost 变体
 * 
 * 验证需求：2.7, 6.1, 6.4
 */
export function TouchButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}: TouchButtonProps) {
  const lastClickTime = useRef<number>(0);
  const DEBOUNCE_DELAY = 300; // 300ms 防抖

  // 防抖处理的点击事件
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const now = Date.now();
      
      // 如果距离上次点击小于 300ms，忽略此次点击
      if (now - lastClickTime.current < DEBOUNCE_DELAY) {
        e.preventDefault();
        return;
      }
      
      lastClickTime.current = now;
      onClick?.(e);
    },
    [onClick]
  );

  // 变体样式
  const variantStyles = {
    primary: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    secondary: "bg-transparent hover:bg-white/5 text-white/70 border border-white/10",
    ghost: "bg-transparent hover:bg-white/5 text-white/70 border-0",
  };

  // 尺寸样式（确保最小 44x44px 触摸目标）
  const sizeStyles = {
    sm: "min-h-[44px] min-w-[44px] px-4 py-2 text-sm",
    md: "min-h-[44px] min-w-[44px] px-6 py-3 text-base",
    lg: "min-h-[48px] min-w-[48px] px-8 py-4 text-lg",
  };

  // 禁用状态样式
  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        // 基础样式
        "relative inline-flex items-center justify-center",
        "rounded-lg font-medium",
        "transition-all duration-150 ease-out",
        // 触摸反馈动画
        "active:scale-95",
        // 焦点状态
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        // 变体和尺寸
        variantStyles[variant],
        sizeStyles[size],
        disabledStyles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
