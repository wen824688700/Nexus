/**
 * 兑换码列表 API
 *
 * GET /api/admin/redemption/list
 *
 * 管理员专用接口，用于查询兑换码列表
 * 验证需求：9.3, 9.7
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 验证管理员权限
 */
async function verifyAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single();

  if (error || !data) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any).role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 验证用户认证
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 验证管理员权限
    const isAdmin = await verifyAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status"); // 'unused' | 'used' | 'expired' | null

    // 构建查询
    let query = supabase
      .from("redemption_codes")
      .select("*, used_by:profiles!redemption_codes_used_by_fkey(username)", { count: "exact" });

    // 状态筛选
    if (status === "unused") {
      query = query.is("used_by", null).gt("expires_at", new Date().toISOString());
    } else if (status === "used") {
      query = query.not("used_by", "is", null);
    } else if (status === "expired") {
      query = query.is("used_by", null).lt("expires_at", new Date().toISOString());
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data: codes, error: queryError, count } = await query;

    if (queryError) {
      console.error("[List Redemption] Query error:", queryError);
      return NextResponse.json({ error: "查询兑换码失败" }, { status: 500 });
    }

    // 计算状态
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const codesWithStatus = codes?.map((code: any) => {
      let codeStatus = "unused";
      if (code.used_by) {
        codeStatus = "used";
      } else if (new Date(code.expires_at) < new Date()) {
        codeStatus = "expired";
      }

      return {
        ...code,
        status: codeStatus,
      };
    });

    return NextResponse.json({
      success: true,
      codes: codesWithStatus,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("[List Redemption] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
