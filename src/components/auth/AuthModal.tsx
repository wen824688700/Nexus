'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ForgotPasswordForm from './ForgotPasswordForm'

type View = 'login' | 'signup' | 'forgot-password'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: View
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialView = 'login' 
}: AuthModalProps) {
  const [view, setView] = useState<View>(initialView)

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div 
        className="relative w-full max-w-md rounded-lg border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 transition-colors hover:text-white"
          aria-label="关闭"
        >
          <X size={20} />
        </button>

        {/* 标题 */}
        <h2 className="mb-6 text-2xl font-bold text-white">
          {view === 'login' && '登录'}
          {view === 'signup' && '注册'}
          {view === 'forgot-password' && '重置密码'}
        </h2>

        {/* 表单内容 */}
        {view === 'login' && (
          <LoginForm 
            onForgotPassword={() => setView('forgot-password')}
            onSignup={() => setView('signup')}
          />
        )}
        {view === 'signup' && (
          <SignupForm onLogin={() => setView('login')} />
        )}
        {view === 'forgot-password' && (
          <ForgotPasswordForm onBack={() => setView('login')} />
        )}
      </div>
    </div>
  )
}
