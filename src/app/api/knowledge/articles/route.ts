import { NextResponse } from "next/server";
import { queryArticlesDatabase } from "@/lib/notion";
import { env } from "@/env";

export const revalidate = 300; // ISR: 5分钟缓存

// Mock 数据（当 Notion 未配置时使用）
const MOCK_ARTICLES = [
  {
    id: "mock-1",
    title: "欢迎来到知识库",
    content: `# 欢迎来到知识库

这是一个示例文章。

## 如何使用

1. 在 Notion 中创建知识库数据库
2. 配置环境变量
3. 开始编写你的文章

## Markdown 支持

支持完整的 Markdown 语法：

- 列表
- **粗体**
- *斜体*
- \`代码\`

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

> 引用文字

---

更多信息请查看设置文档。
`,
    tags: ["示例"],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    // 检查是否配置了 Notion
    const notionToken = env.NOTION_TOKEN;
    const notionDbId = env.NOTION_ARTICLES_DB_ID;

    if (!notionToken || !notionDbId) {
      console.log("[Knowledge API] Notion not configured, using mock data");
      return NextResponse.json({ articles: MOCK_ARTICLES });
    }

    // 从 Notion 获取数据
    const notionArticles = await queryArticlesDatabase(notionDbId);

    // 转换为前端需要的格式
    const articles = notionArticles.map((article) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      tags: article.tags,
      isPublished: article.isPublished,
      createdAt: new Date(article.createdAt),
      updatedAt: new Date(article.updatedAt),
    }));

    console.log(`[Knowledge API] Loaded ${articles.length} articles from Notion`);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("[Knowledge API] Failed to fetch articles:", error);

    // 降级到 Mock 数据
    return NextResponse.json({
      articles: MOCK_ARTICLES,
      warning: "使用示例数据，请配置 Notion 集成",
    });
  }
}
