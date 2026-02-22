import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 反馈列表 API
 * GET /api/admin/feedback/list
 * 
 * 管理员专用接口，用于查询用户反馈列表
 */
export async function GET(request: NextRequest) {
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

    // 查询反馈列表
    const { data: feedbacks, error: queryError } = await supabase
      .from("feedbacks")
      .select("id, user_id, content, screenshot_url, created_at")
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("[List Feedback] Query error:", queryError);
      return NextResponse.json({ error: "查询反馈失败" }, { status: 500 });
    }

    // 获取所有用户 ID
    const userIds = [...new Set((feedbacks || []).map((f: any) => f.user_id))];

    // 批量查询用户邮箱
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    // 创建用户邮箱映射
    const emailMap = new Map(
      (profiles || []).map((p: any) => [p.id, p.email])
    );

    // 格式化数据
    const formattedFeedbacks = (feedbacks || []).map((feedback: any) => ({
      id: feedback.id,
      user_id: feedback.user_id,
      content: feedback.content,
      screenshot_url: feedback.screenshot_url,
      created_at: feedback.created_at,
      user_email: emailMap.get(feedback.user_id) || null,
    }));

    return NextResponse.json({ feedbacks: formattedFeedbacks });
  } catch (error) {
    console.error("[List Feedback] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
