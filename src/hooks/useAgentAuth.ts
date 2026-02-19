/**
 * 智能体调用前的身份验证和积分检查 Hook
 *
 * 在调用智能体 API 前检查：
 * 1. 用户是否登录
 * 2. 积分余额是否充足
 *
 * 提供友好的用户体验，避免在 API 调用后才发现问题
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

type CreditBalance = {
  total: number;
  permanent: number;
  daily: number;
};

type AuthCheckResult = {
  canProceed: boolean;
  reason?: "not_logged_in" | "insufficient_credits";
  balance?: CreditBalance;
  required?: number;
};

/**
 * 智能体身份验证 Hook
 *
 * @param agentKey - 智能体标识符
 * @param requiredCredits - 所需积分数量（可选，如果不提供则只检查登录状态）
 */
export function useAgentAuth(agentKey: string, requiredCredits?: number) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);

  /**
   * 检查用户是否可以调用智能体
   *
   * @returns 检查结果
   */
  const checkAuth = useCallback(async (): Promise<AuthCheckResult> => {
    setChecking(true);

    try {
      // 1. 检查登录状态
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return {
          canProceed: false,
          reason: "not_logged_in",
        };
      }

      // 2. 如果不需要检查积分，直接通过
      if (!requiredCredits || requiredCredits === 0) {
        return { canProceed: true };
      }

      // 3. 检查积分余额
      const response = await fetch("/api/credits/balance");

      if (!response.ok) {
        // 如果获取余额失败，允许继续（后端会再次检查）
        console.warn("[useAgentAuth] Failed to fetch balance, allowing to proceed");
        return { canProceed: true };
      }

      const data = (await response.json()) as {
        success: boolean;
        total: number;
        permanent: number;
        daily: number;
      };

      const balance: CreditBalance = {
        total: data.total,
        permanent: data.permanent,
        daily: data.daily,
      };

      // 4. 检查余额是否充足
      if (balance.total < requiredCredits) {
        return {
          canProceed: false,
          reason: "insufficient_credits",
          balance,
          required: requiredCredits,
        };
      }

      return {
        canProceed: true,
        balance,
      };
    } catch (error) {
      console.error("[useAgentAuth] Check failed:", error);
      // 发生错误时允许继续（后端会再次检查）
      return { canProceed: true };
    } finally {
      setChecking(false);
    }
  }, [requiredCredits]);

  return {
    user,
    checking,
    checkAuth,
  };
}
