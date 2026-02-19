/**
 * 清理孤立用户脚本
 *
 * 删除在 Supabase Auth 中存在但在 profiles 表中不存在的用户
 * 这些用户通常是注册失败导致的
 *
 * 使用方法：
 * npx tsx scripts/cleanup-orphaned-users.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 缺少环境变量：NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function cleanupOrphanedUsers() {
  console.log("🔍 开始查找孤立用户...\n");

  // 获取所有 Auth 用户
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("❌ 获取 Auth 用户失败:", authError);
    return;
  }

  console.log(`📊 找到 ${authUsers.users.length} 个 Auth 用户\n`);

  // 获取所有 profiles
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, username");

  if (profileError) {
    console.error("❌ 获取 profiles 失败:", profileError);
    return;
  }

  console.log(`📊 找到 ${profiles.length} 个 profile 记录\n`);

  // 找出孤立用户（在 Auth 中存在但在 profiles 中不存在）
  const profileIds = new Set(profiles.map((p) => p.id));
  const orphanedUsers = authUsers.users.filter((user) => !profileIds.has(user.id));

  if (orphanedUsers.length === 0) {
    console.log("✅ 没有发现孤立用户");
    return;
  }

  console.log(`⚠️  发现 ${orphanedUsers.length} 个孤立用户：\n`);

  orphanedUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
    console.log(`   创建时间: ${user.created_at}`);
    console.log(`   邮箱确认: ${user.email_confirmed_at ? "是" : "否"}\n`);
  });

  // 询问是否删除
  console.log("⚠️  警告：即将删除这些孤立用户");
  console.log("如果要继续，请在 5 秒内按 Ctrl+C 取消\n");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("🗑️  开始删除孤立用户...\n");

  let successCount = 0;
  let failCount = 0;

  for (const user of orphanedUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      console.error(`❌ 删除失败: ${user.email} - ${error.message}`);
      failCount++;
    } else {
      console.log(`✅ 已删除: ${user.email}`);
      successCount++;
    }
  }

  console.log(`\n📊 清理完成：`);
  console.log(`   成功: ${successCount}`);
  console.log(`   失败: ${failCount}`);
}

cleanupOrphanedUsers().catch(console.error);
