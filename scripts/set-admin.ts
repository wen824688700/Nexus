/**
 * 设置管理员脚本
 * 
 * 使用方法：
 * npx tsx scripts/set-admin.ts your-email@example.com
 * 
 * 或者直接在 Supabase SQL Editor 中执行：
 * UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("错误：缺少环境变量");
  console.error("请确保设置了 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdmin(email: string) {
  console.log(`正在设置管理员：${email}`);

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("email", email)
    .select();

  if (error) {
    console.error("设置管理员失败:", error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.error("未找到该邮箱的用户");
    process.exit(1);
  }

  console.log("✓ 管理员设置成功:", data);
}

const email = process.argv[2];

if (!email) {
  console.error("错误：请提供邮箱地址");
  console.error("使用方法：npx tsx scripts/set-admin.ts your-email@example.com");
  process.exit(1);
}

setAdmin(email);
