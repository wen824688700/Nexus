/**
 * 积分定价配置
 *
 * 定义所有智能体的积分价格和操作类型定价
 */

export type AgentPricingConfig = {
  agentKey: string;
  basePrice: number;
  operations?: {
    [operationType: string]: number;
  };
};

/**
 * 智能体定价配置表
 *
 * 每个智能体根据其计算成本设置不同的积分价格
 */
export const AGENT_PRICING: Record<string, AgentPricingConfig> = {
  // 提示词类智能体（1 积分）
  "prompt-optimizer": {
    agentKey: "prompt-optimizer",
    basePrice: 1,
  },
  "audio_analyzer": {
    agentKey: "audio_analyzer",
    basePrice: 1,
  },
  "audio-analyzer": {
    agentKey: "audio-analyzer",
    basePrice: 1,
  },
  "seedance-storyboard": {
    agentKey: "seedance-storyboard",
    basePrice: 1,
  },

  // 工具提效类智能体（5 积分）
  "data_analyst": {
    agentKey: "data_analyst",
    basePrice: 5,
  },
  "data-analyst": {
    agentKey: "data-analyst",
    basePrice: 5,
  },
  "o2": {
    agentKey: "o2",
    basePrice: 5,
  },

  // 图像编辑智能体（差异化定价）
  "image_editor": {
    agentKey: "image_editor",
    basePrice: 2,
    operations: {
      flux_edit: 5, // Flux 生图：5 积分
      default: 2, // 其他操作：2 积分
    },
  },
  "image-editor": {
    agentKey: "image-editor",
    basePrice: 2,
    operations: {
      flux_edit: 5, // Flux 生图：5 积分
      default: 2, // 其他操作：2 积分
    },
  },

  // 头像生成智能体（2 积分）
  "portrait": {
    agentKey: "portrait",
    basePrice: 2,
  },
  "portrait-studio": {
    agentKey: "portrait-studio",
    basePrice: 2,
  },
};

/**
 * 获取智能体调用所需的积分价格
 *
 * @param agentKey - 智能体标识符
 * @param operationType - 操作类型（可选，用于差异化定价）
 * @returns 所需积分数量
 * @throws Error 如果智能体不存在
 */
export function getAgentPrice(agentKey: string, operationType?: string): number {
  const config = AGENT_PRICING[agentKey];

  if (!config) {
    throw new Error(`Unknown agent: ${agentKey}`);
  }

  // 如果指定了操作类型且配置中有对应的价格，使用操作类型价格
  if (operationType && config.operations) {
    return config.operations[operationType] || config.basePrice;
  }

  // 否则使用基础价格
  return config.basePrice;
}

/**
 * 获取所有智能体的定价信息
 *
 * @returns 所有智能体的定价配置
 */
export function getAllAgentPricing(): Record<string, AgentPricingConfig> {
  return AGENT_PRICING;
}

/**
 * 检查智能体是否存在
 *
 * @param agentKey - 智能体标识符
 * @returns 是否存在
 */
export function isValidAgent(agentKey: string): boolean {
  return agentKey in AGENT_PRICING;
}
