import { NextResponse } from "next/server";
import { queryArticlesMetadata } from "@/lib/notion";
import { env } from "@/env";

export const revalidate = 300; // ISR: 5分钟缓存

// Mock 元数据（当 Notion 未配置时使用）
const MOCK_METADATA = [
  {
    id: "mock-1",
    title: "n8n AI 资讯抓取助手",
    tags: ["自动化", "工具玩法"],
    isPublished: true,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-21T00:00:00.000Z",
    summary: "使用 n8n 构建自动化工作流，从 Reddit/YouTube 抓取 AI 动态并写入 Notion",
  },
  {
    id: "mock-2",
    title: "AI 肖像智能体",
    tags: ["AI应用", "项目复盘"],
    isPublished: true,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
    summary: "基于 Coze V3 API 的专业肖像风格化迁移系统",
  },
  {
    id: "mock-3",
    title: "数字分身知识库",
    tags: ["深度长文", "技术分享"],
    isPublished: true,
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
    summary: "基于 Dify 的个人知识库 RAG 系统",
  },
];

/**
 * @deprecated 此接口已废弃，请使用 /api/articles/metadata 获取列表
 * 为了向后兼容，此接口现在返回元数据而非完整内容
 */
export async function GET() {
  try {
    // 检查是否配置了 Notion
    const notionDbId = env.NOTION_ARTICLES_DB_ID;

    if (!notionDbId) {
      console.log("[Articles API] Notion not configured, using mock data");
      return NextResponse.json({ articles: MOCK_METADATA });
    }

    console.log("[Articles API - DEPRECATED] Fetching metadata only from:", notionDbId);
    console.log("[Articles API] Please use /api/articles/metadata for list and /api/articles/[id] for content");

    // 只获取元数据，不获取完整内容
    const metadata = await queryArticlesMetadata(notionDbId);

    console.log(`[Articles API] Successfully fetched ${metadata.length} articles metadata`);

    return NextResponse.json({ articles: metadata });
  } catch (error) {
    console.error("[Articles API] Failed to fetch articles metadata:", error);
    // 降级到 Mock 数据
    return NextResponse.json({ articles: MOCK_METADATA });
  }
}
