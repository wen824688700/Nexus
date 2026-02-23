"use client";

import { useEffect, useId } from "react";
import { RetroOSProvider } from "./RetroOSContext";
import { MonitorShell } from "./MonitorShell";

interface RetroOSModalProps {
  mounted: boolean;
  visible: boolean;
  onClose: () => void;
}

export function RetroOSModal({ mounted, visible, onClose }: RetroOSModalProps) {
  const titleId = useId();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleEsc);
      // 防止背景滚动
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "";
      };
    }
  }, [visible, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[55] flex items-center justify-center overflow-auto bg-black/95 p-4 backdrop-blur-2xl transition-all duration-500",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <RetroOSProvider>
        <div className="relative max-h-full w-full max-w-full px-4 md:max-w-[1200px]">
          {/* 关闭按钮 - 定位在安全区域内 */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/20 bg-black/80 text-white/60 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/90 hover:text-white md:-top-4 md:-right-4 md:h-10 md:w-10"
            aria-label="关闭"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <MonitorShell />
        </div>
      </RetroOSProvider>
    </div>
  );
}
