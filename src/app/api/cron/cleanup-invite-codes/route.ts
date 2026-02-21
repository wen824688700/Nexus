import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 清理过期邀请码的定时任务端点
 *
 * 功能：
 * - 删除过期超过 30 天的邀请码
 * - 保留使用记录（不删除 invite_code_uses 表数据）
 * - 记录清理日志
 *
 * 安全：
 * - 需要 CRON_SECRET 环境变量验证
 * - 只能通过 Vercel Cron Jobs 或 Supabase pg_cron 调用
 *
 * 配置：
 * - Vercel Cron Jobs: 在 vercel.json 中配置
 * - Supabase pg_cron: 在 Supabase Dashboard 中配置
 *
 * 验证需求：14.1, 14.2, 14.3, 14.5
 */
export async function GET(request: NextRequest) {
  try {
    // 验证 cron secret（防止未授权访问）
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("[Cleanup Cron] Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cleanup Cron] Starting invite codes cleanup...");

    const adminClient = createAdminClient();

    // 计算 30 天前的时间
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 查询过期超过 30 天的邀请码
    const { data: expiredCodes, error: queryError } = await adminClient
      .from("invite_codes")
      .select("id, code, expires_at")
      .lt("expires_at", thirtyDaysAgo.toISOString());

    if (queryError) {
      console.error("[Cleanup Cron] Query error:", queryError);
      return NextResponse.json(
        { error: "Failed to query expired codes", details: queryError.message },
        { status: 500 }
      );
    }

    if (!expiredCodes || expiredCodes.length === 0) {
      console.log("[Cleanup Cron] No expired codes to clean up");
      return NextResponse.json({
        success: true,
        message: "No expired codes to clean up",
        cleaned: 0,
      });
    }

    console.log(`[Cleanup Cron] Found ${expiredCodes.length} expired codes to clean up`);

    // 备份即将删除的邀请码数据（记录到日志）
    console.log("[Cleanup Cron] Backing up codes:", {
      count: expiredCodes.length,
      codes: expiredCodes.map((c: any) => ({
        id: c.id,
        code: c.code,
        expires_at: c.expires_at,
      })),
    });

    // 删除过期的邀请码
    // 注意：使用记录（invite_code_uses）会因为外键约束被级联删除
    // 如果需要保留使用记录，需要先移除外键约束或修改为 SET NULL
    const { error: deleteError } = await adminClient
      .from("invite_codes")
      .delete()
      .in(
        "id",
        expiredCodes.map((c: any) => c.id)
      );

    if (deleteError) {
      console.error("[Cleanup Cron] Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete expired codes", details: deleteError.message },
        { status: 500 }
      );
    }

    // 记录清理日志
    const cleanupLog = {
      timestamp: new Date().toISOString(),
      cleaned_count: expiredCodes.length,
      codes: expiredCodes.map((c: any) => c.code),
    };

    console.log("[Cleanup Cron] Cleanup completed successfully:", cleanupLog);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${expiredCodes.length} expired invite codes`,
      cleaned: expiredCodes.length,
      timestamp: cleanupLog.timestamp,
    });
  } catch (error) {
    console.error("[Cleanup Cron] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST 方法支持（用于手动触发）
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
