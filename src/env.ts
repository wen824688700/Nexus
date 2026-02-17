import { z } from "zod";

const envSchema = z.object({
  // Notion (CMS)
  NOTION_TOKEN: z.string().min(1).optional(),
  NOTION_NEWS_DB_ID: z.string().min(1).optional(),
  NOTION_HOT_DB_ID: z.string().min(1).optional(),
  NOTION_AGENTS_DB_ID: z.string().min(1).optional(),
  NOTION_RESUME_PAGE_ID: z.string().min(1).optional(),
  NOTION_ARTICLES_TOKEN: z.string().min(1).optional(), // 知识库专用 token
  NOTION_ARTICLES_DB_ID: z.string().min(1).optional(), // 知识库文章数据库

  // Coze
  COZE_API_BASE_URL: z.string().url().optional(),
  COZE_API_TOKEN: z.string().min(1).optional(),
  COZE_BOT_ID: z.string().min(1).optional(), // legacy single-bot fallback
  COZE_PORTRAIT_BOT_ID: z.string().min(1).optional(),
  COZE_PORTRAIT_WORKFLOW_ID: z.string().min(1).optional(),
  
  // Data Analyst Agent (数据分析专家)
  COZE_ANALYST_API_URL: z.string().url().optional(),
  COZE_ANALYST_TOKEN: z.string().min(1).optional(),
  COZE_ANALYST_PROJECT_ID: z.string().min(1).optional(),

  // Image Editor Agent (图像编辑智能体)
  COZE_IMAGE_EDITOR_API_URL: z.string().url().optional(),
  COZE_IMAGE_EDITOR_PROJECT_ID: z.string().min(1).optional(),
  COZE_IMAGE_EDITOR_TOKEN: z.string().min(1).optional(),

  // Audio Style Analyzer Agent (音频风格分析智能体)
  COZE_AUDIO_ANALYZER_API_URL: z.string().url().optional(),
  COZE_AUDIO_ANALYZER_PROJECT_ID: z.string().min(1).optional(),
  COZE_AUDIO_ANALYZER_TOKEN: z.string().min(1).optional(),

  // Spring Festival Meme Generator (新春表情包生成器)
  COZE_SPRING_FESTIVAL_MEME_API_URL: z.string().url().optional(),
  COZE_SPRING_FESTIVAL_MEME_PROJECT_ID: z.string().min(1).optional(),
  COZE_SPRING_FESTIVAL_MEME_TOKEN: z.string().min(1).optional(),

  // Seedance 2.0 Storyboard Assistant (Seedance 2.0分镜助手)
  COZE_SEEDANCE_API_URL: z.string().url().optional(),
  COZE_SEEDANCE_PROJECT_ID: z.string().min(1).optional(),
  COZE_SEEDANCE_TOKEN: z.string().min(1).optional(),

  // OpenRouter (used by your Coze portrait agent toolchain)
  OPENROUTER_API_KEY: z.string().min(1).optional(),

  // DeepSeek (for prompt optimizer)
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  DEEPSEEK_API_BASE_URL: z.string().url().optional(),

  // Supabase (Authentication)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Site Configuration
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  // Resend (Email Service)
  RESEND_API_KEY: z.string().min(1),

  // Optional guardrails
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().optional(),
});

export const env = envSchema.parse(process.env);
