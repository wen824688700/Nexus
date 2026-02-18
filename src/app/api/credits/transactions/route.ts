/**
 * 交易历史查询 API
 *
 * GET /api/credits/transactions
 *
 * 查询当前用户的积分交易历史
 * 验证需求：12.1, 12.2, 12.4, 12.5
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // 分页查询
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: transactions,
      error: queryError,
      count,
    } = await supabase
      .from("credit_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (queryError) {
      console.error("[Transactions] Query error:", queryError);
      return NextResponse.json({ error: "查询交易历史失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("[Transactions] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
