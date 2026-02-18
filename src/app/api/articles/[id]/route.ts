import { NextResponse } from "next/server";
import { getArticleContent } from "@/lib/notion";

export const revalidate = 300; // ISR: 5分钟缓存

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    console.log(`[Article Content API] Fetching content for article: ${id}`);

    // 获取单篇文章的完整内容
    const content = await getArticleContent(id);

    console.log(`[Article Content API] Successfully fetched content (${content.length} chars)`);

    return NextResponse.json({ content });
  } catch (error) {
    console.error("[Article Content API] Failed to fetch article content:", error);
    return NextResponse.json({ error: "Failed to load article content" }, { status: 500 });
  }
}
