"use client";

import { useState, useEffect } from "react";
import { GlitchText, AgentCard, HolographicCard, CyberButton } from "@/components/cyber";
import { AnnouncementTicker } from "./AnnouncementTicker";
import { EmailSubscribe } from "./EmailSubscribe";
import { AIInfoTicker } from "./AIInfoTicker";
import { AIHotTopics } from "./AIHotTopics";
import { CreateSkillModal } from "./CreateSkillModal";
import { AgentModal } from "@/components/home/AgentModal";
import { useAppStore } from "@/store/appStore";
import { MessageSquare, Zap, Image, Search, Plus } from "lucide-react";
import type { Agent } from "@/types";

// 智能体分类数据
const agentCategories = [
  {
    id: "prompts",
    name: "提示词",
    icon: MessageSquare,
    agents: [
      {
        id: "p1",
        name: "提示词优化器",
        description: "智能优化你的 Prompt，让 AI 更懂你的需求",
        icon: "Sparkles",
        status: "online" as const,
        category: "content" as const,
        kind: "promptOptimizer" as const,
      },
      {
        id: "audio_analyzer",
        name: "音频风格分析",
        description: "上传音频文件，智能识别并分析音乐风格特征",
        icon: "Music",
        status: "online" as const,
        category: "content" as const,
        kind: "audioAnalyzer" as const,
      },
      {
        id: "seedance_storyboard",
        name: "Seedance 2.0分镜助手",
        description: "一句话生成专业的即梦 Seedance 2.0 分镜脚本",
        icon: "Film",
        status: "online" as const,
        category: "content" as const,
        kind: "seedanceStoryboard" as const,
      },
    ],
  },
  {
    id: "productivity",
    name: "工具提效",
    icon: Zap,
    agents: [
      {
        id: "o2",
        name: "数据分析师",
        description: "上传 CSV 文件，进行可视化数据分析",
        icon: "BarChart3",
        status: "online" as const,
        category: "data" as const,
        kind: "analysis" as const,
      },
      {
        id: "image_editor",
        name: "图像编辑大师",
        description: "AI 驱动的智能图像编辑工具",
        icon: "Wand2",
        status: "online" as const,
        category: "design" as const,
        kind: "imageEditor" as const,
      },
      {
        id: "o1",
        name: "文档助手",
        description: "智能生成、总结和优化各类文档",
        icon: "FileText",
        status: "offline" as const,
        category: "content" as const,
      },
      {
        id: "o3",
        name: "PPT 生成器",
        description: "根据大纲自动生成精美 PPT",
        icon: "Presentation",
        status: "offline" as const,
        category: "design" as const,
      },
    ],
  },
  {
    id: "creative",
    name: "内容创作",
    icon: Image,
    agents: [
      {
        id: "portrait",
        name: "头像生成",
        description: "生成专业级个人头像",
        icon: "User",
        status: "online" as const,
        category: "design" as const,
        kind: "portrait" as const,
      },
      {
        id: "springFestivalMeme",
        name: "新春表情包生成器",
        description: "功能开发中，敬请期待",
        icon: "Gift",
        status: "offline" as const,
        category: "design" as const,
        kind: "springFestivalMeme" as const,
      },
      {
        id: "c2",
        name: "海报设计",
        description: "一键生成营销海报和宣传图",
        icon: "Layout",
        status: "offline" as const,
        category: "design" as const,
      },
    ],
  },
  {
    id: "research",
    name: "研究学习",
    icon: Search,
    agents: [
      {
        id: "r1",
        name: "论文助手",
        description: "文献检索、总结和引用生成",
        icon: "GraduationCap",
        status: "offline" as const,
        category: "research" as const,
      },
      {
        id: "r2",
        name: "知识问答",
        description: "基于知识库的智能问答系统",
        icon: "MessageCircle",
        status: "offline" as const,
        category: "research" as const,
      },
      {
        id: "r3",
        name: "学习规划",
        description: "制定个性化学习计划和路线图",
        icon: "Target",
        status: "offline" as const,
        category: "research" as const,
      },
    ],
  },
];

export function AgentsPage() {
  const [activeCategory, setActiveCategory] = useState("prompts");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentModalMounted, setAgentModalMounted] = useState(false);
  const [agentModalVisible, setAgentModalVisible] = useState(false);

  const { customSkills, isCreateSkillOpen, setCreateSkillOpen } = useAppStore();

  const currentCategory = agentCategories.find((cat) => cat.id === activeCategory);

  const handleAgentClick = async (agent: Agent) => {
    setSelectedAgent(agent);
    setAgentModalMounted(true);
    await new Promise((resolve) => setTimeout(resolve, 10));
    setAgentModalVisible(true);
  };

  const handleCloseAgentModal = async () => {
    setAgentModalVisible(false);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setAgentModalMounted(false);
    setSelectedAgent(null);
  };

  return (
    <section className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-[fade-in_0.6s_ease-out]">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-sm font-mono mb-4">
            Agent 中心
          </div>
          <GlitchText
            as="h1"
            className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-4"
          >
            你的 AI 工具箱
          </GlitchText>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            精选实用 AI 工具，一键调用，让 AI 为你提效
          </p>
        </div>

        {/* 公告 + 订阅 | AI资讯 + 热点 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10 animate-[fade-in_0.8s_ease-out]">
          {/* 左侧 */}
          <div className="space-y-4">
            <AnnouncementTicker />
            <EmailSubscribe />
          </div>

          {/* 右侧 */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            <AIInfoTicker />
            <AIHotTopics />
          </div>
        </div>

        {/* 分类标签栏 */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-[fade-in_1s_ease-out]">
          {agentCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeCategory === category.id
                  ? "bg-cyber-cyan text-cyber-dark shadow-neon-cyan"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              <category.icon className="w-4 h-4 inline-block mr-2" />
              {category.name}
            </button>
          ))}
        </div>

        {/* 当前分类的智能体 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentCategory?.agents.map((agent, index) => (
            <div 
              key={agent.id} 
              className="animate-[fade-in_0.6s_ease-out]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AgentCard {...agent} onClick={() => handleAgentClick(agent)} />
            </div>
          ))}
        </div>

        {/* 自定义技能区 */}
        <div className="animate-[fade-in_1.2s_ease-out]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-orbitron font-bold text-white">
              自定义技能
            </h2>
            <CyberButton
              size="sm"
              onClick={() => setCreateSkillOpen(true)}
              className="group"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建技能
            </CyberButton>
          </div>

          {customSkills.length === 0 ? (
            <HolographicCard intensity="low">
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  还没有自定义技能
                </h3>
                <p className="text-white/60 mb-6">
                  创建你的第一个自定义技能，连接任何 API
                </p>
                <CyberButton onClick={() => setCreateSkillOpen(true)}>
                  开始创建
                </CyberButton>
              </div>
            </HolographicCard>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {customSkills.map((skill) => (
                <AgentCard
                  key={skill.id}
                  name={skill.name}
                  description={skill.description}
                  icon="Wrench"
                  status="online"
                  category="support"
                  onClick={() => {
                    // TODO: 实现自定义技能点击处理
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateSkillModal
        isOpen={isCreateSkillOpen}
        onClose={() => setCreateSkillOpen(false)}
      />

      {selectedAgent && (
        <AgentModal
          mounted={agentModalMounted}
          visible={agentModalVisible}
          agent={{ 
            title: selectedAgent.name, 
            botId: selectedAgent.id, 
            icon: "✦", 
            kind: (selectedAgent as { kind?: "portrait" | "chat" | "analysis" | "workflow" | "promptOptimizer" | "imageEditor" | "springFestivalMeme" | "audioAnalyzer" | "seedanceStoryboard" }).kind || "chat",
            status: (selectedAgent.status === "busy" ? "online" : selectedAgent.status) as "online" | "offline"
          }}
          onClose={handleCloseAgentModal}
        />
      )}
    </section>
  );
}
