"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateUniqueCodes } from "@/lib/invite-codes/generator";

/**
 * 验证管理员权限
 */
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as any)?.role !== "admin") {
    redirect("/");
  }

  return { supabase, userId: user.id };
}

/**
 * 生成邀请码
 */
export async function generateInviteCodes(count: number = 1) {
  const { supabase, userId } = await verifyAdmin();

  if (count < 1 || count > 50) {
    return { error: "生成数量必须在 1-50 之间" };
  }

  try {
    // 获取现有邀请码
    const { data: existing } = await supabase.from("invite_codes").select("code");

    const existingCodes = new Set<string>((existing as any)?.map((c: any) => c.code as string) || []);

    // 生成唯一邀请码
    const codes = generateUniqueCodes(count, existingCodes);

    // 计算过期时间（7天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 批量插入
    const { data, error } = await (supabase.from("invite_codes") as any)
      .insert(
        codes.map((code) => ({
          code,
          created_by: userId,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        }))
      )
      .select();

    if (error) {
      console.error("生成邀请码失败:", error);
      return { error: "生成邀请码失败，请重试" };
    }

    return { success: true, codes: data };
  } catch (error) {
    console.error("生成邀请码异常:", error);
    return { error: "生成邀请码失败，请重试" };
  }
}

/**
 * 获取邀请码列表
 */
export async function getInviteCodes(page: number = 1, pageSize: number = 20) {
  const { supabase } = await verifyAdmin();

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from("invite_codes")
    .select("*, invite_code_uses(count)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("获取邀请码列表失败:", error);
    return { error: "获取邀请码列表失败" };
  }

  return {
    success: true,
    codes: data,
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * 获取邀请码使用记录
 */
export async function getInviteCodeUsage(inviteCodeId: string) {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("invite_code_uses")
    .select(
      `
      *,
      profiles:used_by (
        username,
        email
      )
    `
    )
    .eq("invite_code_id", inviteCodeId)
    .order("used_at", { ascending: false });

  if (error) {
    console.error("获取使用记录失败:", error);
    return { error: "获取使用记录失败" };
  }

  return { success: true, usage: data };
}

/**
 * 导出邀请码列表
 */
export async function exportInviteCodes() {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("invite_codes")
    .select("code, created_at, expires_at, is_active")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: "导出失败" };
  }

  // 生成 CSV 内容
  const lines = [
    "邀请码,创建时间,过期时间,状态",
    ...(data as any).map(
      (code: any) =>
        `${code.code},${code.created_at},${code.expires_at},${code.is_active ? "有效" : "失效"}`
    ),
  ];

  return { success: true, content: lines.join("\n") };
}
