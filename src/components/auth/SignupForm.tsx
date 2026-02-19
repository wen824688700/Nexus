"use client";

import { useState, useTransition } from "react";
import { signup, sendVerificationCode } from "@/app/auth/actions";
import { calculatePasswordStrength } from "@/lib/auth/validation";

interface SignupFormProps {
  onLogin: () => void;
}

/**
 * 注册表单组件
 *
 * 支持用户名、邮箱、密码注册，使用邮箱验证码验证
 * 验证需求：3.1, 3.2, 3.3, 6.6, 7.4, 7.5, 15.1, 15.2
 */
export default function SignupForm({ onLogin }: SignupFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isSendingCode, setIsSendingCode] = useState(false);

  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  // 发送验证码
  async function handleSendCode() {
    if (!email) {
      setError("请先输入邮箱地址");
      return;
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setIsSendingCode(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendVerificationCode(email);

      console.log("[SignupForm] Send code result:", result);

      if (result?.error) {
        console.error("[SignupForm] Send code error:", result.error);
        setError(result.error);
      } else if (result?.success) {
        console.log("[SignupForm] Code sent successfully");
        setCodeSent(true);
        setSuccess(result.message);
        // 开始 60 秒倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        console.error("[SignupForm] No result from sendVerificationCode");
        setError("发送验证码失败，请稍后重试");
      }
    } catch (err) {
      console.error("[SignupForm] Exception in handleSendCode:", err);
      setError("发送验证码失败，请稍后重试");
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    // 手动创建 FormData
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("code", code);
    if (inviteCode) {
      formData.append("invite_code", inviteCode);
    }

    startTransition(async () => {
      const result = await signup(formData);

      console.log("[SignupForm] Signup result:", result);

      if (result?.error) {
        console.error("[SignupForm] Signup error:", result.error);
        setError(result.error);
        if ("fieldErrors" in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      } else if (result?.success) {
        console.log("[SignupForm] Signup success:", result.message);
        setSuccess(result.message);
        // 注册成功后刷新页面
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        // 处理没有返回任何结果的情况
        console.error("[SignupForm] No result returned from signup");
        setError("注册失败，请稍后重试");
      }
    });
  }

  function handleBlur(field: string, value: string) {
    // 失焦时进行简单验证
    const errors: string[] = [];

    if (field === "username") {
      if (value.length < 3) errors.push("用户名至少需要 3 个字符");
      if (value.length > 20) errors.push("用户名最多 20 个字符");
      if (!/^[a-zA-Z0-9_]+$/.test(value)) errors.push("用户名只能包含字母、数字和下划线");
    } else if (field === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push("请输入有效的邮箱地址");
    } else if (field === "password") {
      if (value.length < 8) errors.push("密码至少需要 8 个字符");
      if (!/[A-Z]/.test(value)) errors.push("密码必须包含至少一个大写字母");
      if (!/[a-z]/.test(value)) errors.push("密码必须包含至少一个小写字母");
      if (!/[0-9]/.test(value)) errors.push("密码必须包含至少一个数字");
    }

    if (errors.length > 0) {
      setFieldErrors((prev) => ({ ...prev, [field]: errors }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* 用户名 */}
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium text-white/80">
          用户名
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          disabled={isPending}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={(e) => handleBlur("username", e.target.value)}
          className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="3-20 个字符，仅字母数字和下划线"
        />
        {fieldErrors.username && (
          <p className="mt-1 text-xs text-red-400">{fieldErrors.username[0]}</p>
        )}
      </div>

      {/* 邮箱 */}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">
          邮箱
        </label>
        <div className="flex gap-2">
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending || codeSent}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => handleBlur("email", e.target.value)}
            className="flex-1 rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="your@email.com"
          />
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSendingCode || countdown > 0 || !email || isPending}
            className="rounded border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingCode
              ? "发送中..."
              : countdown > 0
                ? `${countdown}秒`
                : codeSent
                  ? "重新发送"
                  : "发送验证码"}
          </button>
        </div>
        {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email[0]}</p>}
      </div>

      {/* 验证码 */}
      {codeSent && (
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-white/80">
            验证码
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            maxLength={6}
            disabled={isPending}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="请输入 6 位验证码"
          />
          <p className="mt-1 text-xs text-white/60">验证码已发送到您的邮箱，请查收</p>
        </div>
      )}

      {/* 邀请码（可选） */}
      <div>
        <label htmlFor="invite_code" className="mb-1 block text-sm font-medium text-white/80">
          邀请码 <span className="text-white/40">(可选)</span>
        </label>
        <input
          id="invite_code"
          name="invite_code"
          type="text"
          disabled={isPending}
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="输入邀请码可获得额外奖励"
        />
        <p className="mt-1 text-xs text-white/60">使用邀请码注册，您和邀请人各获得 50 永久积分</p>
      </div>

      {/* 密码 */}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-white/80">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isPending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={(e) => handleBlur("password", e.target.value)}
          className="w-full rounded border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="至少 8 个字符，包含大小写字母和数字"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-400">{fieldErrors.password[0]}</p>
        )}

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

      {/* 注册按钮 */}
      <button
        type="submit"
        disabled={
          isPending ||
          !codeSent ||
          !code ||
          code.length !== 6 ||
          Object.keys(fieldErrors).length > 0
        }
        className="w-full rounded bg-white px-4 py-2.5 font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "注册中..." : "注册"}
      </button>

      {/* 登录链接 */}
      <p className="text-center text-sm text-white/60">
        已有账户？{" "}
        <button
          type="button"
          onClick={onLogin}
          disabled={isPending}
          className="text-white transition-all hover:underline disabled:opacity-50"
        >
          立即登录
        </button>
      </p>
    </form>
  );
}
