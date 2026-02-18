/**
 * 兑换码统计 API
 *
 * GET /api/admin/redemption/stats
 *
 * 管理员专用接口，用于获取系统统计数据
 * 验证需求：9.6
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 验证用户认证
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    // 统计总用户数
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // 统计总发放积分（所有正数交易）
    const { data: creditGrants } = await supabase
      .from("credit_transactions")
      .select("amount")
      .gt("amount", 0);

    const totalCreditsGranted =
      creditGrants?.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, tx: any) => sum + tx.amount,
        0,
      ) || 0;

    // 统计总消耗积分（所有负数交易）
    const { data: creditUsage } = await supabase
      .from("credit_transactions")
      .select("amount")
      .lt("amount", 0);

    const totalCreditsUsed = Math.abs(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      creditUsage?.reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0,
    );

    // 统计兑换码数据
    const { count: totalCodes } = await supabase
      .from("redemption_codes")
      .select("*", { count: "exact", head: true });

    const { count: usedCodes } = await supabase
      .from("redemption_codes")
      .select("*", { count: "exact", head: true })
      .not("used_by", "is", null);

    const { count: expiredCodes } = await supabase
      .from("redemption_codes")
      .select("*", { count: "exact", head: true })
      .is("used_by", null)
      .lt("expires_at", new Date().toISOString());

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalCreditsGranted,
        totalCreditsUsed,
        redemptionCodes: {
          total: totalCodes || 0,
          used: usedCodes || 0,
          expired: expiredCodes || 0,
          unused: (totalCodes || 0) - (usedCodes || 0) - (expiredCodes || 0),
        },
      },
    });
  } catch (error) {
    console.error("[Stats] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
