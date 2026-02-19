/**
 * 智能体 API 调用错误处理工具
 * 
 * 统一处理 401 和 402 错误，显示相应的模态框
 */

export type ErrorHandlerCallbacks = {
  onLoginRequired: () => void;
  onInsufficientCredits: (info: {
    required: number;
    current: number;
    permanent: number;
    daily: number;
  }) => void;
};

/**
 * 处理智能体 API 响应错误
 * 
 * @param response - Fetch Response 对象
 * @param callbacks - 错误处理回调函数
 * @returns 如果是 401/402 错误返回 true，否则返回 false
 */
export async function handleAgentError(
  response: Response,
  callbacks: ErrorHandlerCallbacks
): Promise<boolean> {
  // 401 - 未登录
  if (response.status === 401) {
    callbacks.onLoginRequired();
    return true;
  }

  // 402 - 积分不足
  if (response.status === 402) {
    try {
      const errorData = await response.json();
      if (errorData.error?.code === "INSUFFICIENT_CREDITS") {
        callbacks.onInsufficientCredits({
          required: errorData.error.required || 0,
          current: errorData.error.current || 0,
          permanent: errorData.error.permanent || 0,
          daily: errorData.error.daily || 0,
        });
        return true;
      }
    } catch (e) {
      console.error("Failed to parse 402 error:", e);
    }
  }

  return false;
}
