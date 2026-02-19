"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";
import InviteFriendsModal from "./InviteFriendsModal";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    </AuthContext.Provider>
  );
}
