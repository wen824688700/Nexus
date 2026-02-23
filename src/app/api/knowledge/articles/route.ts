import { NextResponse } from "next/server";
import { queryArticlesMetadata } from "@/lib/notion";
import { env } from "@/env";

export const revalidate = 300; // ISR: 5分钟缓存

// Mock 元数据（当 Notion 未配置时使用）
const MOCK_METADATA = [
  {
    id: "mock-1",
    title: "欢迎来到知识库",
    tags: ["示例"],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    summary: "这是一个示例文章，展示如何使用知识库功能",
  },
];

/**
 * @deprecated 此接口已优化，现在只返回元数据
 * 完整内容请使用 /api/articles/[id]
 */
export async function GET() {
  try {
    // 检查是否配置了 Notion
    const notionToken = env.NOTION_TOKEN;
    const notionDbId = env.NOTION_ARTICLES_DB_ID;

    if (!notionToken || !notionDbId) {
      console.log("[Knowledge API] Notion not configured, using mock data");
      return NextResponse.json({ articles: MOCK_METADATA });
    }

    console.log("[Knowledge API] Fetching metadata only from Notion");

    // 只获取元数据，不获取完整内容
    const metadata = await queryArticlesMetadata(notionDbId);

    console.log(`[Knowledge API] Loaded ${metadata.length} articles metadata from Notion`);
    return NextResponse.json({ articles: metadata });
  } catch (error) {
    console.error("[Knowledge API] Failed to fetch articles:", error);

    // 降级到 Mock 数据
    return NextResponse.json({
      articles: MOCK_METADATA,
      warning: "使用示例数据，请配置 Notion 集成",
    });
  }
}
