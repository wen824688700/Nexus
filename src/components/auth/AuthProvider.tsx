"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";
import InviteFriendsModal from "./InviteFriendsModal";
import { WelcomeModal } from "./WelcomeModal";

type AuthView = "login" | "signup" | "forgot-password";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  openAuthModal: (view?: AuthView) => void;
  closeAuthModal: () => void;
  openInviteFriendsModal: () => void;
  closeInviteFriendsModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证提供者组件
 *
 * 管理认证模态框的全局状态和用户认证状态
 * 提供打开/关闭模态框的方法
 *
 * 验证需求：1.2, 1.4, 8.2
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialView, setInitialView] = useState<AuthView>("login");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // 如果用户已登录且未禁用欢迎弹窗，显示欢迎消息
      if (session?.user) {
        const dismissed = localStorage.getItem("apex_welcome_dismissed");
        if (!dismissed) {
          // 延迟 1 秒显示，体验更好
          setTimeout(() => setIsWelcomeModalOpen(true), 1000);
        }
      }
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const previousUser = user;
      setUser(session?.user ?? null);
      setLoading(false);
      
      // 当用户登录时（从无用户到有用户），显示欢迎弹窗
      if (event === "SIGNED_IN" && session?.user && !previousUser) {
        const dismissed = localStorage.getItem("apex_welcome_dismissed");
        if (!dismissed) {
          setTimeout(() => setIsWelcomeModalOpen(true), 1000);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  const openAuthModal = (view: AuthView = "login") => {
    setInitialView(view);
    setIsModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsModalOpen(false);
  };

  const openInviteFriendsModal = () => {
    setIsInviteModalOpen(true);
  };

  const closeInviteFriendsModal = () => {
    setIsInviteModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        openAuthModal,
        closeAuthModal,
        openInviteFriendsModal,
        closeInviteFriendsModal,
      }}
    >
      {children}
      <AuthModal isOpen={isModalOpen} onClose={closeAuthModal} initialView={initialView} />
      <InviteFriendsModal isOpen={isInviteModalOpen} onClose={closeInviteFriendsModal} />
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
    </AuthContext.Provider>
  );
}
