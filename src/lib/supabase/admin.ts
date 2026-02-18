/**
 * Supabase Admin 客户端
 *
 * 使用 service_role key，拥有完整的数据库访问权限
 *
 * ⚠️ 警告：只能在服务器端使用，不要暴露给客户端！
 */

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

/**
 * 创建 Supabase Admin 客户端
 *
 * 使用 service_role key，可以绕过 RLS 策略
 *
 * @returns Supabase Admin 客户端实例
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase URL or Service Role Key");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
