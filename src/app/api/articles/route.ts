import { NextResponse } from "next/server";
import { queryArticlesDatabase } from "@/lib/notion";
import { env } from "@/env";

export const revalidate = 300; // ISR: 5分钟缓存

// Mock 数据（当 Notion 未配置时使用）
const MOCK_ARTICLES = [
  {
    id: "mock-1",
    title: "n8n AI 资讯抓取助手",
    content: `# n8n AI 资讯抓取助手

## 系统日志 [2026-01-21]

**状态**: 自动运行中  
**任务**: 从 Reddit/YouTube 抓取 AI 动态  
**存储位置**: Notion DataSource ID: 2ebb89dd...

## 技术架构

- **触发器**: Cron (每日 08:00)
- **数据源**: Reddit API + YouTube Data API
- **处理**: OpenAI GPT-4 总结
- **存储**: Notion Database

## 核心价值

自动化信息聚合，节省 80% 的手动筛选时间。
`,
    tags: ["自动化", "工具玩法"],
    isPublished: true,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-21T00:00:00.000Z",
  },
  {
    id: "mock-2",
    title: "AI 肖像智能体",
    content: `# AI 肖像智能体

**项目**: Aura Portrait Studio  
**引擎**: Coze V3 API  
**模型**: Banana-1.0

## 功能描述

支持用户上传图片进行专业肖像风格化迁移。

## 技术亮点

- 参数面板自定义（风格/尺寸/强度）
- 结果画廊展示（缩略图 + Lightbox）
- 流式生成进度反馈
`,
    tags: ["AI应用", "项目复盘"],
    isPublished: true,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "mock-3",
    title: "数字分身知识库",
    content: `# 数字分身知识库

**核心逻辑**: RAG (Retrieval Augmented Generation)  
**底层**: Dify Workflow  
**知识库容量**: 1.2GB (项目文档/设计规范)

## 系统架构

1. 文档预处理
2. 向量化存储
3. 语义检索
4. 上下文增强
5. 生成回答
`,
    tags: ["深度长文", "技术分享"],
    isPublished: true,
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
  },
];

export async function GET() {
  try {
    // 检查是否配置了 Notion
    const notionDbId = env.NOTION_ARTICLES_DB_ID;

    if (!notionDbId) {
      console.log("[Articles API] Notion not configured, using mock data");
      return NextResponse.json({ articles: MOCK_ARTICLES });
    }

    console.log("[Articles API] Fetching from Notion database:", notionDbId);

    // 使用 notion.ts 中的函数获取文章（包含完整的页面内容）
    const articles = await queryArticlesDatabase(notionDbId);

    console.log(`[Articles API] Successfully fetched ${articles.length} articles`);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("[Articles API] Failed to fetch articles from Notion:", error);
    // 降级到 Mock 数据
    return NextResponse.json({ articles: MOCK_ARTICLES });
  }
}
