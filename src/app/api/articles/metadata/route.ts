import { NextResponse } from "next/server";
import { queryArticlesMetadata } from "@/lib/notion";
import { env } from "@/env";

export const revalidate = 300; // ISR: 5分钟缓存

// Mock 数据（当 Notion 未配置时使用）
const MOCK_METADATA = [
  {
    id: "mock-1",
    title: "n8n AI 资讯抓取助手",
    tags: ["n8n", "自动化", "Notion"],
    isPublished: true,
    createdAt: new Date("2026-01-15").toISOString(),
    updatedAt: new Date("2026-01-15").toISOString(),
    summary: "使用 n8n 构建自动化工作流，从 Reddit/YouTube 抓取 AI 动态并写入 Notion",
  },
  {
    id: "mock-2",
    title: "AI 肖像智能体",
    tags: ["Coze", "AI", "图像生成"],
    isPublished: true,
    createdAt: new Date("2026-01-10").toISOString(),
    updatedAt: new Date("2026-01-10").toISOString(),
    summary: "基于 Coze V3 API 的专业肖像风格化迁移系统",
  },
  {
    id: "mock-3",
    title: "数字分身知识库",
    tags: ["Dify", "RAG", "知识库"],
    isPublished: true,
    createdAt: new Date("2026-01-05").toISOString(),
    updatedAt: new Date("2026-01-05").toISOString(),
    summary: "基于 Dify 的个人知识库 RAG 系统",
  },
];

export async function GET() {
  try {
    // 检查是否配置了 Notion
    const notionToken = env.NOTION_TOKEN;
    const notionDbId = env.NOTION_ARTICLES_DB_ID;

    if (!notionToken || !notionDbId) {
      console.log("[Articles Metadata API] Notion not configured, using mock data");
      return NextResponse.json({ articles: MOCK_METADATA });
    }

    console.log(`[Articles Metadata API] Fetching metadata from Notion database: ${notionDbId}`);

    // 从 Notion 获取元数据（不获取完整内容）
    const metadata = await queryArticlesMetadata(notionDbId);

    console.log(`[Articles Metadata API] Successfully fetched ${metadata.length} articles`);
    return NextResponse.json({ articles: metadata });
  } catch (error) {
    console.error("[Articles Metadata API] Failed to fetch metadata:", error);

    // 降级到 Mock 数据
    return NextResponse.json({
      articles: MOCK_METADATA,
      warning: "使用示例数据，请配置 Notion 集成",
    });
  }
}
