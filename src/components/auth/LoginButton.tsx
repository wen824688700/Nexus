'use client'

interface LoginButtonProps {
  onClick: () => void
}

/**
 * 登录按钮组件
 * 
 * 显示在首页，点击时打开认证模态框
 * 验证需求：1.1, 1.2, 1.3
 */
export default function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20"
      aria-label="登录"
    >
      登录
    </button>
  )
}
