/**
 * 积分管理器
 *
 * 提供积分余额查询、扣除、退款、充值等核心功能
 */

import { createClient } from "@/lib/supabase/server";

/**
 * 积分余额信息
 */
export type CreditBalance = {
  permanent: number;
  daily: number;
  total: number;
};

/**
 * 积分扣除结果
 */
export type DeductResult = {
  success: boolean;
  transactionId?: string;
  error?: string;
};

/**
 * 积分管理器类
 *
 * 负责所有积分相关的业务逻辑
 */
export class CreditManager {
  /**
   * 获取用户积分余额
   *
   * @param userId - 用户 ID
   * @returns 积分余额信息（永久积分、每日积分、总余额）
   */
  async getBalance(userId: string): Promise<CreditBalance> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("permanent_credits, daily_credits")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("[Credit Manager] Failed to get balance:", error);
      throw new Error("获取积分余额失败");
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      permanent: (data as any).permanent_credits || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daily: (data as any).daily_credits || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      total: ((data as any).permanent_credits || 0) + ((data as any).daily_credits || 0),
    };
  }

  /**
   * 检查余额是否充足
   *
   * 管理员拥有无限积分，自动通过检查
   *
   * @param userId - 用户 ID
   * @param amount - 所需积分数量
   * @returns 是否充足
   */
  async checkSufficientBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const supabase = await createClient();
      
      // 检查用户是否是管理员
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      // 管理员拥有无限积分
      if (profile && (profile as { role?: string }).role === "admin") {
        console.log("[Credit Manager] Admin user detected, bypassing credit check");
        return true;
      }
      
      // 普通用户检查余额
      const balance = await this.getBalance(userId);
      return balance.total >= amount;
    } catch (error) {
      console.error("[Credit Manager] Failed to check balance:", error);
      return false;
    }
  }

  /**
   * 扣除积分（优先使用每日积分）
   *
   * 管理员不扣除积分，直接返回成功
   * 使用数据库函数确保原子性和正确的扣除顺序
   *
   * @param userId - 用户 ID
   * @param amount - 扣除数量
   * @param agentKey - 智能体标识符
   * @param operationType - 操作类型（可选）
   * @returns 扣除结果
   */
  async deductCredits(
    userId: string,
    amount: number,
    agentKey: string,
    operationType?: string,
  ): Promise<DeductResult> {
    const supabase = await createClient();

    try {
      // 检查用户是否是管理员
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      // 管理员不扣除积分
      if (profile && (profile as { role?: string }).role === "admin") {
        console.log("[Credit Manager] Admin user detected, skipping credit deduction");
        return { success: true, transactionId: "admin-bypass" };
      }

      // 普通用户正常扣除
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("deduct_credits", {
        p_user_id: userId,
        p_amount: amount,
        p_agent_key: agentKey,
        p_operation_type: operationType || null,
      });

      if (error) {
        console.error("[Credit Manager] Deduct failed:", error);
        return {
          success: false,
          error: error.message || "积分扣除失败",
        };
      }

      console.log("[Credit Manager] Deduct success, transaction ID:", data);
      return { success: true, transactionId: data };
    } catch (error) {
      console.error("[Credit Manager] Deduct exception:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "积分扣除失败",
      };
    }
  }

  /**
   * 退还积分（按原类型退还）
   *
   * 用于智能体调用失败后的退款
   *
   * @param transactionId - 原交易记录 ID
   * @returns 是否成功
   */
  async refundCredits(transactionId: string): Promise<boolean> {
    const supabase = await createClient();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("refund_credits", {
        p_transaction_id: transactionId,
      });

      if (error) {
        console.error("[Credit Manager] Refund failed:", error);
        return false;
      }

      console.log("[Credit Manager] Refund success, transaction ID:", transactionId);
      return true;
    } catch (error) {
      console.error("[Credit Manager] Refund exception:", error);
      return false;
    }
  }

  /**
   * 添加永久积分
   *
   * 用于注册奖励、邀请奖励、兑换码充值
   *
   * @param userId - 用户 ID
   * @param amount - 积分数量
   * @param type - 交易类型（registration | invitation | redemption）
   * @param description - 描述信息
   * @param relatedCode - 相关代码（邀请码或兑换码，可选）
   * @returns 是否成功
   */
  async addPermanentCredits(
    userId: string,
    amount: number,
    type: "registration" | "invitation" | "redemption",
    description: string,
    relatedCode?: string,
  ): Promise<boolean> {
    const supabase = await createClient();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("add_permanent_credits", {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_description: description,
        p_related_code: relatedCode || null,
      });

      if (error) {
        console.error("[Credit Manager] Add permanent credits failed:", error);
        return false;
      }

      console.log("[Credit Manager] Add permanent credits success:", {
        userId,
        amount,
        type,
      });
      return true;
    } catch (error) {
      console.error("[Credit Manager] Add permanent credits exception:", error);
      return false;
    }
  }

  /**
   * 发放每日积分
   *
   * 每天首次访问时自动发放 20 每日积分
   * 使用数据库函数确保不会重复发放
   *
   * @param userId - 用户 ID
   * @returns 是否成功
   */
  async grantDailyCredits(userId: string): Promise<boolean> {
    const supabase = await createClient();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("grant_daily_credits", {
        p_user_id: userId,
      });

      if (error) {
        console.error("[Credit Manager] Grant daily credits failed:", error);
        return false;
      }

      console.log("[Credit Manager] Grant daily credits success:", userId);
      return true;
    } catch (error) {
      console.error("[Credit Manager] Grant daily credits exception:", error);
      return false;
    }
  }
}

/**
 * 创建积分管理器实例
 *
 * @returns 积分管理器实例
 */
export function createCreditManager(): CreditManager {
  return new CreditManager();
}
