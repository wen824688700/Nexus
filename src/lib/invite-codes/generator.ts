/**
 * 邀请码生成器
 * 生成加密安全的随机邀请码
 */

/**
 * 生成随机邀请码
 * - 8位字母数字组合
 * - 排除易混淆字符（0/O, 1/I/l）
 * - 使用加密安全的随机数生成器
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 排除 0, O, 1, I
  const length = 8
  const array = new Uint8Array(length)
  
  // 使用 Web Crypto API 生成加密安全的随机数
  crypto.getRandomValues(array)
  
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[array[i] % chars.length]
  }
  
  return code
}

/**
 * 批量生成唯一邀请码
 * @param count 生成数量（最多50个）
 * @param existingCodes 已存在的邀请码集合
 * @returns 唯一邀请码数组
 */
export function generateUniqueCodes(
  count: number,
  existingCodes: Set<string>
): string[] {
  if (count > 50) {
    throw new Error('单次最多生成50个邀请码')
  }
  
  if (count < 1) {
    throw new Error('生成数量必须大于0')
  }
  
  const codes: string[] = []
  const maxAttempts = count * 10 // 防止无限循环
  let attempts = 0
  
  while (codes.length < count && attempts < maxAttempts) {
    const code = generateInviteCode()
    if (!existingCodes.has(code) && !codes.includes(code)) {
      codes.push(code)
    }
    attempts++
  }
  
  if (codes.length < count) {
    throw new Error('生成唯一邀请码失败，请重试')
  }
  
  return codes
}
