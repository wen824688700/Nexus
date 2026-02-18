/**
 * 兑换码导出 API
 *
 * GET /api/admin/redemption/export
 *
 * 管理员专用接口，用于导出兑换码为 CSV 文件
 * 验证需求：9.4
 */

import { NextResponse } from "next/server";
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

/**
 * 转换为 CSV 格式
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToCSV(codes: any[]): string {
  const headers = ["兑换码", "积分", "状态", "创建时间", "过期时间", "使用者", "使用时间"];
  const rows = codes.map((code) => {
    let status = "未使用";
    if (code.used_by) {
      status = "已使用";
    } else if (new Date(code.expires_at) < new Date()) {
      status = "已过期";
    }

    return [
      code.code,
      code.credits,
      status,
      new Date(code.created_at).toLocaleString("zh-CN"),
      new Date(code.expires_at).toLocaleString("zh-CN"),
      code.used_by_username || "-",
      code.used_at ? new Date(code.used_at).toLocaleString("zh-CN") : "-",
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  // 添加 BOM 以支持 Excel 正确显示中文
  return "\uFEFF" + csvContent;
}

export async function GET() {
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

    // 查询所有兑换码
    const { data: codes, error: queryError } = await supabase
      .from("redemption_codes")
      .select(
        `
        *,
        used_by_username:profiles!redemption_codes_used_by_fkey(username)
      `,
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("[Export Redemption] Query error:", queryError);
      return NextResponse.json({ error: "查询兑换码失败" }, { status: 500 });
    }

    // 转换为 CSV
    const csv = convertToCSV(codes || []);

    // 返回 CSV 文件
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="redemption_codes_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("[Export Redemption] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
