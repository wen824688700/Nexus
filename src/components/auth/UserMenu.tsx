'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'
import { signOut } from '@/app/auth/actions'

interface UserMenuProps {
  user: {
    id: string
    email: string
    username?: string
    avatar_url?: string
  }
}

/**
 * 用户菜单组件
 * 
 * 显示用户信息和登出选项
 * 验证需求：10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */
export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  const displayName = user.username || user.email

  return (
    <div className="relative" ref={menuRef}>
      {/* 菜单按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20"
        aria-label="用户菜单"
        aria-expanded={isOpen}
      >
        {/* 头像 */}
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={displayName}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
            <User size={14} className="text-white/60" />
          </div>
        )}
        
        {/* 用户名/邮箱 */}
        <span className="text-sm font-medium text-white max-w-[120px] truncate">
          {displayName}
        </span>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl backdrop-blur-sm">
          {/* 用户信息 */}
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <User size={20} className="text-white/60" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {user.username && (
                  <p className="text-sm font-medium text-white truncate">
                    {user.username}
                  </p>
                )}
                <p className="text-xs text-white/60 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* 登出按钮 */}
          <div className="p-2">
            <button
              onClick={handleSignOut}
              disabled={isPending}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={16} />
              <span>{isPending ? '登出中...' : '登出'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
