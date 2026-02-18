/**
 * 邀请好友模态框组件
 *
 * 显示用户的邀请链接和邀请码，支持一键复制
 * 使用 Portal 渲染到 body 最外层，确保正确的层级和定位
 */

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Users, Gift } from "lucide-react";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteFriendsModal({ isOpen, onClose }: InviteFriendsModalProps) {
  const [inviteCode, setInviteCode] = useState<string>("");
  const [inviteLink, setInviteLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // 标记是否已加载过

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 只在第一次打开且未加载过时才请求
    if (isOpen && !hasLoaded) {
      fetchInviteInfo();
    }
  }, [isOpen, hasLoaded]);

  async function fetchInviteInfo() {
    try {
      setLoading(true);
      const res = await fetch("/api/invitations/info");
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
        setInviteLink(data.inviteLink);
        setHasLoaded(true); // 标记已加载
      }
    } catch (error) {
      console.error("Failed to fetch invite info:", error);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string, type: "link" | "code") {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900 via-purple-950/30 to-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_50%)]" />

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-lg p-2 text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 内容 */}
        <div className="relative p-8">
          {/* 标题 */}
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">邀请好友</h2>
              <p className="text-sm text-white/70">分享你的专属邀请码，共同获得奖励</p>
            </div>
          </div>

          {/* 奖励说明 */}
          <div className="mb-6 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4">
            <div className="flex items-start gap-3">
              <Gift className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-300" />
              <div className="text-sm text-white">
                <p className="mb-1 font-medium text-white">邀请奖励</p>
                <p className="text-white/80">
                  好友使用你的邀请码注册，你和好友各获得{" "}
                  <span className="font-bold text-purple-300">30 永久积分</span>
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* 邀请链接 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">邀请链接</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteLink, "link")}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-medium text-white shadow-lg shadow-purple-500/30 transition-all duration-200 hover:from-purple-600 hover:to-pink-600"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 邀请码 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">邀请码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteCode}
                    readOnly
                    className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-center font-mono text-xl font-bold tracking-wider text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteCode, "code")}
                    className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-white/20"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-6 rounded-lg border border-white/20 bg-white/5 p-4">
            <p className="text-xs leading-relaxed text-white/70">
              💡 <span className="font-medium text-white/90">使用方法：</span>
              <br />
              1. 复制邀请链接发送给好友，或直接分享邀请码
              <br />
              2. 好友注册时输入你的邀请码
              <br />
              3. 注册成功后，双方立即获得 30 永久积分奖励
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
