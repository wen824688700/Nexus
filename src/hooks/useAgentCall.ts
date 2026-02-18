import { useState, useCallback } from "react";

interface InsufficientCreditsError {
  code: "INSUFFICIENT_CREDITS";
  message: string;
  required: number;
}

interface UseAgentCallOptions {
  onInsufficientCredits?: (error: InsufficientCreditsError) => void;
  onError?: (error: Error) => void;
}

/**
 * 智能体调用 Hook
 *
 * 提供统一的 API 调用接口，自动处理积分不足错误
 * 验证需求：1.7, 17.3
 */
export function useAgentCall(options: UseAgentCallOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAgent = useCallback(
    async (url: string, init?: RequestInit) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, init);
        const data = await response.json();

        // 处理 402 积分不足错误
        if (response.status === 402) {
          const insufficientError: InsufficientCreditsError = {
            code: "INSUFFICIENT_CREDITS",
            message: data.error?.message || "积分不足",
            required: data.error?.required || 0,
          };

          if (options.onInsufficientCredits) {
            options.onInsufficientCredits(insufficientError);
          }

          setError(insufficientError.message);
          return null;
        }

        // 处理其他错误
        if (!response.ok) {
          const errorMessage = data.error?.message || "请求失败";
          setError(errorMessage);

          if (options.onError) {
            options.onError(new Error(errorMessage));
          }

          return null;
        }

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "网络错误";
        setError(errorMessage);

        if (options.onError) {
          options.onError(err instanceof Error ? err : new Error(errorMessage));
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options],
  );

  return {
    callAgent,
    isLoading,
    error,
    setError,
  };
}
