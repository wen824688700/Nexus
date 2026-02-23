import { NextResponse } from "next/server";
import { getArticleContent } from "@/lib/notion";
import { env } from "@/env";

export const revalidate = 300; // ISR: 5分钟缓存

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查是否配置了 Notion
    const notionToken = env.NOTION_TOKEN;
    const notionDbId = env.NOTION_ARTICLES_DB_ID;

    if (!notionToken || !notionDbId) {
      return NextResponse.json(
        { error: "Notion not configured" },
        { status: 500 }
      );
    }

    console.log(`[Articles API] Fetching content for article: ${id}`);

    // 获取文章完整内容
    const content = await getArticleContent(id);

    console.log(`[Articles API] Successfully fetched article ${id}`);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("[Articles API] Failed to fetch article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
