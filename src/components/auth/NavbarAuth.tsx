'use client'

import LoginButton from './LoginButton'
import UserMenu from './UserMenu'
import { useAuth } from './AuthProvider'

interface NavbarAuthProps {
  user: {
    id: string
    email: string
    username?: string
    avatar_url?: string
  } | null
}

/**
 * 导航栏认证组件
 * 
 * 根据用户认证状态显示登录按钮或用户菜单
 * 验证需求：1.4, 10.1
 */
export function NavbarAuth({ user }: NavbarAuthProps) {
  const { openAuthModal } = useAuth()

  if (user) {
    return <UserMenu user={user} />
  }

  return <LoginButton onClick={() => openAuthModal('login')} />
}
