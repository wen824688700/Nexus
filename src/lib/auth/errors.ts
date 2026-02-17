/**
 * 认证错误处理模块
 * 
 * 将 Supabase Auth 错误转换为用户友好的错误消息
 * 处理网络错误、速率限制错误和其他认证相关错误
 * 
 * 需求：14.1, 14.2, 14.3, 14.4
 */

import { AuthError as SupabaseAuthError } from '@supabase/supabase-js'

/**
 * 自定义认证错误类
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Supabase 错误代码到用户友好消息的映射
 */
const ERROR_MESSAGES: Record<string, string> = {
  // 认证错误
  'invalid_credentials': '用户名或密码错误',
  'invalid_grant': '用户名或密码错误',
  'user_not_found': '用户名或密码错误', // 不暴露用户是否存在
  'email_not_confirmed': '请先验证您的邮箱地址',
  'user_already_exists': '该邮箱已被注册',
  'email_exists': '该邮箱已被注册',
  'weak_password': '密码强度不足，请使用更复杂的密码',
  'invalid_password': '密码不符合要求',
  
  // OAuth 错误
  'oauth_provider_not_supported': '不支持的登录方式',
  'oauth_callback_error': 'Google 登录失败，请重试',
  'access_denied': '您拒绝了授权请求',
  
  // 会话错误
  'session_not_found': '会话已过期，请重新登录',
  'refresh_token_not_found': '会话已过期，请重新登录',
  'invalid_refresh_token': '会话已过期，请重新登录',
  
  // 邮箱验证错误
  'verification_failed': '邮箱验证失败，请重新发送验证邮件',
  'otp_expired': '验证链接已过期，请重新发送',
  'otp_disabled': '验证功能暂时不可用',
  
  // 密码重置错误
  'password_reset_failed': '密码重置失败，请重试',
  'same_password': '新密码不能与旧密码相同',
  
  // 速率限制错误
  'over_request_rate_limit': '操作过于频繁，请稍后再试',
  'over_email_send_rate_limit': '邮件发送过于频繁，请 5 分钟后再试',
  'too_many_requests': '请求过于频繁，请稍后再试',
  
  // 网络错误
  'network_error': '网络连接失败，请检查您的网络连接',
  'timeout': '请求超时，请重试',
  
  // 服务器错误
  'internal_server_error': '服务器错误，请稍后再试',
  'service_unavailable': '服务暂时不可用，请稍后再试',
  'database_error': '数据库错误，请稍后再试',
}

/**
 * 处理认证错误并返回用户友好的错误消息
 * 
 * @param error - 原始错误对象
 * @returns AuthError 实例，包含用户友好的错误消息
 * 
 * @example
 * ```typescript
 * try {
 *   await supabase.auth.signInWithPassword({ email, password })
 * } catch (error) {
 *   const authError = handleAuthError(error)
 *   console.error('[Auth Error]', authError.originalError)
 *   return { error: authError.message }
 * }
 * ```
 */
export function handleAuthError(error: unknown): AuthError {
  // 记录详细错误信息到控制台（需求 14.3）
  console.error('[Auth Error] Original error:', error)

  // 处理 Supabase Auth 错误
  if (error instanceof SupabaseAuthError) {
    const message = ERROR_MESSAGES[error.message] || 
                   ERROR_MESSAGES[error.status?.toString() || ''] ||
                   '认证失败，请重试'
    
    return new AuthError(
      message,
      error.message,
      error.status,
      error
    )
  }

  // 处理网络错误
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AuthError(
      ERROR_MESSAGES['network_error'],
      'network_error',
      undefined,
      error
    )
  }

  // 处理超时错误
  if (error instanceof Error && error.message.includes('timeout')) {
    return new AuthError(
      ERROR_MESSAGES['timeout'],
      'timeout',
      undefined,
      error
    )
  }

  // 处理速率限制错误（通过 HTTP 状态码）
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { status?: number; statusCode?: number; message?: string }
    
    if (errorObj.status === 429 || errorObj.statusCode === 429) {
      return new AuthError(
        ERROR_MESSAGES['too_many_requests'],
        'too_many_requests',
        429,
        error
      )
    }

    // 处理服务器错误
    if (errorObj.status && errorObj.status >= 500) {
      return new AuthError(
        ERROR_MESSAGES['internal_server_error'],
        'internal_server_error',
        errorObj.status,
        error
      )
    }

    // 尝试从错误对象中提取消息
    if (errorObj.message) {
      const knownMessage = ERROR_MESSAGES[errorObj.message]
      if (knownMessage) {
        return new AuthError(
          knownMessage,
          errorObj.message,
          errorObj.status || errorObj.statusCode,
          error
        )
      }
    }
  }

  // 处理字符串错误
  if (typeof error === 'string') {
    const knownMessage = ERROR_MESSAGES[error]
    if (knownMessage) {
      return new AuthError(knownMessage, error, undefined, error)
    }
  }

  // 处理 Error 实例
  if (error instanceof Error) {
    // 检查错误消息中是否包含已知的错误关键词
    for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.toLowerCase().includes(code.toLowerCase().replace(/_/g, ' '))) {
        return new AuthError(message, code, undefined, error)
      }
    }

    return new AuthError(
      '认证失败，请重试',
      'unknown_error',
      undefined,
      error
    )
  }

  // 未知错误类型
  return new AuthError(
    '发生未知错误，请重试',
    'unknown_error',
    undefined,
    error
  )
}

/**
 * 检查错误是否为速率限制错误
 * 
 * @param error - 错误对象
 * @returns 是否为速率限制错误
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof AuthError) {
    return error.code === 'too_many_requests' ||
           error.code === 'over_request_rate_limit' ||
           error.code === 'over_email_send_rate_limit' ||
           error.statusCode === 429
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { status?: number; statusCode?: number; message?: string }
    return errorObj.status === 429 || 
           errorObj.statusCode === 429 ||
           errorObj.message?.includes('rate_limit') === true
  }

  return false
}

/**
 * 检查错误是否为网络错误
 * 
 * @param error - 错误对象
 * @returns 是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AuthError) {
    return error.code === 'network_error' || error.code === 'timeout'
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  if (error instanceof Error && error.message.includes('timeout')) {
    return true
  }

  return false
}

/**
 * 检查错误是否为会话过期错误
 * 
 * @param error - 错误对象
 * @returns 是否为会话过期错误
 */
export function isSessionExpiredError(error: unknown): boolean {
  if (error instanceof AuthError) {
    return error.code === 'session_not_found' ||
           error.code === 'refresh_token_not_found' ||
           error.code === 'invalid_refresh_token'
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { message?: string }
    return errorObj.message?.includes('session') === true ||
           errorObj.message?.includes('refresh_token') === true
  }

  return false
}

/**
 * 获取错误的可操作指导
 * 
 * @param error - AuthError 实例
 * @returns 可操作的指导文本
 * 
 * 需求：14.5 - 在错误消息中提供可操作的指导
 */
export function getErrorGuidance(error: AuthError): string | null {
  switch (error.code) {
    case 'network_error':
    case 'timeout':
      return '请检查您的网络连接后重试'
    
    case 'too_many_requests':
    case 'over_request_rate_limit':
      return '请等待几分钟后再试'
    
    case 'over_email_send_rate_limit':
      return '请等待 5 分钟后再试'
    
    case 'session_not_found':
    case 'refresh_token_not_found':
    case 'invalid_refresh_token':
      return '请重新登录'
    
    case 'email_not_confirmed':
      return '请检查您的邮箱并点击验证链接'
    
    case 'verification_failed':
    case 'otp_expired':
      return '请重新发送验证邮件'
    
    case 'internal_server_error':
    case 'service_unavailable':
      return '如果问题持续存在，请联系技术支持'
    
    default:
      return null
  }
}
