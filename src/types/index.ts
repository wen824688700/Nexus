// Agent Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "online" | "busy" | "offline";
  category: "content" | "data" | "code" | "design" | "research" | "support";
  kind?:
    | "portrait"
    | "chat"
    | "analysis"
    | "workflow"
    | "promptOptimizer"
    | "imageEditor"
    | "audioAnalyzer"
    | "springFestivalMeme"
    | "seedanceStoryboard";
}

export interface CustomSkill {
  id: string;
  name: string;
  description: string;
  apiEndpoint: string;
  parameters: SkillParameter[];
  createdAt: Date;
}

export interface SkillParameter {
  name: string;
  type: "string" | "number" | "boolean" | "file";
  required: boolean;
  description: string;
}

// Knowledge Base Types
export interface Article {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO 字符串
  updatedAt: string; // ISO 字符串
  isPublished: boolean;
  images?: Record<string, string>; // 图片存储：{ uuid: base64Data }
}

// 文章元数据（用于列表页快速加载）
export interface ArticleMetadata {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  summary?: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  articleId?: string;
  parentId?: string | null;
}

// News Types
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  url: string;
}

// UI Types
export type TabType = "agents" | "knowledge";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

// Music Player Types
export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
}
