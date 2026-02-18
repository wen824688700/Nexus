/**
 * Supabase 辅助类型声明
 *
 * 用于解决 Supabase 客户端类型推断问题
 */

declare module "@/lib/supabase/server" {
  import { SupabaseClient } from "@supabase/supabase-js";
  import { Database } from "@/types/supabase";

  export function createClient(): Promise<SupabaseClient<Database>>;
}

declare module "@/lib/supabase/admin" {
  import { SupabaseClient } from "@supabase/supabase-js";
  import { Database } from "@/types/supabase";

  export function createAdminClient(): SupabaseClient<Database>;
}
