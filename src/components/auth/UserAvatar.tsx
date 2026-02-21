/**
 * 用户头像组件
 *
 * 优先显示用户上传的头像，如果没有则显示基于用户名首字母的头像
 * 支持下拉菜单显示积分余额和快捷操作
 * 验证需求：10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Users, Coins, Gift, LogOut, HelpCircle, Shield, MessageSquare } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import InviteFriendsModal from "./InviteFriendsModal";
import FeedbackModal from "@/components/feedback/FeedbackModal";

interface UserAvatarProps {
  user: {
    username?: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
  showMenu?: boolean;
}

export default function UserAvatar({
  user,
  size = "md",
  className = "",
  showMenu = true,
}: UserAvatarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [permanentCredits, setPermanentCredits] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 获取显示名称（优先用户名，否则用邮箱）
  const displayName = user.username || user.email;

  // 获取积分余额
  const fetchCreditBalance = async () => {
    try {
      const res = await fetch("/api/credits/balance");
      if (res.ok) {
        const data = await res.json();
        setCreditBalance(data.total);
        setPermanentCredits(data.permanent);
      }
    } catch (error) {
      console.error("Failed to fetch credit balance:", error);
    }
  };

  useEffect(() => {
    if (showMenu) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCreditBalance();
    }
  }, [showMenu]);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  async function handleSignOut() {
    try {
      const result = await signOut();
      if (result?.success) {
        // 登出成功，刷新页面
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }

  function handleMenuItemClick(action: string) {
    setIsMenuOpen(false);

    switch (action) {
      case "invite":
        setIsInviteModalOpen(true);
        break;
      case "vault":
        router.push("/vault");
        break;
      case "feedback":
        setIsFeedbackModalOpen(true);
        break;
      case "admin":
        router.push("/admin");
        break;
      case "signout":
        handleSignOut();
        break;
    }
  }

  // 获取首字母（支持中文和英文）
  const getInitial = (name: string): string => {
    if (!name) return "?";

    // 如果是邮箱，取 @ 前面的部分
    const cleanName = name.includes("@") ? name.split("@")[0] : name;

    // 取第一个字符（支持中文）
    return cleanName.charAt(0).toUpperCase();
  };

  const initial = getInitial(displayName);

  // 根据首字母生成颜色（确保同一用户颜色一致）
  const getColorFromInitial = (char: string): string => {
    const colors = [
      "from-cyan-500 to-blue-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-teal-500 to-cyan-500",
      "from-rose-500 to-pink-500",
      "from-amber-500 to-orange-500",
    ];

    const charCode = char.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const gradientColor = getColorFromInitial(initial);

  // 尺寸映射
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-10 w-10 text-base",
    lg: "h-24 w-24 text-3xl",
  };

  const sizeClass = sizeClasses[size];

  // 渲染头像内容
  const renderAvatar = () => {
    // 如果有头像 URL，尝试显示（但不使用 Next Image 避免超时问题）
    if (user.avatar_url) {
      return (
        <div className={`relative ${sizeClass} overflow-hidden rounded-full`}>
          <img
            src={user.avatar_url}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={(e) => {
              // 加载失败时，隐藏图片，显示首字母头像
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          {/* 首字母头像作为 fallback */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradientColor} flex items-center justify-center font-semibold text-white`}
            style={{ display: "none" }}
          >
            {initial}
          </div>
        </div>
      );
    }

    // 默认显示首字母头像
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center font-semibold text-white`}
      >
        {initial}
      </div>
    );
  };

  // 如果不显示菜单，直接返回头像
  if (!showMenu) {
    return <div className={className}>{renderAvatar()}</div>;
  }

  // 显示带下拉菜单的头像
  return (
    <>
      <div className={`relative ${className}`} ref={menuRef}>
        {/* 头像按钮 */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full transition-all duration-200 hover:opacity-80 focus:ring-2 focus:ring-white/20 focus:outline-none"
        >
          {renderAvatar()}
        </button>

        {/* 下拉菜单 */}
        {isMenuOpen && (
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-white/10 bg-black/95 shadow-xl backdrop-blur-xl">
            {/* 用户信息 */}
            <div className="border-b border-white/10 px-4 py-3">
              <p className="truncate font-medium text-white">{displayName}</p>
              <p className="truncate text-sm text-white/60">{user.email}</p>
            </div>

            {/* 积分余额 */}
            <div className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">剩余积分</span>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <HelpCircle className="h-4 w-4 cursor-help text-white/40 transition-colors hover:text-white/60" />
                    {showTooltip && permanentCredits !== null && creditBalance !== null && (
                      <div className="absolute top-6 left-0 z-50 w-48 rounded-lg border border-white/20 bg-black/95 p-2 text-xs text-white/80 shadow-xl">
                        包含 {permanentCredits} 永久积分 + {creditBalance - permanentCredits} 每日积分
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-lg font-bold text-white">
                    {creditBalance !== null ? creditBalance : "..."}
                  </span>
                </div>
              </div>
            </div>

            {/* 菜单项 */}
            <div className="py-2">
              <button
                onClick={() => handleMenuItemClick("invite")}
                className="flex w-full items-center gap-3 px-4 py-2 text-white/80 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              >
                <Users className="h-4 w-4" />
                <span>邀请好友</span>
              </button>

              <button
                onClick={() => handleMenuItemClick("vault")}
                className="flex w-full items-center gap-3 px-4 py-2 text-white/80 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              >
                <Gift className="h-4 w-4" />
                <span>兑换码</span>
              </button>

              <button
                onClick={() => handleMenuItemClick("feedback")}
                className="flex w-full items-center gap-3 px-4 py-2 text-white/80 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                <span>反馈</span>
              </button>

              {/* 管理后台入口（仅管理员可见） */}
              {user.role === "admin" && (
                <>
                  <div className="my-2 border-t border-white/10"></div>
                  <button
                    onClick={() => handleMenuItemClick("admin")}
                    className="flex w-full items-center gap-3 px-4 py-2 text-purple-400 transition-colors duration-200 hover:bg-purple-500/10 hover:text-purple-300"
                  >
                    <Shield className="h-4 w-4" />
                    <span>管理后台</span>
                  </button>
                </>
              )}

              <div className="my-2 border-t border-white/10"></div>

              <button
                onClick={() => handleMenuItemClick("signout")}
                className="flex w-full items-center gap-3 px-4 py-2 text-red-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span>登出</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 邀请好友模态框 */}
      <InviteFriendsModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {/* 反馈模态框 */}
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </>
  );
}
