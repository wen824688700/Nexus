import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Agent, CustomSkill, Article, FileNode, NewsItem, TabType, Track } from "@/types";

interface AppState {
  // Active Tab
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Agents
  agents: Agent[];
  customSkills: CustomSkill[];
  addCustomSkill: (skill: Omit<CustomSkill, "id" | "createdAt">) => void;
  removeCustomSkill: (id: string) => void;

  // Knowledge Base
  articles: Article[];
  currentArticle: Article | null;
  fileTree: FileNode[];
  createArticle: (article: Omit<Article, "id" | "createdAt" | "updatedAt">) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  setCurrentArticle: (article: Article | null) => void;

  // UI State
  isCreateSkillOpen: boolean;
  setCreateSkillOpen: (open: boolean) => void;
  isArticleEditorOpen: boolean;
  setArticleEditorOpen: (open: boolean) => void;
  isAgentModalOpen: boolean;
  setAgentModalOpen: (open: boolean) => void;
  isAgentModalFullscreen: boolean;
  setAgentModalFullscreen: (fullscreen: boolean) => void;
  isKnowledgeFullscreen: boolean;
  setKnowledgeFullscreen: (fullscreen: boolean) => void;

  // Agent Modal Settings
  agentModalOpacity: number;
  setAgentModalOpacity: (opacity: number) => void;

  // News
  newsItems: NewsItem[];

  // Music Player
  currentTrack: Track | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: Track | null) => void;
}

const defaultAgents: Agent[] = [
  {
    id: "1",
    name: "肖像生成器",
    description: "输入描述，生成专业级肖像图",
    icon: "Image",
    status: "online",
    category: "design",
  },
  {
    id: "2",
    name: "数据洞察",
    description: "上传CSV文件，进行可视化数据分析",
    icon: "BarChart3",
    status: "online",
    category: "data",
  },
  {
    id: "3",
    name: "提示词优化器",
    description: "输入原始提示，获得结构化、优化的版本",
    icon: "Sparkles",
    status: "online",
    category: "content",
  },
  {
    id: "4",
    name: "AI资讯流",
    description: "自动抓取并展示每日最新的AI行业新闻",
    icon: "Newspaper",
    status: "online",
    category: "research",
  },
  {
    id: "5",
    name: "AI音乐",
    description: "在主页背景播放AI生成的音乐",
    icon: "Music",
    status: "online",
    category: "content",
  },
  {
    id: "6",
    name: "代码助手",
    description: "编写、审查和优化任何编程语言的代码",
    icon: "Code",
    status: "online",
    category: "code",
  },
];

const defaultNews: NewsItem[] = [
  {
    id: "1",
    title: "OpenAI 发布 GPT-5 预览版",
    summary: "新一代大语言模型在推理能力上实现重大突破",
    source: "AI科技日报",
    publishedAt: new Date(),
    url: "#",
  },
  {
    id: "2",
    title: "Google DeepMind 推出 AlphaFold 3",
    summary: "蛋白质结构预测 accuracy 提升至 99.8%",
    source: "科技前沿",
    publishedAt: new Date(Date.now() - 3600000),
    url: "#",
  },
  {
    id: "3",
    title: "Anthropic 发布 Claude 4",
    summary: "多模态能力和代码生成能力显著提升",
    source: "AI观察",
    publishedAt: new Date(Date.now() - 7200000),
    url: "#",
  },
  {
    id: "4",
    title: "Midjourney V7 即将发布",
    summary: "图像生成质量和速度双双提升",
    source: "设计科技",
    publishedAt: new Date(Date.now() - 10800000),
    url: "#",
  },
  {
    id: "5",
    title: "NVIDIA 发布新一代 AI 芯片",
    summary: "推理性能提升 10 倍，能耗降低 50%",
    source: "硬件资讯",
    publishedAt: new Date(Date.now() - 14400000),
    url: "#",
  },
];

const defaultFileTree: FileNode[] = [
  {
    id: "folder-1",
    name: "技术文档",
    type: "folder",
    children: [
      { id: "file-1", name: "API 设计规范.md", type: "file", articleId: "article-1" },
      { id: "file-2", name: "架构决策记录.md", type: "file", articleId: "article-2" },
    ],
  },
  {
    id: "folder-2",
    name: "学习笔记",
    type: "folder",
    children: [
      { id: "file-3", name: "React 最佳实践.md", type: "file", articleId: "article-3" },
      { id: "file-4", name: "TypeScript 高级类型.md", type: "file", articleId: "article-4" },
    ],
  },
  {
    id: "folder-3",
    name: "项目规划",
    type: "folder",
    children: [{ id: "file-5", name: "产品路线图.md", type: "file", articleId: "article-5" }],
  },
];

const defaultArticles: Article[] = [
  {
    id: "article-1",
    title: "API 设计规范",
    content:
      "# API 设计规范\n\n## RESTful 原则\n\n1. 使用名词而非动词\n2. 使用复数形式\n3. 正确运用 HTTP 状态码\n\n## 认证方式\n\n采用 JWT Token 认证...",
    tags: ["API", "设计"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: "article-2",
    title: "架构决策记录",
    content:
      "# 架构决策记录\n\n## 技术栈选择\n\n### 前端\n- React 18\n- TypeScript\n- Tailwind CSS\n\n### 后端\n- Node.js\n- PostgreSQL\n- Redis",
    tags: ["架构", "决策"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: "article-3",
    title: "React 最佳实践",
    content:
      "# React 最佳实践\n\n## 组件设计\n\n1. 单一职责原则\n2. Props  drilling 避免\n3. 合理使用 Context\n\n## 性能优化\n\n- useMemo 和 useCallback\n- React.memo\n- 代码分割",
    tags: ["React", "前端"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: "article-4",
    title: "TypeScript 高级类型",
    content:
      "# TypeScript 高级类型\n\n## 泛型\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```\n\n## 条件类型\n\n```typescript\ntype IsString<T> = T extends string ? true : false;\n```",
    tags: ["TypeScript"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
  },
  {
    id: "article-5",
    title: "产品路线图",
    content:
      "# 产品路线图\n\n## Q1 2024\n\n- [x] MVP 版本发布\n- [ ] 用户反馈收集\n- [ ] 性能优化\n\n## Q2 2024\n\n- [ ] 移动端适配\n- [ ] AI 功能集成",
    tags: ["产品", "规划"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Tab
      activeTab: "agents",
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Agents
      agents: defaultAgents,
      customSkills: [],
      addCustomSkill: (skill) => {
        const newSkill: CustomSkill = {
          ...skill,
          id: `skill-${Date.now()}`,
          createdAt: new Date(),
        };
        set((state) => ({
          customSkills: [...state.customSkills, newSkill],
        }));
      },
      removeCustomSkill: (id) => {
        set((state) => ({
          customSkills: state.customSkills.filter((s) => s.id !== id),
        }));
      },

      // Knowledge Base
      articles: defaultArticles,
      currentArticle: null,
      fileTree: defaultFileTree,
      createArticle: (article) => {
        const newArticle: Article = {
          ...article,
          id: `article-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          articles: [...state.articles, newArticle],
        }));
      },
      updateArticle: (id, updates) => {
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a,
          ),
        }));
      },
      deleteArticle: (id) => {
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
        }));
      },
      setCurrentArticle: (article) => set({ currentArticle: article }),

      // UI State
      isCreateSkillOpen: false,
      setCreateSkillOpen: (open) => set({ isCreateSkillOpen: open }),
      isArticleEditorOpen: false,
      setArticleEditorOpen: (open) => set({ isArticleEditorOpen: open }),
      isAgentModalOpen: false,
      setAgentModalOpen: (open) => set({ isAgentModalOpen: open }),
      isAgentModalFullscreen: false,
      setAgentModalFullscreen: (fullscreen) => set({ isAgentModalFullscreen: fullscreen }),
      isKnowledgeFullscreen: false,
      setKnowledgeFullscreen: (fullscreen) => set({ isKnowledgeFullscreen: fullscreen }),

      // Agent Modal Settings
      agentModalOpacity: 95,
      setAgentModalOpacity: (opacity) => set({ agentModalOpacity: opacity }),

      // News
      newsItems: defaultNews,

      // Music Player
      currentTrack: null,
      isPlaying: false,
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTrack: (track) => set({ currentTrack: track }),
    }),
    {
      name: "apex-ai-storage",
      partialize: (state) => ({
        customSkills: state.customSkills,
        articles: state.articles,
        fileTree: state.fileTree,
        agentModalOpacity: state.agentModalOpacity,
      }),
    },
  ),
);
