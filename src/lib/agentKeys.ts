// Agent Keys and Names Mapping

export const AGENT_KEYS = {
  PORTRAIT_STUDIO: "portrait-studio",
  DATA_ANALYST: "data-analyst",
  IMAGE_EDITOR: "image-editor",
  PROMPT_OPTIMIZER: "prompt-optimizer",
  AUTOMATION: "automation",
  COACHING: "coaching",
} as const;

export const AGENT_NAMES = {
  [AGENT_KEYS.PORTRAIT_STUDIO]: "AI 肖像生成",
  [AGENT_KEYS.DATA_ANALYST]: "数据分析专家",
  [AGENT_KEYS.IMAGE_EDITOR]: "图像编辑",
  [AGENT_KEYS.PROMPT_OPTIMIZER]: "Prompt 优化器",
  [AGENT_KEYS.AUTOMATION]: "工作流自动化",
  [AGENT_KEYS.COACHING]: "面试复盘",
} as const;

export type AgentKey = (typeof AGENT_KEYS)[keyof typeof AGENT_KEYS];
