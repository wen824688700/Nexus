import "server-only";

import { Client } from "@notionhq/client";
import { env } from "@/env";

type NotionRichText = { plain_text?: string; text?: { content?: string } };

function toPlainText(parts: NotionRichText[] | undefined): string {
  if (!parts?.length) return "";
  return parts.map((p) => p.plain_text ?? p.text?.content ?? "").join("");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number },
) {
  const { timeoutMs = 12_000, ...rest } = init;

  // ECONNRESET tends to be transient (local network / proxy / TLS middleboxes).
  // A small retry makes dev/staging much more stable without impacting UX much.
  const maxAttempts = 3;
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...rest, signal: controller.signal });
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts) break;
      await sleep(250 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("fetch failed");
}

export type NotionPulseRow = {
  id: string;
  title: string;
  date: string | null; // ISO string (Notion "date.start")
  url: string | null;
  content: string | null;
};

export type NotionArticleRow = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotionArticleMetadata = {
  id: string;
  title: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  summary?: string; // 文章摘要（前200字符）
};

/**
 * 初始化 Notion 客户端
 */
function getNotionClient() {
  const token = env.NOTION_TOKEN;
  if (!token) {
    throw new Error("Missing env.NOTION_TOKEN");
  }
  return new Client({ auth: token });
}

/**
 * 将 Notion 块转换为 Markdown
 */
async function blockToMarkdown(block: any, notion: Client, level = 0): Promise<string> {
  const indent = "  ".repeat(level);
  let markdown = "";

  try {
    switch (block.type) {
      case "paragraph":
        markdown += richTextToMarkdown(block.paragraph?.rich_text) + "\n\n";
        break;

      case "heading_1":
        markdown += "# " + richTextToMarkdown(block.heading_1?.rich_text) + "\n\n";
        break;

      case "heading_2":
        markdown += "## " + richTextToMarkdown(block.heading_2?.rich_text) + "\n\n";
        break;

      case "heading_3":
        markdown += "### " + richTextToMarkdown(block.heading_3?.rich_text) + "\n\n";
        break;

      case "bulleted_list_item":
        markdown += indent + "- " + richTextToMarkdown(block.bulleted_list_item?.rich_text) + "\n";
        break;

      case "numbered_list_item":
        markdown += indent + "1. " + richTextToMarkdown(block.numbered_list_item?.rich_text) + "\n";
        break;

      case "to_do":
        const checked = block.to_do?.checked ? "x" : " ";
        markdown += indent + `- [${checked}] ` + richTextToMarkdown(block.to_do?.rich_text) + "\n";
        break;

      case "toggle":
        markdown += indent + "▶ " + richTextToMarkdown(block.toggle?.rich_text) + "\n";
        break;

      case "code":
        const language = block.code?.language || "";
        const code = richTextToPlainText(block.code?.rich_text);
        markdown += "```" + language + "\n" + code + "\n```\n\n";
        break;

      case "quote":
        markdown += "> " + richTextToMarkdown(block.quote?.rich_text) + "\n\n";
        break;

      case "callout":
        const icon = block.callout?.icon?.emoji || "💡";
        markdown += `> ${icon} ${richTextToMarkdown(block.callout?.rich_text)}\n\n`;
        break;

      case "divider":
        markdown += "---\n\n";
        break;

      case "image":
        const imageUrl = block.image?.file?.url || block.image?.external?.url || "";
        const caption = richTextToPlainText(block.image?.caption);
        markdown += `![${caption}](${imageUrl})\n\n`;
        break;

      case "video":
        const videoUrl = block.video?.file?.url || block.video?.external?.url || "";
        markdown += `[视频](${videoUrl})\n\n`;
        break;

      case "file":
        const fileUrl = block.file?.file?.url || block.file?.external?.url || "";
        const fileName = richTextToPlainText(block.file?.caption) || "文件";
        markdown += `[${fileName}](${fileUrl})\n\n`;
        break;

      case "bookmark":
        const bookmarkUrl = block.bookmark?.url || "";
        markdown += `[🔗 ${bookmarkUrl}](${bookmarkUrl})\n\n`;
        break;

      case "table":
        // 表格需要获取子块
        if (block.has_children) {
          const children = await notion.blocks.children.list({ block_id: block.id });
          markdown += await tableToMarkdown(children.results, block.table?.table_width || 0);
        }
        break;

      case "table_row":
        // 表格行由 table 块处理
        break;

      case "column_list":
      case "column":
        // 列布局，递归处理子块
        if (block.has_children) {
          const children = await notion.blocks.children.list({ block_id: block.id });
          for (const child of children.results) {
            markdown += await blockToMarkdown(child, notion, level);
          }
        }
        break;

      default:
        // 未知块类型，尝试提取文本
        const text = extractTextFromBlock(block);
        if (text) {
          markdown += text + "\n\n";
        }
    }

    // 处理子块（嵌套内容）
    if (block.has_children && !["table", "column_list", "column"].includes(block.type)) {
      try {
        const children = await notion.blocks.children.list({ block_id: block.id });
        for (const child of children.results) {
          markdown += await blockToMarkdown(child, notion, level + 1);
        }
      } catch (error) {
        console.warn(`[Notion] Failed to fetch children for block ${block.id}:`, error);
      }
    }
  } catch (error) {
    console.warn(`[Notion] Error processing block ${block.id}:`, error);
  }

  return markdown;
}

/**
 * 将表格转换为 Markdown
 */
async function tableToMarkdown(rows: any[], columnCount: number): Promise<string> {
  if (rows.length === 0) return "";

  let markdown = "\n";
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.type !== "table_row") continue;

    const cells = row.table_row?.cells || [];
    const cellTexts = cells.map((cell: any) => richTextToPlainText(cell));
    
    markdown += "| " + cellTexts.join(" | ") + " |\n";
    
    // 添加表头分隔线
    if (i === 0) {
      markdown += "| " + Array(columnCount).fill("---").join(" | ") + " |\n";
    }
  }
  
  markdown += "\n";
  return markdown;
}

/**
 * 将富文本转换为 Markdown（保留格式）
 */
function richTextToMarkdown(richTexts: any[] | undefined): string {
  if (!richTexts || richTexts.length === 0) return "";

  return richTexts
    .map((text) => {
      let content = text.plain_text || "";

      // 应用格式
      if (text.annotations?.bold) content = `**${content}**`;
      if (text.annotations?.italic) content = `*${content}*`;
      if (text.annotations?.strikethrough) content = `~~${content}~~`;
      if (text.annotations?.code) content = `\`${content}\``;
      if (text.annotations?.underline) content = `<u>${content}</u>`;

      // 处理链接
      if (text.href) content = `[${content}](${text.href})`;

      return content;
    })
    .join("");
}

/**
 * 将富文本转换为纯文本
 */
function richTextToPlainText(richTexts: any[] | undefined): string {
  if (!richTexts || richTexts.length === 0) return "";
  return richTexts.map((text) => text.plain_text || "").join("");
}

/**
 * 从块中提取文本（兜底方案）
 */
function extractTextFromBlock(block: any): string {
  const blockData = block[block.type];
  if (blockData?.rich_text) {
    return richTextToPlainText(blockData.rich_text);
  }
  return "";
}

export async function queryPulseDatabase(args: {
  databaseId: string;
  limit: number;
  includeContent: boolean;
}): Promise<NotionPulseRow[]> {
  const token = env.NOTION_TOKEN;
  if (!token) {
    throw new Error("Missing env.NOTION_TOKEN");
  }

  const { databaseId, limit, includeContent } = args;
  const res = await fetchWithRetry(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Keep an older stable version; newer versions may shift endpoints (e.g. data_sources vs databases).
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: Math.max(1, Math.min(100, limit)),
      sorts: [
        {
          property: "日期",
          direction: "descending"
        }
      ]
    }),
    next: { revalidate: 180 },
    timeoutMs: 12_000,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Notion query failed: ${res.status} ${res.statusText} ${text}`.slice(0, 1200));
  }

  const data = (await res.json()) as {
    results?: Array<{
      id?: string;
      properties?: Record<string, unknown>;
    }>;
  };

  const results = data.results ?? [];
  const rows = results
    .map((page) => {
      const props = page.properties ?? {};

      const titleProp = props["标题"] as
        | { title?: NotionRichText[]; rich_text?: NotionRichText[] }
        | undefined;
      const dateProp = props["日期"] as { date?: { start?: string | null } | null } | undefined;
      const urlProp = props["链接"] as { url?: string | null } | undefined;
      const contentProp = props["内容"] as { rich_text?: NotionRichText[] } | undefined;

      const title = toPlainText(titleProp?.title) || toPlainText(titleProp?.rich_text);
      const date = dateProp?.date?.start ?? null;
      const url = urlProp?.url ?? null;
      const content = includeContent ? toPlainText(contentProp?.rich_text) || null : null;

      return {
        id: String(page.id ?? ""),
        title,
        date,
        url,
        content,
      } satisfies NotionPulseRow;
    })
    .filter((row) => row.id && row.title);

  // Notion sorting by property name can be brittle across API versions/locales.
  // Sort locally to keep the endpoint stable.
  rows.sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
  return rows;
}


/**
 * 查询知识库文章数据库（方案 1：数据库 + 页面内容）
 */
export async function queryArticlesDatabase(databaseId: string): Promise<NotionArticleRow[]> {
  const token = env.NOTION_ARTICLES_TOKEN || env.NOTION_TOKEN;
  if (!token) {
    throw new Error("Missing NOTION_ARTICLES_TOKEN or NOTION_TOKEN");
  }

  const notion = new Client({ auth: token });

  const response = await fetchWithRetry(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 100,
      // 不使用过滤器，获取所有数据后在代码中过滤
      // 这样可以避免属性名称不匹配的问题
    }),
    next: { revalidate: 300 }, // 5分钟缓存
    timeoutMs: 12_000,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Notion query failed: ${response.status} ${response.statusText} ${text}`.slice(0, 1200));
  }

  const data = (await response.json()) as {
    results?: Array<{
      id?: string;
      properties?: Record<string, any>;
      created_time?: string;
      last_edited_time?: string;
    }>;
  };

  const results = data.results ?? [];
  const articles: NotionArticleRow[] = [];

  // 并发获取所有页面内容
  await Promise.all(
    results.map(async (page) => {
      try {
        const props = page.properties ?? {};

        // 尝试多种可能的属性名称（中文/英文）
        const titleProp = props["标题"] || props["Title"] || props["title"] || props["Name"] || props["name"];
        const tagsProp = props["标签"] || props["Tags"] || props["tags"];
        const publishedProp = props["发布状态"] || props["Published"] || props["published"] || props["Status"] || props["status"];

        // 提取标题
        const title = titleProp?.title 
          ? toPlainText(titleProp.title)
          : titleProp?.rich_text 
            ? toPlainText(titleProp.rich_text)
            : "";

        // 提取标签
        const tags = tagsProp?.multi_select 
          ? (tagsProp.multi_select ?? []).map((t: any) => t.name ?? "").filter(Boolean)
          : [];

        // 提取发布状态（支持 checkbox 和 status 类型）
        let isPublished = false;
        if (publishedProp?.checkbox !== undefined) {
          isPublished = publishedProp.checkbox;
        } else if (publishedProp?.status?.name) {
          // 如果是 status 类型，检查状态名称
          const statusName = publishedProp.status.name.toLowerCase();
          isPublished = statusName === "published" || statusName === "已发布" || statusName === "done" || statusName === "完成";
        } else if (publishedProp?.select?.name) {
          // 如果是 select 类型
          const selectName = publishedProp.select.name.toLowerCase();
          isPublished = selectName === "published" || selectName === "已发布" || selectName === "yes" || selectName === "是";
        }

        // 如果没有标题或未发布，跳过
        if (!page.id || !title) {
          return;
        }

        // 如果没有发布状态属性，默认为已发布（向后兼容）
        if (publishedProp === undefined) {
          isPublished = true;
        }

        if (!isPublished) {
          return;
        }

        // 获取页面的完整内容
        const content = await getPageContent(notion, page.id);

        articles.push({
          id: String(page.id),
          title,
          content,
          tags,
          isPublished,
          createdAt: page.created_time ?? new Date().toISOString(),
          updatedAt: page.last_edited_time ?? new Date().toISOString(),
        });
      } catch (error) {
        console.error(`[Notion] Failed to process page ${page.id}:`, error);
      }
    })
  );

  // 按更新时间降序排序
  articles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return articles;
}

/**
 * 获取页面的完整内容并转换为 Markdown
 */
async function getPageContent(notion: Client, pageId: string): Promise<string> {
  try {
    let markdown = "";
    let cursor: string | undefined = undefined;
    let hasMore = true;

    // 使用分页获取所有块
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
        start_cursor: cursor,
      });

      // 处理当前页的所有块
      for (const block of response.results) {
        markdown += await blockToMarkdown(block, notion);
      }

      // 检查是否还有更多块
      hasMore = response.has_more;
      cursor = response.next_cursor ?? undefined;
    }

    return markdown.trim();
  } catch (error) {
    console.error(`[Notion] Failed to fetch page content for ${pageId}:`, error);
    return "# 内容加载失败\n\n无法获取文章内容，请稍后重试。";
  }
}

/**
 * 快速查询文章元数据（不获取完整内容）
 * 用于列表页快速加载
 */
export async function queryArticlesMetadata(databaseId: string): Promise<NotionArticleMetadata[]> {
  const token = env.NOTION_ARTICLES_TOKEN || env.NOTION_TOKEN;
  if (!token) {
    throw new Error("Missing NOTION_ARTICLES_TOKEN or NOTION_TOKEN");
  }

  const response = await fetchWithRetry(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 100,
    }),
    next: { revalidate: 300 }, // 5分钟缓存
    timeoutMs: 12_000,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Notion query failed: ${response.status} ${response.statusText} ${text}`.slice(0, 1200));
  }

  const data = (await response.json()) as {
    results?: Array<{
      id?: string;
      properties?: Record<string, any>;
      created_time?: string;
      last_edited_time?: string;
    }>;
  };

  const results = data.results ?? [];
  const articles: NotionArticleMetadata[] = [];

  for (const page of results) {
    try {
      const props = page.properties ?? {};

      // 尝试多种可能的属性名称
      const titleProp = props["标题"] || props["Title"] || props["title"] || props["Name"] || props["name"];
      const tagsProp = props["标签"] || props["Tags"] || props["tags"];
      const publishedProp = props["发布状态"] || props["Published"] || props["published"] || props["Status"] || props["status"];

      // 提取标题
      const title = titleProp?.title 
        ? toPlainText(titleProp.title)
        : titleProp?.rich_text 
          ? toPlainText(titleProp.rich_text)
          : "";

      // 提取标签
      const tags = tagsProp?.multi_select 
        ? (tagsProp.multi_select ?? []).map((t: any) => t.name ?? "").filter(Boolean)
        : [];

      // 提取发布状态
      let isPublished = false;
      if (publishedProp?.checkbox !== undefined) {
        isPublished = publishedProp.checkbox;
      } else if (publishedProp?.status?.name) {
        const statusName = publishedProp.status.name.toLowerCase();
        isPublished = statusName === "published" || statusName === "已发布" || statusName === "done" || statusName === "完成";
      } else if (publishedProp?.select?.name) {
        const selectName = publishedProp.select.name.toLowerCase();
        isPublished = selectName === "published" || selectName === "已发布" || selectName === "yes" || selectName === "是";
      } else if (publishedProp === undefined) {
        isPublished = true; // 默认已发布
      }

      if (!page.id || !title) continue;
      if (!isPublished) continue;

      articles.push({
        id: String(page.id),
        title,
        tags,
        isPublished,
        createdAt: page.created_time ?? new Date().toISOString(),
        updatedAt: page.last_edited_time ?? new Date().toISOString(),
        summary: title, // 暂时用标题作为摘要，后续可以优化
      });
    } catch (error) {
      console.error(`[Notion] Failed to process page metadata ${page.id}:`, error);
    }
  }

  // 按更新时间降序排序
  articles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return articles;
}

/**
 * 获取单篇文章的完整内容
 */
export async function getArticleContent(pageId: string): Promise<string> {
  const token = env.NOTION_ARTICLES_TOKEN || env.NOTION_TOKEN;
  if (!token) {
    throw new Error("Missing NOTION_ARTICLES_TOKEN or NOTION_TOKEN");
  }
  
  const notion = new Client({ auth: token });
  return await getPageContent(notion, pageId);
}
