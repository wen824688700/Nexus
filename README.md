# Personal OS - 个人数字化身网站

一个高保真的个人数字身份网站，融合 Bento Grid 布局、交互式 AI 智能体和复古风格项目展示系统。

## 🎯 产品概述

Personal OS 是一个创新的个人主页项目，打破传统简历和作品集的呈现方式，通过赛博朋克美学和 90 年代复古计算机风格，创造独特的数字身份体验。

### 核心特色

- **🎨 Bento Grid 布局** - 4 列响应式网格，包含英雄区、实时网站预览、AI 新闻流和智能体卡片
- **🖥️ Retro OS 模态框** - 90 年代风格的"机密档案"系统，用于浏览项目案例研究（替代传统简历）
- **🤖 AI 智能体集成** - 8 个 Coze 驱动的智能体，提供统一的模态 UI 交互
- **🎭 肖像工作室** - AI 驱动的肖像生成，带有自定义 UI 和参数控制
- **📡 Live Pulse** - 通过 n8n 工作流从 Notion 数据库实时聚合 AI 新闻

## 🚀 技术栈

### 核心框架
- **Next.js 16.1.1** (App Router) - React 服务端组件框架
- **React 19.2.3** - UI 库
- **TypeScript 5** - 类型安全
- **Tailwind CSS 4** - 实用优先的样式系统，自定义深色主题
- **Zod 4.3.5** - 运行时验证和类型推断

### 关键依赖
- **react-markdown** + **remark-gfm** - Markdown 渲染，支持 GitHub 风格
- **Notion SDK** (`@notionhq/client`) - CMS 集成
- **Coze Web SDK** - AI 智能体集成

### 开发工具
- **ESLint 9** - 代码质量检查
- **Prettier 3.7.4** - 代码格式化
- **TypeScript strict mode** - 严格类型检查

## 📦 快速开始

### 环境要求
- Node.js 18.17 或更高版本
- npm 或其他包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd web
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 到 `.env.local` 并填写必要的 API 密钥：

```bash
cp .env.example .env.local
```

必需的环境变量：
- `NOTION_TOKEN` - Notion API 集成令牌
- `NOTION_ARTICLES_DB_ID` - Retro OS 文章数据库 ID
- `COZE_BASE_URL` - Coze API 端点
- `COZE_ACCESS_TOKEN` - Coze 认证令牌
- `OPENROUTER_API_KEY` - OpenRouter API 密钥（仅服务端）

各智能体的独立配置（参考 `.env.example` 中的完整列表）



## 🎨 设计理念

### 视觉风格
- **极致深色模式** - 背景色 `#0a0a0a`，带有微妙的噪点纹理
- **边框效果** - 使用 `white/10` 透明度配合背景模糊
- **Magic UI 风格** - 关键卡片采用边框光束效果
- **复古美学** - 90 年代计算机美学与现代深色设计的融合

### 交互设计
- 流畅的动画过渡
- 响应式布局适配各种屏幕
- 直观的模态框交互
- 实时流式 AI 响应

## 🤖 AI 智能体功能

项目集成了 8 个专业 AI 智能体：

1. **Prompt 优化器** - 提升 AI 提示词质量
2. **自动化专家** - n8n 工作流自动化建议
3. **AI 教练** - 个人成长和职业发展指导
4. **数据分析师** - 数据可视化和洞察分析
5. **图像编辑器** - AI 驱动的图像处理
6. **音频分析器** - 音频文件分析和转录
7. **肖像生成器** - 定制化 AI 肖像创作
8. **公告播报** - 滚动新闻和公告展示

每个智能体都有：
- 独立的 API 路由 (`/api/agents/[agentKey]/run`)
- 统一的模态 UI 界面
- 流式响应支持
- 错误处理和加载状态

## 📁 项目结构

```
web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                 # API 路由（服务端）
│   │   │   ├── agents/          # Coze 智能体端点
│   │   │   ├── articles/        # Notion 文章端点
│   │   │   └── pulse/           # AI 新闻流端点
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页
│   │   └── globals.css          # 全局样式
│   ├── components/
│   │   ├── home/                # 首页组件
│   │   │   ├── HomeClient.tsx   # 主 Bento Grid
│   │   │   ├── AgentModal.tsx   # 统一智能体模态框
│   │   │   └── types.ts         # 共享类型
│   │   ├── retro-os/            # Retro OS 组件
│   │   │   ├── RetroOSModal.tsx # 主容器
│   │   │   ├── MonitorShell.tsx # 物理外壳
│   │   │   ├── CRTScreen.tsx    # 屏幕容器
│   │   │   ├── VirtualDesktop.tsx # 虚拟操作系统
│   │   │   └── ...              # 其他组件
│   │   └── agents/              # 智能体组件
│   ├── lib/                     # 工具库
│   │   ├── coze.ts             # Coze API 客户端
│   │   └── notion.ts           # Notion API 客户端
│   └── env.ts                   # 环境变量验证
├── public/                      # 静态资源
│   ├── music/                   # 音乐文件
│   └── prompt-optimizer/        # Prompt 框架文档
├── .env.local                   # 本地环境变量（不提交）
├── .env.example                 # 环境变量模板
└── package.json                 # 依赖和脚本
```

## 🎯 内容管理

### Notion 作为 CMS
所有动态内容（文章、新闻、简历数据）通过 Notion 数据库管理：

- **文章数据库** - Retro OS 中的项目案例
- **新闻数据库** - Live Pulse 的 AI 新闻流
- **自动同步** - 通过 n8n 工作流自动更新


## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Notion API 文档](https://developers.notion.com/)
- [Coze 平台文档](https://www.coze.com/docs)

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。


**Built with ❤️ using Next.js, React, and AI**
