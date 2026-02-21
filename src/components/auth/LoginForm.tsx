"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, signInWithGoogle } from "@/app/auth/actions";

interface LoginFormProps {
  onForgotPassword: () => void;
  onSignup: () => void;
}

/**
 * 登录表单组件
 *
 * 支持用户名/邮箱 + 密码登录和 Google OAuth 登录
 * 验证需求：2.1, 2.2, 2.6, 4.1, 8.3, 15.1, 15.2
 */
export default function LoginForm({ onForgotPassword, onSignup }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 阻止表单默认提交行为
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // 登录成功，强制刷新整个页面
        window.location.href = "/";
      }
    });
  }

  async function handleGoogleSignIn() {
    setError(null);
    startTransition(async () => {
      const result = await signInWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
      // Google OAuth 会自动重定向
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 错误提示 */}
      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 用户名或邮箱 */}
      <div>
        <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-white/80">
          用户名或邮箱
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          disabled={isPending}
          className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="输入用户名或邮箱"
        />
      </div>

      {/* 密码 */}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-white/80">
          密码
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={isPending}
            className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="输入密码"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/60 disabled:opacity-50"
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* 忘记密码 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={isPending}
          className="text-sm text-white/60 transition-colors hover:text-white disabled:opacity-50"
        >
          忘记密码？
        </button>
      </div>

      {/* 登录按钮 */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-white px-4 py-2.5 font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "登录中..." : "登录"}
      </button>

      {/* 分隔线 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#0a0a0a] px-2 text-white/60">或</span>
        </div>
      </div>

      {/* Google 登录 */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        使用 Google 登录
      </button>

      {/* 注册链接 */}
      <p className="text-center text-sm text-white/60">
        还没有账户？{" "}
        <button
          type="button"
          onClick={onSignup}
          disabled={isPending}
          className="text-white transition-all hover:underline disabled:opacity-50"
        >
          立即注册
        </button>
      </p>
    </form>
  );
}
