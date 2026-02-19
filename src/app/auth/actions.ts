"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/auth/validation";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

/**
 * 登录 Server Action
 *
 * 支持使用用户名或邮箱登录
 * 验证需求：2.1, 2.2, 2.3
 *
 * @param formData - 表单数据（identifier: 用户名或邮箱, password: 密码）
 * @returns 错误对象或 undefined（成功时重定向）
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  // 验证输入
  const validatedFields = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      error: "请提供有效的登录凭据",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { identifier, password } = validatedFields.data;

  // 尝试使用邮箱登录
  const { error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });

  if (error) {
    // 如果邮箱登录失败，尝试通过用户名查找邮箱
    if (error.message.includes("Invalid login credentials")) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .maybeSingle<Pick<ProfileRow, "email">>();

      if (!profileError && profile?.email) {
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password,
        });

        if (!retryError) {
          revalidatePath("/", "layout");
          redirect("/");
        }
      }
    }

    return { error: "用户名或密码错误" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * 发送邮箱验证码 Server Action
 *
 * 生成并发送 6 位数字验证码到用户邮箱
 *
 * @param email - 邮箱地址
 * @returns 成功消息或错误对象
 */
export async function sendVerificationCode(email: string) {
  const supabase = await createClient();

  // 验证邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "请输入有效的邮箱地址" };
  }

  // 检查邮箱是否已在 profiles 表中注册
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    return { error: "该邮箱已被注册，请直接登录" };
  }

  // 生成 6 位验证码
  const { generateVerificationCode, sendVerificationEmail } = await import("@/lib/email/resend");
  const code = generateVerificationCode();

  // 计算过期时间（10 分钟后）
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // 删除该邮箱之前未使用的验证码
  await supabase
    .from("verification_codes")
    .delete()
    .eq("email", email)
    .eq("type", "signup")
    .eq("used", false);

  // 存储验证码到数据库
  const { error: insertError } = await supabase.from("verification_codes").insert({
    email,
    code,
    type: "signup",
    expires_at: expiresAt,
    used: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  if (insertError) {
    console.error("Insert verification code error:", insertError);
    return { error: "生成验证码失败，请稍后重试" };
  }

  // 发送验证码邮件
  const emailResult = await sendVerificationEmail(email, code, "signup");

  if (!emailResult.success) {
    console.error("Send email error:", emailResult.error);
    return { error: "发送验证码失败，请稍后重试" };
  }

  return {
    success: true,
    message: "验证码已发送到您的邮箱，请查收",
  };
}

/**
 * 生成唯一的邀请码
 *
 * 格式：8 位大写字母数字混合码
 * 验证需求：5.1, 5.8
 *
 * @returns 邀请码
 */
async function generateInviteCode(): Promise<string> {
  const supabase = await createClient();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // 最多尝试 10 次生成唯一码
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 检查唯一性
    const { data } = await supabase
      .from("profiles")
      .select("invite_code")
      .eq("invite_code", code)
      .maybeSingle();

    if (!data) {
      return code;
    }
  }

  throw new Error("生成邀请码失败");
}

/**
 * 处理邀请奖励
 *
 * 验证邀请码，创建邀请记录，发放双方奖励
 * 验证需求：5.3, 5.5, 5.6
 *
 * @param inviteeId - 被邀请人 ID
 * @param inviteCode - 邀请码
 * @returns 是否成功
 */
async function processInvitationReward(
  inviteeId: string,
  inviteCode: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { createCreditManager } = await import("@/lib/credits/manager");
  const creditManager = createCreditManager();

  // 查找邀请人
  const { data: inviter, error: inviterError } = await supabase
    .from("profiles")
    .select("id, invited_count")
    .eq("invite_code", inviteCode)
    .maybeSingle<Pick<ProfileRow, "id" | "invited_count">>();

  if (inviterError || !inviter) {
    return { success: false, error: "邀请码无效" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inviter_data = inviter as any;

  // 检查邀请上限（50 人）
  if (inviter_data.invited_count >= 50) {
    return { success: false, error: "该邀请码已达到使用上限" };
  }

  // 检查是否已经使用过该邀请人的邀请码
  const { data: existingInvitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("inviter_id", inviter_data.id)
    .eq("invitee_id", inviteeId)
    .maybeSingle();

  if (existingInvitation) {
    return { success: false, error: "您已经使用过该邀请码" };
  }

  // 创建邀请记录
  const { error: invitationError } = await supabase.from("invitations").insert({
    inviter_id: inviter_data.id,
    invitee_id: inviteeId,
    invite_code: inviteCode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  if (invitationError) {
    console.error("Failed to create invitation:", invitationError);
    return { success: false, error: "处理邀请失败" };
  }

  // 更新邀请人的邀请计数
  await // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase.from("profiles") as any)
    .update({ invited_count: inviter_data.invited_count + 1 })
    .eq("id", inviter_data.id);

  // 发放邀请人奖励（30 永久积分）
  await creditManager.addPermanentCredits(
    inviter.id,
    30,
    "invitation",
    "邀请新用户奖励",
    inviteCode,
  );

  // 发放被邀请人奖励（30 永久积分）
  await creditManager.addPermanentCredits(
    inviteeId,
    30,
    "invitation",
    "使用邀请码注册奖励",
    inviteCode,
  );

  return { success: true };
}

/**
 * 获取客户端 IP 地址
 *
 * @returns IP 地址
 */
async function getClientIP(): Promise<string> {
  const { headers } = await import("next/headers");
  const headersList = await headers();

  // 尝试从多个可能的 header 中获取 IP
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = headersList.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // 开发环境返回本地 IP
  return "127.0.0.1";
}

/**
 * 检查 IP 注册限制
 *
 * 每个 IP 地址最多注册 3 个账号
 * 验证需求：6.2
 *
 * @param ipAddress - IP 地址
 * @returns 是否允许注册
 */
async function checkIPRegistrationLimit(ipAddress: string): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("ip_registrations")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ipAddress);

  if (error) {
    console.error("Failed to check IP limit:", error);
    return true; // 出错时允许注册
  }

  return (count || 0) < 3;
}

/**
 * 注册 Server Action（使用验证码验证）
 *
 * 创建新用户账户，需要验证邮箱验证码
 * 支持邀请码、IP 限制、注册奖励
 * 验证需求：3.1, 3.2, 3.3, 3.6, 3.7, 5.1, 5.3, 6.1, 6.2
 *
 * @param formData - 表单数据（username: 用户名, email: 邮箱, password: 密码, code: 验证码, inviteCode: 邀请码）
 * @returns 成功消息或错误对象
 */
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const validatedFields = signupSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      error: "请提供有效的注册信息",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, email, password } = validatedFields.data;
  const code = formData.get("code") as string;
  const inviteCode = formData.get("inviteCode") as string | null;

  // 验证验证码
  if (!code || code.length !== 6) {
    return { error: "请输入 6 位验证码" };
  }

  // 获取客户端 IP 地址
  const ipAddress = await getClientIP();

  // 检查 IP 注册限制
  const canRegister = await checkIPRegistrationLimit(ipAddress);
  if (!canRegister) {
    return { error: "该 IP 地址注册次数已达上限" };
  }

  // 检查用户名是否已存在
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle<Pick<ProfileRow, "username">>();

  if (!profileCheckError && existingProfile) {
    return { error: "用户名已被使用" };
  }

  // 验证验证码
  const { data: verificationData, error: verifyError } = await supabase
    .from("verification_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .eq("type", "signup")
    .eq("used", false)
    .maybeSingle<Database["public"]["Tables"]["verification_codes"]["Row"]>();

  if (verifyError || !verificationData) {
    console.error("Verify code error:", verifyError);
    return { error: "验证码错误或已过期" };
  }

  // 检查验证码是否过期
  if (new Date(verificationData.expires_at) < new Date()) {
    return { error: "验证码已过期，请重新获取" };
  }

  // 使用 Admin API 检查邮箱是否已在 Auth 中存在
  const adminClient = createAdminClient();

  // 标记验证码为已使用
  await // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase.from("verification_codes") as any)
    .update({ used: true })
    .eq("id", verificationData.id);

  // 创建用户
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 直接标记邮箱为已确认
    user_metadata: {
      username,
    },
  });

  if (error) {
    console.error("Signup error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: (error as any).status,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      __isAuthError: (error as any).__isAuthError,
    });

    // 处理各种错误情况
    if (
      error.message.includes("already registered") ||
      error.message.includes("email_exists") ||
      error.message.includes("User already registered") ||
      error.code === "email_exists" ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).status === 422
    ) {
      return {
        error: "该邮箱已被注册，请直接登录或使用其他邮箱",
      };
    }
    if (error.message.includes("email")) {
      return { error: "邮箱格式无效" };
    }
    return { error: `注册失败：${error.message}` };
  }

  // 创建用户资料（使用 Admin client 绕过 RLS）
  if (data.user) {
    // 生成用户的邀请码
    const userInviteCode = await generateInviteCode();

    const profileData: ProfileInsert = {
      id: data.user.id,
      username,
      email,
      invite_code: userInviteCode,
      permanent_credits: 0, // 初始积分为 0，后续通过奖励添加
      daily_credits: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // 使用 Admin client 插入 profile（绕过 RLS）
    const { error: insertError } = await adminClient
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(profileData as any);

    if (insertError) {
      console.error("Failed to create profile:", insertError);
      // 如果 profile 创建失败，删除已创建的用户
      await adminClient.auth.admin.deleteUser(data.user.id);
      return { error: "创建用户资料失败" };
    }

    // 记录 IP 注册（使用 Admin client）
    await adminClient.from("ip_registrations").insert({
      ip_address: ipAddress,
      user_id: data.user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // 发放注册奖励（30 永久积分）
    const { createCreditManager } = await import("@/lib/credits/manager");
    const creditManager = createCreditManager();
    
    console.log("[Signup] Granting registration reward to user:", data.user.id);
    const creditResult = await creditManager.addPermanentCredits(
      data.user.id,
      30,
      "registration",
      "注册奖励",
    );
    
    if (!creditResult) {
      console.error("[Signup] Failed to grant registration credits");
      // 不阻止注册，但记录错误
    } else {
      console.log("[Signup] Registration credits granted successfully");
    }

    // 发放首次每日积分（20 每日积分）
    console.log("[Signup] Granting initial daily credits to user:", data.user.id);
    const dailyResult = await creditManager.grantDailyCredits(data.user.id);
    
    if (!dailyResult) {
      console.error("[Signup] Failed to grant initial daily credits");
      // 不阻止注册，但记录错误
    } else {
      console.log("[Signup] Initial daily credits granted successfully");
    }

    // 处理邀请奖励
    if (inviteCode && inviteCode.trim()) {
      const invitationResult = await processInvitationReward(
        data.user.id,
        inviteCode.trim().toUpperCase(),
      );

      if (!invitationResult.success) {
        console.warn("Invitation reward failed:", invitationResult.error);
        // 不阻止注册，只是记录警告
      }
    }
  }

  // 自动登录
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    success: true,
    message: "注册成功！",
  };
}

/**
 * Google OAuth 登录 Server Action
 *
 * 重定向到 Google 授权页面
 * 验证需求：4.1
 *
 * @returns 错误对象或 undefined（成功时重定向）
 */
export async function signInWithGoogle() {
  const supabase = await createClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * 登出 Server Action
 *
 * 清除会话并重定向到首页
 * 验证需求：9.5, 10.6
 *
 * @returns undefined（总是重定向）
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * 忘记密码 Server Action
 *
 * 发送密码重置邮件
 * 验证需求：13.1, 13.2
 *
 * @param formData - 表单数据（email: 邮箱）
 * @returns 成功消息或错误对象
 */
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { error: "请提供有效的邮箱地址" };
  }

  const { email } = validatedFields.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "密码重置链接已发送到您的邮箱",
  };
}

/**
 * 重置密码 Server Action
 *
 * 更新用户密码
 * 验证需求：13.3, 13.4
 *
 * @param formData - 表单数据（password: 新密码）
 * @returns 错误对象或 undefined（成功时重定向）
 */
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      error: "请提供有效的密码",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { password } = validatedFields.data;

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
