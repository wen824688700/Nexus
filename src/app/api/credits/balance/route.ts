/**
 * 积分余额查询 API
 *
 * GET /api/credits/balance
 *
 * 查询当前用户的积分余额
 * 验证需求：10.3, 11.1
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCreditManager } from "@/lib/credits/manager";

export async function GET() {
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

    // 获取积分余额
    const creditManager = createCreditManager();
    const balance = await creditManager.getBalance(user.id);

    return NextResponse.json({
      success: true,
      total: balance.total,
      permanent: balance.permanent,
      daily: balance.daily,
    });
  } catch (error) {
    console.error("[Balance] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
