import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

/**
 * 更新会话并验证用户认证状态
 * 
 * 这个函数在中间件中使用，用于：
 * 1. 验证用户的 JWT 令牌是否有效
 * 2. 自动刷新接近过期的会话
 * 3. 正确处理请求和响应中的 cookies
 * 
 * @param request - Next.js 请求对象
 * @returns 包含响应对象和用户信息的对象
 */
export async function updateSession(request: NextRequest) {
  // 创建一个初始响应对象
  const supabaseResponse = NextResponse.next({
    request,
  })

  // 创建 Supabase 客户端，配置 cookie 处理
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 从请求中获取所有 cookies
        getAll() {
          return request.cookies.getAll()
        },
        // 设置 cookies 到请求和响应对象
        // 这确保了 cookies 在整个请求生命周期中保持同步
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // 设置到请求对象（用于后续中间件和路由处理器）
            request.cookies.set(name, value)
            // 设置到响应对象（返回给客户端）
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 重要：使用 getUser() 而不是 getSession()
  // getUser() 会验证 JWT 的有效性，更安全
  // 这也会自动刷新接近过期的会话
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
