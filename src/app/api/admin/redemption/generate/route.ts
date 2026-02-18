/**
 * 兑换码生成 API
 *
 * POST /api/admin/redemption/generate
 *
 * 管理员专用接口，用于生成兑换码
 * 验证需求：7.1, 7.2, 7.4, 7.6, 15.2
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// 预定义面额（保留供将来使用）
// const PRESET_AMOUNTS = [10, 50, 100, 200, 500]

// 请求体验证 schema
const generateSchema = z.object({
  amount: z.number().int().positive(),
  count: z.number().int().min(1).max(100).default(1),
  expiresInDays: z.number().int().min(1).max(365).default(30),
});

/**
 * 生成兑换码
 *
 * 格式：Apex-XXXX-XXXX
 *
 * @returns 兑换码字符串
 */
function generateRedemptionCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let part1 = "";
  let part2 = "";

  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `Apex-${part1}-${part2}`;
}

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

export async function POST(request: NextRequest) {
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

    // 解析请求体
    const body = await request.json();
    const validated = generateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "无效的请求参数", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const { amount, count, expiresInDays } = validated.data;

    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 生成兑换码
    const codes: string[] = [];
    const codeRecords = [];

    for (let i = 0; i < count; i++) {
      let code = generateRedemptionCode();

      // 确保唯一性（最多尝试 10 次）
      let attempts = 0;
      while (codes.includes(code) && attempts < 10) {
        code = generateRedemptionCode();
        attempts++;
      }

      if (attempts >= 10) {
        return NextResponse.json({ error: "生成唯一兑换码失败，请重试" }, { status: 500 });
      }

      codes.push(code);
      codeRecords.push({
        code,
        credits: amount,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
      });
    }

    // 批量插入数据库
    const { data: insertedCodes, error: insertError } = await supabase
      .from("redemption_codes")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(codeRecords as any)
      .select();

    if (insertError) {
      console.error("[Generate Redemption] Insert error:", insertError);
      return NextResponse.json({ error: "生成兑换码失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      codes: insertedCodes,
      count: insertedCodes.length,
    });
  } catch (error) {
    console.error("[Generate Redemption] Error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
