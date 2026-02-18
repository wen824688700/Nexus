import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * POST /api/invitations/generate-code
 *
 * 为当前用户生成邀请码（如果还没有）
 *
 * 返回：
 * - inviteCode: 生成的邀请码
 */
export async function POST() {
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

    // 检查用户是否已有邀请码
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("invite_code")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
    }

    // 如果已有邀请码，直接返回
    const existingCode = (profile as { invite_code: string | null })?.invite_code;
    if (existingCode) {
      return NextResponse.json({
        inviteCode: existingCode,
      });
    }

    // 生成新的邀请码
    const inviteCode = await generateUniqueInviteCode(supabase);

    // 更新用户的邀请码
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from("profiles") as any)
      .update({ invite_code: inviteCode })
      .eq("id", user.id);

    if (updateError) {
      console.error("更新邀请码失败:", updateError);
      return NextResponse.json({ error: "生成邀请码失败" }, { status: 500 });
    }

    return NextResponse.json({
      inviteCode,
    });
  } catch (error) {
    console.error("生成邀请码失败:", error);
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
