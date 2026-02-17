import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

/**
 * 创建服务器端 Supabase 客户端
 * 
 * 用于 Server Components、Server Actions 和 Route Handlers
 * 
 * 重要说明：
 * - 在 Server Components 中，cookie 设置可能会失败（这是预期行为）
 * - 实际的 cookie 设置应该在 Server Actions 或 Route Handlers 中进行
 * - 使用 HTTP-only cookies 存储会话，确保安全性
 * 
 * @returns Supabase 服务器端客户端实例
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * 获取所有 cookies
         * 用于读取会话信息
         */
        getAll() {
          return cookieStore.getAll()
        },
        /**
         * 设置多个 cookies
         * 用于存储会话信息
         * 
         * 注意：在 Server Component 中调用时可能失败
         * 这是预期行为，因为 Server Components 是只读的
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在 Server Component 中调用时可能失败
            // 这是预期行为，因为 Server Components 是只读的
            // 实际的 cookie 设置会在 Server Actions 或 Route Handlers 中进行
          }
        },
      },
    }
  )
}
