import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 提交用户反馈
 * POST /api/feedback/submit
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 验证用户登录
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const screenshot = formData.get("screenshot") as File | null;

    // 验证内容
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "反馈内容不能为空" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "反馈内容不能超过 1000 字" }, { status: 400 });
    }

    let screenshotUrl: string | null = null;

    // 处理截图上传
    if (screenshot) {
      // 验证文件类型
      if (!screenshot.type.startsWith("image/")) {
        return NextResponse.json({ error: "只能上传图片文件" }, { status: 400 });
      }

      // 验证文件大小（5MB）
      if (screenshot.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "图片大小不能超过 5MB" }, { status: 400 });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const ext = screenshot.name.split(".").pop() || "png";
      const fileName = `feedback/${user.id}/${timestamp}.${ext}`;

      // 上传到 Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("feedbacks")
        .upload(fileName, screenshot, {
          contentType: screenshot.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("上传截图失败:", uploadError);
        return NextResponse.json({ error: "上传截图失败" }, { status: 500 });
      }

      // 获取公开 URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("feedbacks").getPublicUrl(uploadData.path);

      screenshotUrl = publicUrl;
    }

    // 插入反馈记录
    const { error: insertError } = await (supabase.from("feedbacks") as any).insert({
      user_id: user.id,
      content: content.trim(),
      screenshot_url: screenshotUrl,
    });

    if (insertError) {
      console.error("保存反馈失败:", insertError);
      return NextResponse.json({ error: "保存反馈失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("提交反馈异常:", error);
    return NextResponse.json({ error: "提交失败，请重试" }, { status: 500 });
  }
}
