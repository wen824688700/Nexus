import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * OAuth 回调处理路由
 *
 * 处理 OAuth 提供商（如 Google）的回调请求
 *
 * 流程：
 * 1. 从 URL 参数中提取授权码（code）
 * 2. 使用 exchangeCodeForSession 将授权码交换为会话
 * 3. 成功：重定向到原始页面或首页
 * 4. 失败：重定向到登录页面并显示错误
 *
 * @param request - Next.js 请求对象
 * @returns 重定向响应
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect") || "/";

  if (code) {
    const supabase = await createClient();

    // 使用授权码交换会话
    // 这会创建一个新的用户会话并设置 HTTP-only cookies
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // 检查用户是否已有 profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      // 如果是新用户（OAuth 首次登录），创建 profile
      if (!existingProfile) {
        console.log("[OAuth Callback] Creating profile for new OAuth user:", data.user.id);

        // 生成唯一的邀请码
        const { generateInviteCode } = await import("@/lib/invite-codes/generator");
        let userInviteCode = "";
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          userInviteCode = generateInviteCode();
          const { data: existing } = await supabase
            .from("profiles")
            .select("invite_code")
            .eq("invite_code", userInviteCode)
            .maybeSingle();

          if (!existing) break;
          attempts++;
        }

        if (!userInviteCode) {
          console.error("[OAuth Callback] Failed to generate unique invite code");
          return NextResponse.redirect(`${origin}/?error=profile_creation_failed`);
        }

        // 从 OAuth 元数据中提取用户名
        const username =
          data.user.user_metadata?.preferred_username ||
          data.user.user_metadata?.name?.replace(/\s+/g, "_").toLowerCase() ||
          data.user.email?.split("@")[0] ||
          `user_${data.user.id.substring(0, 8)}`;

        // 确保用户名唯一
        let finalUsername = username;
        let usernameAttempts = 0;
        while (usernameAttempts < 10) {
          const { data: existingUsername } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", finalUsername)
            .maybeSingle();

          if (!existingUsername) break;

          finalUsername = `${username}_${Math.floor(Math.random() * 10000)}`;
          usernameAttempts++;
        }

        // 创建 profile（OAuth 用户不需要邀请码）
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminClient = createAdminClient();

        const { error: insertError } = await adminClient.from("profiles").insert({
          id: data.user.id,
          username: finalUsername,
          email: data.user.email!,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          invite_code: userInviteCode,
          invited_by_code: null, // OAuth 用户不需要邀请码
          permanent_credits: 0,
          daily_credits: 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (insertError) {
          console.error("[OAuth Callback] Failed to create profile:", insertError);
          return NextResponse.redirect(`${origin}/?error=profile_creation_failed`);
        }

        // 发放注册奖励（30 永久积分）
        const { createCreditManager } = await import("@/lib/credits/manager");
        const creditManager = createCreditManager();

        console.log("[OAuth Callback] Granting registration reward to user:", data.user.id);
        await creditManager.addPermanentCredits(data.user.id, 30, "registration", "注册奖励");

        // 发放首次每日积分（20 每日积分）
        console.log("[OAuth Callback] Granting initial daily credits to user:", data.user.id);
        await creditManager.grantDailyCredits(data.user.id);

        console.log("[OAuth Callback] Profile created successfully for OAuth user");
      }

      // 成功：重定向到原始页面或首页
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    // 记录错误以便调试
    console.error("[OAuth Callback] Error exchanging code for session:", error);
  }

  // 失败：重定向到登录页面并显示错误
  // 错误可能是：
  // - 缺少授权码
  // - 授权码无效或已过期
  // - Supabase 服务错误
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
}
