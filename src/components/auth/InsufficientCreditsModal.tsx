/**
 * 积分不足提示模态框
 *
 * 当用户积分不足时显示
 * 提供充值和查看积分明细的选项
 */

"use client";

import { createPortal } from "react-dom";
import { X, Coins, Gift, ExternalLink } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  required: number;
  current: number;
  permanent: number;
  daily: number;
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  required,
  current,
  permanent,
  daily,
}: InsufficientCreditsModalProps) {
  const { openInviteFriendsModal } = useAuth();

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const shortage = required - current;

  const handleInviteFriends = () => {
    onClose();
    openInviteFriendsModal();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="relative rounded-lg border border-purple-500/50 bg-[#0a0a0a]/95 p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] backdrop-blur-xl">
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
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10">
                <Coins className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h3 className="mb-2 text-center text-xl font-bold text-white">积分不足</h3>

          {/* 描述 */}
          <p className="mb-4 text-center text-white/70">
            此操作需要 <span className="font-bold text-purple-400">{required}</span> 积分
          </p>

          {/* 积分余额 */}
          <div className="mb-6 space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">当前余额</span>
              <span className="font-bold text-white">{current} 积分</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">永久积分</span>
              <span className="text-white/60">{permanent}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">每日积分</span>
              <span className="text-white/60">{daily}</span>
            </div>
            <div className="mt-3 border-t border-white/10 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400">还需要</span>
                <span className="font-bold text-purple-400">{shortage} 积分</span>
              </div>
            </div>
          </div>

          {/* 按钮组 */}
          <div className="space-y-3">
            <button
              onClick={handleInviteFriends}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-medium text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:from-purple-600 hover:to-pink-600"
            >
              <Gift className="h-5 w-5" />
              <span>邀请好友获取积分</span>
            </button>

            <a
              href="/vault"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              <ExternalLink className="h-5 w-5" />
              <span>我有兑换码</span>
            </a>
          </div>

          {/* 提示信息 */}
          <p className="mt-4 text-center text-xs text-white/40">
            每日登录可获得 20 每日积分 • 邀请好友可获得永久积分
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
