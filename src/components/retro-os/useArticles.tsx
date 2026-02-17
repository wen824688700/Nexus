"use client";

import { useEffect, useState } from "react";
import type { Article } from "./types";

// Mock 数据（在 Notion API 配置好之前使用）
const MOCK_ARTICLES: Article[] = [
  {
    id: "mock-1",
    title: "n8n AI 资讯抓取助手.txt",
    icon: "📄",
    date: "2026-01-15",
    category: "自动化",
    summary: "使用 n8n 构建自动化工作流，从 Reddit/YouTube 抓取 AI 动态并写入 Notion",
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

## 实现亮点

1. 多源数据聚合
2. AI 智能总结
3. 自动去重与分类
4. 定时任务调度

## 技术难点

- API 限流处理
- 内容质量过滤
- 数据一致性保证
`,
    tags: ["n8n", "自动化", "Notion"],
  },
  {
    id: "mock-2",
    title: "AI 肖像智能体.doc",
    icon: "🖼️",
    date: "2026-01-10",
    category: "AI 应用",
    summary: "基于 Coze V3 API 的专业肖像风格化迁移系统",
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

## 实现细节

\`\`\`typescript
// 参数配置
const params = {
  style: "手办风",
  aspect_ratio: "1:1",
  count: 2
};
\`\`\`

## 成果

- 生成速度: 平均 8 秒/张
- 用户满意度: 92%
`,
    tags: ["Coze", "AI", "图像生成"],
  },
  {
    id: "mock-3",
    title: "数字分身知识库.pdf",
    icon: "📘",
    date: "2026-01-05",
    category: "RAG",
    summary: "基于 Dify 的个人知识库 RAG 系统",
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

## 技术选型

- **向量数据库**: Pinecone
- **Embedding 模型**: text-embedding-ada-002
- **LLM**: GPT-4

## 应用场景

- 面试官快速了解项目经历
- 技术选型决策查询
- 项目复盘知识沉淀

## 优化方向

- [ ] 增加多模态支持
- [ ] 优化检索准确率
- [ ] 降低 Token 消耗
`,
    tags: ["Dify", "RAG", "知识库"],
  },
];

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        // 尝试从 API 获取
        const res = await fetch("/api/articles");

        if (!res.ok) {
          // API 失败，使用 Mock 数据
          console.warn("API not available, using mock data");
          setArticles(MOCK_ARTICLES);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.error) {
          // API 返回错误，使用 Mock 数据
          console.warn("API error, using mock data:", data.error);
          setArticles(MOCK_ARTICLES);
        } else {
          // API 成功，使用真实数据
          setArticles(data.articles || []);
        }
      } catch (err) {
        // 网络错误，使用 Mock 数据
        console.warn("Fetch error, using mock data:", err);
        setArticles(MOCK_ARTICLES);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return { articles, loading };
}
