"use client";

import LoginButton from "./LoginButton";
import UserAvatar from "./UserAvatar";
import { useAuth } from "./AuthProvider";

interface NavbarAuthProps {
  user: {
    id: string;
    email: string;
    username?: string;
    avatar_url?: string;
    role?: string;
  } | null;
}

/**
 * 导航栏认证组件
 *
 * 根据用户认证状态显示登录按钮或用户菜单
 * 验证需求：1.4, 10.1
 */
export function NavbarAuth({ user }: NavbarAuthProps) {
  const { openAuthModal } = useAuth();

  if (user) {
    return <UserAvatar user={user} showMenu={true} />;
  }

  return <LoginButton onClick={() => openAuthModal("login")} />;
}
