import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 删除反馈 API
 * POST /api/admin/feedback/delete
 * 
 * 管理员专用接口，用于删除用户反馈
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 验证管理员权限
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 查询用户角色
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "无权限访问" }, { status: 403 });
    }

    // 获取请求参数
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "缺少反馈 ID" }, { status: 400 });
    }

    // 查询反馈信息（获取截图 URL）
    const { data: feedback } = await (supabase.from("feedbacks") as any)
      .select("screenshot_url")
      .eq("id", id)
      .single();

    // 删除反馈记录
    const { error: deleteError } = await (supabase.from("feedbacks") as any)
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[Delete Feedback] Delete error:", deleteError);
      return NextResponse.json({ error: "删除反馈失败" }, { status: 500 });
    }

    // 如果有截图，尝试删除（不影响主流程）
    if (feedback?.screenshot_url) {
      try {
        // 从完整 URL 中提取文件路径
        // 例如：https://xxx.supabase.co/storage/v1/object/public/feedbacks/feedback/user_id/timestamp.png
        // 提取：feedback/user_id/timestamp.png
        const urlParts = feedback.screenshot_url.split("/feedbacks/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("feedbacks").remove([filePath]);
        }
      } catch (err) {
        console.error("[Delete Feedback] Failed to delete screenshot:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete Feedback] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
