'use client'

import { useState, useTransition } from 'react'
import { forgotPassword } from '@/app/auth/actions'

interface ForgotPasswordFormProps {
  onBack: () => void
}

/**
 * 忘记密码表单组件
 * 
 * 发送密码重置邮件
 * 验证需求：13.1, 13.2
 */
export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      const result = await forgotPassword(formData)
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* 说明文字 */}
      <p className="text-sm text-white/60">
        输入您的邮箱地址，我们将向您发送密码重置链接。
      </p>

      {/* 成功提示 */}
      {success && (
        <div className="rounded border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 邮箱 */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
          邮箱地址
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="your@email.com"
        />
      </div>

      {/* 发送按钮 */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-white px-4 py-2.5 font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? '发送中...' : '发送重置链接'}
      </button>

      {/* 返回登录 */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
        >
          ← 返回登录
        </button>
      </div>
    </form>
  )
}
