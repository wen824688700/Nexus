import { env } from "@/env";
import { queryPulseDatabase } from "@/lib/notion";

export const runtime = "nodejs";
// 开发模式下禁用缓存，生产模式每24小时重新验证
export const revalidate = 86400;

export async function GET(req: Request) {
  try {
    const dbId = env.NOTION_NEWS_DB_ID;
    if (!dbId) {
      return Response.json({
        items: [],
        error: { code: "missing_env", message: "Missing NOTION_NEWS_DB_ID" },
      });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") ?? "20") || 20));

    const items = await queryPulseDatabase({
      databaseId: dbId,
      limit,
      includeContent: true,
    });

    // De-dupe defensively (n8n upsert mistakes / multi-views / partial edits).
    const seen = new Set<string>();
    const deduped = items.filter((it) => {
      const key = `${it.title}|${it.date ?? ""}|${it.url ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return Response.json({ items: deduped.slice(0, limit) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Avoid throwing 5xx in dev (Notion/network resets are noisy and can break streaming).
    return Response.json({ items: [], error: { code: "internal_error", message } });
  }
}
