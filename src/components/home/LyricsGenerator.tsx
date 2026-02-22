"use client";

import { useState, useRef, useEffect } from "react";
import { GlitchText, CyberButton, NeonBorder, HolographicCard } from "@/components/cyber";
import { Music, Sparkles, Copy, RefreshCw, Send, Mic2, Disc3, Radio } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LoginPromptModal } from "@/components/auth/LoginPromptModal";
import { InsufficientCreditsModal } from "@/components/auth/InsufficientCreditsModal";
import { handleAgentError } from "@/utils/agentErrorHandler";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  agentKey: string;
}

const WELCOME_INFO = {
  greeting: "[ LYRICS GENERATOR SYSTEM ONLINE ]",
  title: "音乐歌词生成器",
  description: "专业级 AI 作词系统。内置 20 年经验金牌作词人角色，支持 Pop、Rock、EDM、R&B、Rap、Folk、古风等多种风格。",
  features: [
    {
      icon: Sparkles,
      title: "歌词生成",
      desc: "从零创作完整歌词作品",
      color: "cyan",
    },
    {
      icon: Mic2,
      title: "歌词续写",
      desc: "基于已有内容续写段落",
      color: "magenta",
    },
    {
      icon: Disc3,
      title: "歌词重写",
      desc: "优化提升表达艺术性",
      color: "purple",
    },
    {
      icon: Radio,
      title: "多轮优化",
      desc: "支持 20 轮对话迭代",
      color: "cyan",
    },
  ],
  examples: [
    '请帮我创作一首流行歌曲，主题是"初恋"，风格是 Pop Ballad，情绪是甜蜜青涩',
    '我有一段歌词：\n"巷口的风还沾着橘子糖香\n你递来的冰棒化在我手掌"\n\n请帮我续写 4 行副歌部分',
    '请帮我把这句话重写得更诗意：\n"我喜欢你"',
  ],
};

export function LyricsGenerator({ agentKey }: Props) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `user_${Date.now()}`);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // 身份验证模态框
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState<{
    required: number;
    current: number;
    permanent: number;
    daily: number;
  } | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新内容
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleStart = () => {
    setShowWelcome(false);
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;

    const userMessage = prompt.trim();
    setPrompt("");
    setError(null);
    setLoading(true);

    // 添加用户消息
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const formData = new FormData();
      formData.append("query", userMessage);
      formData.append("sessionId", sessionId);

      const response = await fetch(`/api/agents/${agentKey}/run`, {
        method: "POST",
        body: formData,
      });

      // 处理身份验证错误
      const handled = await handleAgentError(response, {
        onLoginRequired: () => setShowLoginModal(true),
        onInsufficientCredits: (info) => {
          setCreditsInfo(info);
          setShowCreditsModal(true);
        },
      });

      if (handled) {
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      // 处理 SSE 流
      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);

            if (json.error) {
              const errorMsg = typeof json.error === "string" ? json.error : json.error.message || json.error;
              setError(errorMsg);
              setStreamingContent("");
              break;
            }

            if (json.content) {
              fullContent += json.content;
              setStreamingContent(fullContent);
            }

            if (json.done) {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: json.fullAnswer || fullContent },
              ]);
              setStreamingContent("");
              break;
            }
          } catch (err) {
            console.warn("Failed to parse SSE event:", err);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "生成失败，请稍后重试";
      setError(message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setStreamingContent("");
    setError(null);
    setPrompt("");
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="h-full">
      {showWelcome ? (
        <WelcomeView onStart={handleStart} examples={WELCOME_INFO.examples} onExampleClick={handleExampleClick} />
      ) : (
        <GeneratorView
          prompt={prompt}
          setPrompt={setPrompt}
          messages={messages}
          streamingContent={streamingContent}
          loading={loading}
          error={error}
          setError={setError}
          showCopyToast={showCopyToast}
          outputRef={outputRef}
          handleSubmit={handleSubmit}
          handleReset={handleReset}
          handleCopy={handleCopy}
        />
      )}

      {/* 身份验证模态框 */}
      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        required={creditsInfo?.required ?? 0}
        current={creditsInfo?.current ?? 0}
        permanent={creditsInfo?.permanent ?? 0}
        daily={creditsInfo?.daily ?? 0}
      />
    </div>
  );
}

// ========== 欢迎页组件 ==========
function WelcomeView({ 
  onStart, 
  examples, 
  onExampleClick 
}: { 
  onStart: () => void; 
  examples: string[];
  onExampleClick: (example: string) => void;
}) {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6">
      <NeonBorder color="gradient" intensity="high" animated className="w-full max-w-6xl">
        <div className="bg-cyber-dark/90 p-8">
          {/* 横向布局：左右分栏 */}
          <div className="flex items-center gap-8">
            {/* 左侧：标题 + 功能特性 */}
            <div className="flex-1">
              {/* 主标题 */}
              <div className="mb-6">
                <GlitchText
                  as="h2"
                  className="font-orbitron mb-3 text-3xl font-bold text-white"
                  intensity="high"
                >
                  ◢ 音乐歌词生成器 ◣
                </GlitchText>
                <p className="text-base text-white/60">
                  专业级 AI 作词系统，内置 20 年经验金牌作词人角色，支持多种音乐风格创作
                </p>
              </div>

              {/* 功能卡片网格 - 2x2 */}
              <div className="grid grid-cols-2 gap-3">
                {WELCOME_INFO.features.map((feature) => (
                  <HolographicCard
                    key={feature.title}
                    className="group p-4 text-left"
                    intensity="low"
                  >
                    <div
                      className={`h-8 w-8 rounded-lg bg-${feature.color}-500/20 mb-2 flex items-center justify-center transition-transform group-hover:scale-110`}
                    >
                      <feature.icon className={`h-4 w-4 text-cyber-${feature.color}`} />
                    </div>
                    <h3 className="font-orbitron mb-1 text-sm font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-white/50">{feature.desc}</p>
                  </HolographicCard>
                ))}
              </div>
            </div>

            {/* 右侧：示例 + 按钮 */}
            <div className="flex w-80 flex-shrink-0 flex-col items-center justify-center">
              {/* 快速示例 */}
              <div className="mb-6 w-full space-y-2">
                <p className="mb-3 text-center font-mono text-xs text-white/40">快速开始示例</p>
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onExampleClick(example);
                      onStart();
                    }}
                    className="group w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60 transition-all hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5 hover:text-white/90"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-cyber-cyan transition-transform group-hover:scale-110" />
                      <span className="line-clamp-2">{example}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* 开始按钮 */}
              <CyberButton
                variant="primary"
                size="lg"
                glowColor="cyan"
                onClick={onStart}
                className="w-full animate-pulse"
              >
                <Music className="mr-2 h-5 w-5" />
                开始创作
                <span className="ml-2">&gt;&gt;</span>
              </CyberButton>
            </div>
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}

// ========== 生成器视图组件 ==========
interface GeneratorViewProps {
  prompt: string;
  setPrompt: (v: string) => void;
  messages: Message[];
  streamingContent: string;
  loading: boolean;
  error: string | null;
  setError: (v: string | null) => void;
  showCopyToast: boolean;
  outputRef: React.RefObject<HTMLDivElement | null>;
  handleSubmit: () => void;
  handleReset: () => void;
  handleCopy: (content: string) => void;
}

function GeneratorView({
  prompt,
  setPrompt,
  messages,
  streamingContent,
  loading,
  error,
  setError,
  showCopyToast,
  outputRef,
  handleSubmit,
  handleReset,
  handleCopy,
}: GeneratorViewProps) {
  return (
    <div className="flex h-full">
      {/* ========== 左侧：输入区域 ========== */}
      <div className="bg-cyber-dark/30 h-full w-1/2 overflow-y-auto border-r border-white/10 p-6">
        <div className="space-y-6">
          {/* 输入区域 */}
          <div className="rounded-lg border border-cyber-cyan/50 bg-cyber-cyan/5 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-cyber-cyan">01</span>
                <h4 className="font-orbitron text-white">输入创作需求</h4>
              </div>
            </div>

            <p className="mb-3 text-xs text-white/50">
              描述您想要的歌词风格、主题、情绪等信息
            </p>

            <div className="relative">
              <span className="text-cyber-cyan absolute top-4 left-4 animate-pulse">&gt;</span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder='例如：请帮我创作一首流行歌曲，主题是"初恋"，风格是 Pop Ballad'
                className="border-cyber-cyan/30 focus:border-cyber-cyan h-32 w-full resize-none rounded-lg border bg-black/50 py-3 pr-4 pl-10 font-mono text-sm text-white placeholder-white/30 transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)]"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-white/40">Ctrl + Enter 发送</p>
              <div className="flex gap-2">
                {messages.length > 0 && (
                  <CyberButton variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="mr-1 h-4 w-4" />
                    重新开始
                  </CyberButton>
                )}
                <CyberButton
                  variant="primary"
                  size="sm"
                  glowColor="cyan"
                  onClick={handleSubmit}
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "生成中..." : "发送"}
                </CyberButton>
              </div>
            </div>
          </div>

          {/* 对话历史 */}
          {messages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-cyber-magenta">02</span>
                <h4 className="font-orbitron text-white">对话历史</h4>
              </div>

              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${
                      message.role === "user"
                        ? "border-cyber-cyan/30 bg-cyber-cyan/5"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`font-mono text-xs ${
                          message.role === "user" ? "text-cyber-cyan" : "text-cyber-magenta"
                        }`}
                      >
                        {message.role === "user" ? "[ USER ]" : "[ AI ]"}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-white/80">{message.content.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== 右侧：输出区域 ========== */}
      <div ref={outputRef} className="h-full w-1/2 overflow-y-auto bg-black/20 p-6">
        <div className="flex h-full flex-col">
          {/* 标题 */}
          <div className="mb-4 flex items-center justify-between">
            <GlitchText as="h3" className="font-orbitron text-lg text-white">
              歌词输出
            </GlitchText>
            {(messages.length > 0 || streamingContent) && (
              <span className="animate-pulse font-mono text-xs text-green-400">
                [ {loading ? "生成中..." : "完成"} ]
              </span>
            )}
          </div>

          {/* 输出内容容器 */}
          <NeonBorder
            color="cyan"
            intensity={messages.length > 0 || streamingContent ? "high" : "low"}
            animated={loading}
          >
            <div className="flex min-h-[500px] flex-col bg-black/60">
              {/* 终端标题栏 */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500/50" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <span className="h-2 w-2 rounded-full bg-green-500/50" />
                <span className="ml-2 font-mono text-[10px] text-white/30">
                  {messages.length > 0 || streamingContent ? "lyrics_output.md" : "waiting..."}
                </span>
              </div>

              {/* 内容区 */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 && !streamingContent && !error && (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <div className="text-center">
                      <Music className="mx-auto mb-4 h-12 w-12 animate-pulse" />
                      <p className="font-mono text-sm">在左侧输入需求开始创作</p>
                    </div>
                  </div>
                )}

                {/* 显示所有消息 */}
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div key={index}>
                      {message.role === "assistant" && (
                        <div className="group relative">
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          <button
                            onClick={() => handleCopy(message.content)}
                            className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <CyberButton variant="outline" size="sm">
                              <Copy className="mr-1 h-3 w-3" />
                              复制
                            </CyberButton>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 流式内容 */}
                  {streamingContent && (
                    <div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {streamingContent}
                        </ReactMarkdown>
                      </div>
                      <span className="mt-2 inline-block h-4 w-1 animate-pulse bg-cyber-cyan" />
                    </div>
                  )}

                  {/* 错误提示 */}
                  {error && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-bold text-red-400">❌ 生成失败</span>
                      </div>
                      <p className="mb-3 text-sm text-red-300">{error}</p>
                      {error.includes("utils.helper") || error.includes("103002") ? (
                        <div className="rounded border border-red-500/20 bg-red-500/5 p-3">
                          <p className="mb-2 text-xs text-red-200">
                            这是智能体配置问题，可能的原因：
                          </p>
                          <ul className="list-inside list-disc space-y-1 text-xs text-red-200/80">
                            <li>智能体内部模块导入错误</li>
                            <li>建议联系管理员检查 Coze 智能体配置</li>
                          </ul>
                          <div className="mt-3">
                            <CyberButton
                              variant="outline"
                              size="sm"
                              onClick={handleReset}
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              清除并重试
                            </CyberButton>
                          </div>
                        </div>
                      ) : (
                        <CyberButton
                          variant="outline"
                          size="sm"
                          onClick={() => setError(null)}
                        >
                          关闭
                        </CyberButton>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </NeonBorder>

          {/* 复制成功提示 */}
          {showCopyToast && (
            <div className="bg-cyber-cyan/90 font-orbitron pointer-events-none fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 animate-[fade-in_0.2s_ease-out] rounded-lg px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(0,243,255,0.5)]">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                <span>已复制到剪贴板</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
