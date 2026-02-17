'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import AuthModal from './AuthModal'

type AuthView = 'login' | 'signup' | 'forgot-password'

interface AuthContextType {
  openAuthModal: (view?: AuthView) => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

/**
 * 认证提供者组件
 * 
 * 管理认证模态框的全局状态
 * 提供打开/关闭模态框的方法
 * 
 * 验证需求：1.2, 1.4, 8.2
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialView, setInitialView] = useState<AuthView>('login')

  const openAuthModal = (view: AuthView = 'login') => {
    setInitialView(view)
    setIsModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsModalOpen(false)
  }

  return (
    <AuthContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={closeAuthModal}
        initialView={initialView}
      />
    </AuthContext.Provider>
  )
}
