/**
 * 兑换码兑换 API
 *
 * POST /api/redemption/redeem
 *
 * 用户兑换兑换码，获取积分
 * 验证需求：8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCreditManager } from "@/lib/credits/manager";
import { z } from "zod";

// 请求体验证 schema
const redeemSchema = z.object({
  code: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 验证用户认证
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const validated = redeemSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "无效的兑换码" }, { status: 400 });
    }

    const { code } = validated.data;
    const normalizedCode = code.trim().toUpperCase();

    // 查询兑换码
    const { data: redemptionCode, error: queryError } = await supabase
      .from("redemption_codes")
      .select("*")
      .eq("code", normalizedCode)
      .single();

    if (queryError || !redemptionCode) {
      return NextResponse.json({ error: "兑换码不存在" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code_data = redemptionCode as any;

    // 检查是否已使用
    if (code_data.used_by) {
      return NextResponse.json({ error: "兑换码已被使用" }, { status: 400 });
    }

    // 检查是否过期
    if (new Date(code_data.expires_at) < new Date()) {
      return NextResponse.json({ error: "兑换码已过期" }, { status: 400 });
    }

    // 使用事务处理兑换
    // 1. 标记兑换码为已使用
    const { error: updateError } =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("redemption_codes") as any)
        .update({
          used_by: user.id,
          used_at: new Date().toISOString(),
        })
        .eq("id", code_data.id)
        .is("used_by", null); // 防止并发兑换

    if (updateError) {
      console.error("[Redeem] Update error:", updateError);
      return NextResponse.json({ error: "兑换失败，请重试" }, { status: 500 });
    }

    // 2. 添加永久积分
    const creditManager = createCreditManager();
    const success = await creditManager.addPermanentCredits(
      user.id,
      code_data.credits,
      "redemption",
      `兑换码充值: ${normalizedCode}`,
      normalizedCode,
    );

    if (!success) {
      // 如果添加积分失败，回滚兑换码状态
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("redemption_codes") as any)
        .update({
          used_by: null,
          used_at: null,
        })
        .eq("id", code_data.id);

      return NextResponse.json({ error: "添加积分失败，请重试" }, { status: 500 });
    }

    // 获取更新后的余额
    const balance = await creditManager.getBalance(user.id);

    return NextResponse.json({
      success: true,
      message: `成功兑换 ${code_data.credits} 积分`,
      credits: code_data.credits,
      balance,
    });
  } catch (error) {
    console.error("[Redeem] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
