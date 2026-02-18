import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * GET /api/invitations/info
 *
 * 获取当前用户的邀请信息
 *
 * 返回：
 * - inviteCode: 用户的邀请码
 * - inviteLink: 完整的邀请链接
 * - invitedCount: 已邀请的用户数量
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取用户的邀请码
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("invite_code")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
    }

    let inviteCode = (profile as { invite_code: string | null }).invite_code;

    // 如果用户没有邀请码,自动生成一个
    if (!inviteCode) {
      inviteCode = await generateUniqueInviteCode(supabase);

      // 更新用户的邀请码
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from("profiles") as any)
        .update({ invite_code: inviteCode })
        .eq("id", user.id);

      if (updateError) {
        console.error("更新邀请码失败:", updateError);
        return NextResponse.json({ error: "生成邀请码失败" }, { status: 500 });
      }
    }

    // 获取已邀请的用户数量
    const { count, error: countError } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("inviter_id", user.id);

    if (countError) {
      console.error("获取邀请数量失败:", countError);
    }

    // 构建邀请链接
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/signup?invite=${inviteCode}`;

    return NextResponse.json({
      inviteCode,
      inviteLink,
      invitedCount: count || 0,
    });
  } catch (error) {
    console.error("获取邀请信息失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

/**
 * 生成唯一的 8 位邀请码
 */
async function generateUniqueInviteCode(supabase: SupabaseClient<Database>): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // 最多尝试 10 次
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

  throw new Error("生成唯一邀请码失败");
}
