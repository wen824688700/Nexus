import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createCreditManager } from "@/lib/credits/manager";

/**
 * Next.js 中间件 - 路由保护、会话管理和每日积分发放
 *
 * 功能：
 * 1. 自动刷新接近过期的会话
 * 2. 保护需要认证的路由
 * 3. 未认证用户重定向到首页（登录通过模态框）
 * 4. 保留原始 URL 用于登录后重定向
 * 5. 每日首次访问自动发放每日积分
 *
 * 验证需求：4.1, 4.6, 18.7, 18.8, 18.9
 */

// 定义受保护的路由列表
// 这些路由需要用户登录才能访问
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin", // 管理后台
  "/agents", // 智能体中心
  "/knowledge", // 知识库（Retro OS）
  "/vault", // 量子密匣
];

export async function middleware(request: NextRequest) {
  // 调用 updateSession 刷新会话并获取用户信息
  const { supabaseResponse, user } = await updateSession(request);

  // 获取当前请求的路径
  const { pathname } = request.nextUrl;

  // 如果用户已登录，尝试发放每日积分（静默失败）
  if (user) {
    try {
      const creditManager = createCreditManager();
      await creditManager.grantDailyCredits(user.id);
    } catch (error) {
      // 静默失败，不影响用户访问
      console.error("[Middleware] Failed to grant daily credits:", error);
    }
  }

  // 检查当前路径是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 如果是受保护路由且用户未认证
  if (isProtectedRoute && !user) {
    // 构建重定向 URL，保留原始路径用于登录后返回
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("redirect", pathname);

    // 重定向到首页（登录通过模态框进行）
    return NextResponse.redirect(redirectUrl);
  }

  // 用户已认证或访问公共路由，返回响应
  return supabaseResponse;
}

/**
 * 配置中间件匹配规则
 *
 * 排除以下路径：
 * - _next/static: Next.js 静态资源
 * - _next/image: Next.js 图片优化
 * - favicon.ico: 网站图标
 * - 其他静态文件（.svg, .png, .jpg, .jpeg, .gif, .webp）
 */
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 静态文件扩展名 (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
