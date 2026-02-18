"use client";

import { useState, useTransition } from "react";
import { resetPassword } from "@/app/auth/actions";
import { calculatePasswordStrength } from "@/lib/auth/validation";

/**
 * 重置密码表单组件
 *
 * 设置新密码，包含密码强度指示器
 * 验证需求：13.3, 13.4
 */
export default function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const passwordStrength = password ? calculatePasswordStrength(password) : null;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  async function handleSubmit(formData: FormData) {
    setError(null);

    // 验证密码匹配
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(formData);

      if (result?.error) {
        setError(result.error);
      }
      // 成功时会自动重定向到首页
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* 说明文字 */}
      <p className="text-sm text-white/60">
        请输入您的新密码。密码必须至少 8 个字符，包含大小写字母和数字。
      </p>

      {/* 错误提示 */}
      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 新密码 */}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-white/80">
          新密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isPending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="至少 8 个字符，包含大小写字母和数字"
        />

        {/* 密码强度指示器 */}
        {passwordStrength && (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-white/60">密码强度</span>
              <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(passwordStrength.score / 4) * 100}%`,
                  backgroundColor: passwordStrength.color,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 确认密码 */}
      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-white/80">
          确认密码
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          disabled={isPending}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="再次输入新密码"
        />

        {/* 密码匹配提示 */}
        {confirmPassword && (
          <p className={`mt-1 text-xs ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
            {passwordsMatch ? "✓ 密码匹配" : "✗ 密码不匹配"}
          </p>
        )}
      </div>

      {/* 重置按钮 */}
      <button
        type="submit"
        disabled={isPending || !passwordsMatch || !password}
        className="w-full rounded bg-white px-4 py-2.5 font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "重置中..." : "重置密码"}
      </button>
    </form>
  );
}
