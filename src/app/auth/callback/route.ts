import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OAuth 回调处理路由
 * 
 * 处理 OAuth 提供商（如 Google）的回调请求
 * 
 * 流程：
 * 1. 从 URL 参数中提取授权码（code）
 * 2. 使用 exchangeCodeForSession 将授权码交换为会话
 * 3. 成功：重定向到原始页面或首页
 * 4. 失败：重定向到登录页面并显示错误
 * 
 * @param request - Next.js 请求对象
 * @returns 重定向响应
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect') || '/'

  if (code) {
    const supabase = await createClient()
    
    // 使用授权码交换会话
    // 这会创建一个新的用户会话并设置 HTTP-only cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 成功：重定向到原始页面或首页
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }

    // 记录错误以便调试
    console.error('[OAuth Callback] Error exchanging code for session:', error)
  }

  // 失败：重定向到登录页面并显示错误
  // 错误可能是：
  // - 缺少授权码
  // - 授权码无效或已过期
  // - Supabase 服务错误
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
}
