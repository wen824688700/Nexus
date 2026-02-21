/**
 * 速率限制工具
 * 用于防止邀请码验证的暴力破解攻击
 */

interface RateLimitEntry {
  count: number
  resetTime: number
  bannedUntil?: number
}

// 内存缓存（生产环境建议使用 Redis）
const rateLimitCache = new Map<string, RateLimitEntry>()

// 清理过期条目的定时器
let cleanupInterval: NodeJS.Timeout | null = null

/**
 * 启动清理定时器
 */
function startCleanup() {
  if (cleanupInterval) return

  // 每5分钟清理一次过期条目
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitCache.entries()) {
      if (entry.resetTime < now && (!entry.bannedUntil || entry.bannedUntil < now)) {
        rateLimitCache.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

/**
 * 检查速率限制
 * @param ip IP 地址
 * @param maxAttempts 最大尝试次数（默认10次/小时）
 * @param windowMs 时间窗口（默认1小时）
 * @returns 是否允许请求
 */
export function checkRateLimit(
  ip: string,
  maxAttempts: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1小时
): { allowed: boolean; remaining: number; resetTime: number; banned?: boolean } {
  startCleanup()

  const now = Date.now()
  const entry = rateLimitCache.get(ip)

  // 检查是否被封禁
  if (entry?.bannedUntil && entry.bannedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.bannedUntil,
      banned: true,
    }
  }

  // 如果没有记录或已过期，创建新记录
  if (!entry || entry.resetTime < now) {
    rateLimitCache.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs,
    }
  }

  // 增加计数
  entry.count++

  // 检查是否超过限制
  if (entry.count > maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * 记录验证失败
 * @param ip IP 地址
 * @param inviteCode 尝试的邀请码
 * @param reason 失败原因
 */
export function recordValidationFailure(
  ip: string,
  inviteCode: string,
  reason: string
): void {
  const now = Date.now()
  const failureKey = `failure:${ip}`
  const entry = rateLimitCache.get(failureKey)

  // 记录失败日志
  console.warn('[邀请码验证失败]', {
    ip,
    inviteCode: inviteCode.substring(0, 2) + '****', // 部分隐藏
    reason,
    timestamp: new Date().toISOString(),
  })

  // 如果没有记录或已过期（5分钟窗口），创建新记录
  if (!entry || entry.resetTime < now) {
    rateLimitCache.set(failureKey, {
      count: 1,
      resetTime: now + 5 * 60 * 1000, // 5分钟窗口
    })
    return
  }

  // 增加失败计数
  entry.count++

  // 如果5分钟内失败5次，封禁1小时
  if (entry.count >= 5) {
    const bannedUntil = now + 60 * 60 * 1000 // 1小时
    rateLimitCache.set(ip, {
      count: entry.count,
      resetTime: entry.resetTime,
      bannedUntil,
    })

    console.error('[IP 自动封禁]', {
      ip,
      failureCount: entry.count,
      bannedUntil: new Date(bannedUntil).toISOString(),
    })
  }
}

/**
 * 检查 IP 是否被封禁
 * @param ip IP 地址
 * @returns 是否被封禁及解封时间
 */
export function isIPBanned(ip: string): { banned: boolean; bannedUntil?: number } {
  const now = Date.now()
  const entry = rateLimitCache.get(ip)

  if (entry?.bannedUntil && entry.bannedUntil > now) {
    return {
      banned: true,
      bannedUntil: entry.bannedUntil,
    }
  }

  return { banned: false }
}

/**
 * 手动解除 IP 封禁（管理员功能）
 * @param ip IP 地址
 */
export function unbanIP(ip: string): void {
  const entry = rateLimitCache.get(ip)
  if (entry) {
    delete entry.bannedUntil
    console.info('[IP 手动解封]', { ip })
  }
}

/**
 * 获取 IP 地址的速率限制状态
 * @param ip IP 地址
 */
export function getRateLimitStatus(ip: string): {
  count: number
  resetTime: number
  banned: boolean
  bannedUntil?: number
} {
  const now = Date.now()
  const entry = rateLimitCache.get(ip)

  if (!entry) {
    return {
      count: 0,
      resetTime: now,
      banned: false,
    }
  }

  return {
    count: entry.count,
    resetTime: entry.resetTime,
    banned: !!entry.bannedUntil && entry.bannedUntil > now,
    bannedUntil: entry.bannedUntil,
  }
}
