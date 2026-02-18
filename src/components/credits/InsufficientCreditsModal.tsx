"use client";

import { X, Coins } from "lucide-react";
import Link from "next/link";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  required: number;
  current: number;
}

/**
 * 积分不足提示模态框
 *
 * 当用户积分不足时显示，提供跳转到量子密匣充值的选项
 * 验证需求：1.7, 17.3
 */
export function InsufficientCreditsModal({
  isOpen,
  onClose,
  required,
  current,
}: InsufficientCreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="relative rounded-lg border border-red-500/50 bg-[#0a0a0a]/95 p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-xl">
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
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                <Coins className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h3 className="mb-2 text-center text-xl font-bold text-white">积分不足</h3>

          {/* 描述 */}
          <div className="mb-6 space-y-2 text-center text-white/70">
            <p>
              当前操作需要 <span className="font-semibold text-red-400">{required}</span> 积分
            </p>
            <p>
              您的余额：<span className="font-semibold text-white/90">{current}</span> 积分
            </p>
            <p className="text-sm text-white/50">
              还需要 <span className="text-red-400">{required - current}</span> 积分
            </p>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition-colors hover:bg-white/10"
            >
              取消
            </button>
            <Link
              href="/vault"
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-center font-medium text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-600 hover:to-blue-600"
              onClick={onClose}
            >
              去充值
            </Link>
          </div>

          {/* 提示信息 */}
          <p className="mt-4 text-center text-xs text-white/40">您可以通过兑换码获得永久积分</p>
        </div>
      </div>
    </div>
  );
}
