import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 邮箱验证回调处理路由
 *
 * 处理用户点击邮箱验证链接的请求
 *
 * 流程：
 * 1. 从 URL 参数中提取验证令牌（token_hash）和类型（type）
 * 2. 使用 verifyOtp 验证邮箱令牌
 * 3. 成功：重定向到首页并显示成功消息
 * 4. 失败：重定向到登录页面并显示错误
 *
 * @param request - Next.js 请求对象
 * @returns 重定向响应
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const origin = requestUrl.origin;

  if (token_hash && type) {
    const supabase = await createClient();

    // 验证邮箱令牌
    // type 可能是 'email' (邮箱验证) 或 'recovery' (密码重置)
    const { error } = await supabase.auth.verifyOtp({
      type: type as "email" | "recovery",
      token_hash,
    });

    if (!error) {
      // 成功：重定向到首页并显示成功消息
      // 前端可以检测 verified=true 参数并显示成功提示
      return NextResponse.redirect(`${origin}/?verified=true`);
    }

    // 记录错误以便调试
    console.error("[Email Verification] Error verifying OTP:", error);
  }

  // 失败：重定向到登录页面并显示错误
  // 错误可能是：
  // - 缺少令牌或类型参数
  // - 令牌无效或已过期
  // - 令牌已被使用
  // - Supabase 服务错误
  return NextResponse.redirect(`${origin}/?error=verification_failed`);
}
