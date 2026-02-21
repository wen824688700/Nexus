/**
 * 邀请码系统类型定义
 */

export interface InviteCode {
  id: string
  code: string
  created_by: string
  created_at: string
  expires_at: string
  is_active: boolean
}

export interface InviteCodeWithUsage extends InviteCode {
  usage_count: number
  remaining_time: string
  status: 'active' | 'expired' | 'inactive'
}

export interface InviteCodeUse {
  id: string
  invite_code_id: string
  used_by: string
  used_at: string
  ip_address: string | null
  user?: {
    username: string
    email: string
  }
}

export interface InviteCodeGenerateRequest {
  count: number
}

export interface InviteCodeGenerateResponse {
  success: boolean
  codes?: InviteCode[]
  error?: string
}

export interface InviteCodeListResponse {
  success: boolean
  codes?: InviteCodeWithUsage[]
  total?: number
  page?: number
  pageSize?: number
  error?: string
}

export interface InviteCodeUsageResponse {
  success: boolean
  usage?: InviteCodeUse[]
  error?: string
}
