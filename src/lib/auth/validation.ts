import { z } from "zod";

/**
 * 用户名验证 Schema
 * 要求：3-20 字符，只能包含字母、数字和下划线
 * 验证需求：3.4, 3.5
 */
export const usernameSchema = z
  .string()
  .min(3, "用户名至少需要 3 个字符")
  .max(20, "用户名最多 20 个字符")
  .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线");

/**
 * 邮箱验证 Schema
 * 要求：标准邮箱格式
 * 验证需求：7.1
 */
export const emailSchema = z.string().email("请输入有效的邮箱地址");

/**
 * 密码验证 Schema
 * 要求：至少 8 个字符，包含大写字母、小写字母和数字
 * 验证需求：6.1, 6.2, 6.3, 6.4
 */
export const passwordSchema = z
  .string()
  .min(8, "密码至少需要 8 个字符")
  .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
  .regex(/[a-z]/, "密码必须包含至少一个小写字母")
  .regex(/[0-9]/, "密码必须包含至少一个数字");

/**
 * 登录表单验证 Schema
 * 接受用户名或邮箱作为标识符
 * 验证需求：2.1, 2.3
 */
export const loginSchema = z.object({
  identifier: z.string().min(1, "请输入用户名或邮箱"),
  password: z.string().min(1, "请输入密码"),
});

/**
 * 注册表单验证 Schema
 * 验证需求：3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 7.1
 */
export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/**
 * 忘记密码表单验证 Schema
 * 验证需求：13.1
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * 重置密码表单验证 Schema
 * 验证需求：13.3, 13.4
 */
export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

/**
 * 密码强度计算函数
 * 根据密码的长度和复杂度计算强度分数
 *
 * 评分标准：
 * - 长度 >= 8: +1 分
 * - 长度 >= 12: +1 分
 * - 包含大小写字母: +1 分
 * - 包含数字: +1 分
 * - 包含特殊字符: +1 分
 *
 * @param password - 要评估的密码字符串
 * @returns 包含分数（0-4）、标签和颜色的对象
 *
 * 验证需求：6.6
 */
export function calculatePasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;

  // 长度检查
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // 大小写字母检查
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;

  // 数字检查
  if (/[0-9]/.test(password)) score++;

  // 特殊字符检查
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // 标签和颜色映射
  const labels = ["很弱", "弱", "一般", "强", "很强"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
  };
}
