"use client";

import { X, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

/**
 * 登录提示模态框
 *
 * 当未登录用户尝试使用智能体时显示
 * 提供登录和注册选项
 * 验证需求：18.10
 */
export function LoginPromptModal({
  isOpen,
  onClose,
  message = "请先登录以使用智能体功能",
}: LoginPromptModalProps) {
  const { openAuthModal } = useAuth();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    openAuthModal("login");
  };

  const handleSignup = () => {
    onClose();
    openAuthModal("signup");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="relative rounded-lg border border-cyan-500/50 bg-[#0a0a0a]/95 p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] backdrop-blur-xl">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 图标 */}
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
                <LogIn className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h3 className="mb-2 text-center text-xl font-bold text-white">需要登录</h3>

          {/* 描述 */}
          <p className="mb-6 text-center text-white/70">{message}</p>

          {/* 按钮组 */}
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-medium text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-600 hover:to-blue-600"
            >
              <LogIn className="h-5 w-5" />
              <span>登录</span>
            </button>

            <button
              onClick={handleSignup}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              <UserPlus className="h-5 w-5" />
              <span>注册新账户</span>
            </button>
          </div>

          {/* 提示信息 */}
          <p className="mt-4 text-center text-xs text-white/40">
            注册即可获得 50 永久积分 + 20 每日积分
          </p>
        </div>
      </div>
    </div>
  );
}
