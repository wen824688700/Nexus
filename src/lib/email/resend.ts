import { Resend } from 'resend'

// 初始化 Resend 客户端
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * 发送验证码邮件
 * 
 * @param to - 收件人邮箱
 * @param code - 6 位验证码
 * @param type - 验证码类型（signup 或 reset_password）
 * @returns 发送结果
 */
export async function sendVerificationEmail(
  to: string,
  code: string,
  type: 'signup' | 'reset_password' = 'signup'
) {
  const subject = type === 'signup' ? '验证您的邮箱' : '重置您的密码'
  const title = type === 'signup' ? '邮箱验证码' : '密码重置验证码'
  const description = type === 'signup' 
    ? '感谢您注册 APEX AI Labs！请使用以下验证码完成注册：'
    : '您正在重置密码，请使用以下验证码继续：'

  try {
    const { data, error } = await resend.emails.send({
      from: 'APEX AI Labs <xiaomo@apex-ai-labs.live>',
      to: [to],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">${title}</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 0 40px 20px;">
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: rgba(255, 255, 255, 0.8);">
                          ${description}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Verification Code -->
                    <tr>
                      <td style="padding: 0 40px 30px;">
                        <div style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 30px; text-align: center;">
                          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">
                            ${code}
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 0 40px 40px;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: rgba(255, 255, 255, 0.6);">
                          此验证码将在 <strong>10 分钟</strong>后过期。如果您没有请求此验证码，请忽略此邮件。
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                      <td style="padding: 0 40px;">
                        <div style="border-top: 1px solid rgba(255, 255, 255, 0.1);"></div>
                      </td>
                    </tr>
                    
                    <!-- Brand -->
                    <tr>
                      <td style="padding: 20px 40px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                          © ${new Date().getFullYear()} APEX AI Labs. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Send email error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '发送邮件失败' 
    }
  }
}

/**
 * 生成 6 位随机验证码
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
