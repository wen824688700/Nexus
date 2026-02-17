'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/auth/validation'
import type { Database } from '@/types/supabase'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

/**
 * 登录 Server Action
 * 
 * 支持使用用户名或邮箱登录
 * 验证需求：2.1, 2.2, 2.3
 * 
 * @param formData - 表单数据（identifier: 用户名或邮箱, password: 密码）
 * @returns 错误对象或 undefined（成功时重定向）
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  // 验证输入
  const validatedFields = loginSchema.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: '请提供有效的登录凭据',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { identifier, password } = validatedFields.data

  // 尝试使用邮箱登录
  const { error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  })

  if (error) {
    // 如果邮箱登录失败，尝试通过用户名查找邮箱
    if (error.message.includes('Invalid login credentials')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .maybeSingle<Pick<ProfileRow, 'email'>>()

      if (!profileError && profile?.email) {
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password,
        })

        if (!retryError) {
          revalidatePath('/', 'layout')
          redirect('/')
        }
      }
    }

    return { error: '用户名或密码错误' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * 发送邮箱验证码 Server Action
 * 
 * 生成并发送 6 位数字验证码到用户邮箱
 * 
 * @param email - 邮箱地址
 * @returns 成功消息或错误对象
 */
export async function sendVerificationCode(email: string) {
  const supabase = await createClient()

  // 验证邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: '请输入有效的邮箱地址' }
  }

  // 检查邮箱是否已注册
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    return { error: '该邮箱已被注册' }
  }

  // 生成 6 位验证码
  const { generateVerificationCode, sendVerificationEmail } = await import('@/lib/email/resend')
  const code = generateVerificationCode()

  // 计算过期时间（10 分钟后）
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // 删除该邮箱之前未使用的验证码
  await supabase
    .from('verification_codes')
    .delete()
    .eq('email', email)
    .eq('type', 'signup')
    .eq('used', false)

  // 存储验证码到数据库
  const { error: insertError } = await supabase
    .from('verification_codes')
    .insert({
      email,
      code,
      type: 'signup',
      expires_at: expiresAt,
      used: false,
    } as any)

  if (insertError) {
    console.error('Insert verification code error:', insertError)
    return { error: '生成验证码失败，请稍后重试' }
  }

  // 发送验证码邮件
  const emailResult = await sendVerificationEmail(email, code, 'signup')

  if (!emailResult.success) {
    console.error('Send email error:', emailResult.error)
    return { error: '发送验证码失败，请稍后重试' }
  }

  return {
    success: true,
    message: '验证码已发送到您的邮箱，请查收',
  }
}

/**
 * 注册 Server Action（使用验证码验证）
 * 
 * 创建新用户账户，需要验证邮箱验证码
 * 验证需求：3.1, 3.2, 3.3, 3.6, 3.7
 * 
 * @param formData - 表单数据（username: 用户名, email: 邮箱, password: 密码, code: 验证码）
 * @returns 成功消息或错误对象
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const validatedFields = signupSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: '请提供有效的注册信息',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { username, email, password } = validatedFields.data
  const code = formData.get('code') as string

  // 验证验证码
  if (!code || code.length !== 6) {
    return { error: '请输入 6 位验证码' }
  }

  // 检查用户名是否已存在
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle<Pick<ProfileRow, 'username'>>()

  if (!profileCheckError && existingProfile) {
    return { error: '用户名已被使用' }
  }

  // 验证验证码
  const { data: verificationData, error: verifyError } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('type', 'signup')
    .eq('used', false)
    .maybeSingle<Database['public']['Tables']['verification_codes']['Row']>()

  if (verifyError || !verificationData) {
    console.error('Verify code error:', verifyError)
    return { error: '验证码错误或已过期' }
  }

  // 检查验证码是否过期
  if (new Date(verificationData.expires_at) < new Date()) {
    return { error: '验证码已过期，请重新获取' }
  }

  // 标记验证码为已使用
  await supabase
    .from('verification_codes')
    // @ts-ignore - Supabase type inference issue with new table
    .update({ used: true })
    .eq('id', verificationData.id)

  // 创建用户（使用密码）
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: '该邮箱已被注册' }
    }
    console.error('Signup error:', error)
    return { error: '注册失败，请稍后重试' }
  }

  // 创建用户资料
  if (data.user) {
    const profileData: ProfileInsert = {
      id: data.user.id,
      username,
      email,
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileData as any)

    if (insertError) {
      console.error('Failed to create profile:', insertError)
      // 继续执行，因为用户已创建，profile 可以通过触发器创建
    }
  }

  // 自动登录
  await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return {
    success: true,
    message: '注册成功！',
  }
}

/**
 * Google OAuth 登录 Server Action
 * 
 * 重定向到 Google 授权页面
 * 验证需求：4.1
 * 
 * @returns 错误对象或 undefined（成功时重定向）
 */
export async function signInWithGoogle() {
  const supabase = await createClient()

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

/**
 * 登出 Server Action
 * 
 * 清除会话并重定向到首页
 * 验证需求：9.5, 10.6
 * 
 * @returns undefined（总是重定向）
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * 忘记密码 Server Action
 * 
 * 发送密码重置邮件
 * 验证需求：13.1, 13.2
 * 
 * @param formData - 表单数据（email: 邮箱）
 * @returns 成功消息或错误对象
 */
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()

  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return { error: '请提供有效的邮箱地址' }
  }

  const { email } = validatedFields.data

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    message: '密码重置链接已发送到您的邮箱',
  }
}

/**
 * 重置密码 Server Action
 * 
 * 更新用户密码
 * 验证需求：13.3, 13.4
 * 
 * @param formData - 表单数据（password: 新密码）
 * @returns 错误对象或 undefined（成功时重定向）
 */
export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: '请提供有效的密码',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
