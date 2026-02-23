import React from "react";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  enableSafeArea?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

/**
 * ResponsiveContainer - 统一的响应式容器组件
 * 
 * 提供一致的响应式内边距、最大宽度控制和安全区域支持
 * 
 * @param children - 子元素
 * @param className - 额外的 CSS 类名
 * @param enableSafeArea - 是否启用安全区域内边距（用于刘海屏设备）
 * @param maxWidth - 最大宽度断点（sm/md/lg/xl/2xl/full）
 */
export function ResponsiveContainer({
  children,
  className = "",
  enableSafeArea = false,
  maxWidth = "full",
}: ResponsiveContainerProps) {
  // 根据 maxWidth 参数生成对应的 Tailwind 类
  const maxWidthClass = maxWidth === "full" ? "max-w-full" : `max-w-${maxWidth}`;

  // 响应式水平内边距：移动端 16px (px-4)，平板 24px (md:px-6)，桌面 32px (lg:px-8)
  const paddingClass = "px-4 md:px-6 lg:px-8";

  // 安全区域内边距（可选）
  const safeAreaClass = enableSafeArea
    ? "[padding-top:max(1rem,env(safe-area-inset-top))] [padding-bottom:max(1rem,env(safe-area-inset-bottom))] [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))]"
    : "";

  return (
    <div
      className={`${maxWidthClass} ${paddingClass} ${safeAreaClass} mx-auto ${className}`}
    >
      {children}
    </div>
  );
}
