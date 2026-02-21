/**
 * 邀请码验证逻辑
 */

import { z } from 'zod'

/**
 * 邀请码格式验证 Schema
 */
export const inviteCodeSchema = z
  .string()
  .min(1, '请输入邀请码')
  .length(8, '邀请码必须是8位字符')
  .regex(/^[A-Z0-9]+$/, '邀请码只能包含大写字母和数字')
  .transform(str => str.toUpperCase().trim())

/**
 * 邀请码验证结果
 */
export interface InviteCodeValidation {
  valid: boolean
  error?: string
  code?: {
    id: string
    code: string
    expires_at: string
    created_by: string
  }
}

/**
 * 验证邀请码格式
 */
export function validateInviteCodeFormat(code: string): {
  valid: boolean
  error?: string
  normalized?: string
} {
  try {
    const normalized = inviteCodeSchema.parse(code)
    return { valid: true, normalized }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0].message }
    }
    return { valid: false, error: '邀请码格式不正确' }
  }
}

/**
 * 检查邀请码是否过期
 * @param expiresAt - 过期时间，null 表示永久有效
 */
export function isInviteCodeExpired(expiresAt: string | null): boolean {
  // 永久邀请码（expires_at 为 null）永不过期
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

/**
 * 计算剩余有效时间
 * @param expiresAt - 过期时间，null 表示永久有效
 */
export function getRemainingTime(expiresAt: string | null): string {
  // 永久邀请码
  if (!expiresAt) return '∞'
  
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  
  if (diff <= 0) return '已过期'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}天${hours}小时`
  return `${hours}小时`
}
