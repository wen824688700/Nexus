"use client";

import {
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ImgHTMLAttributes,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { filterReportContent } from "@/utils/filterReport";
import { Upload, Send, X, BarChart3, FileText, Zap, Database } from "lucide-react";
import { LoginPromptModal } from "@/components/auth/LoginPromptModal";
import { InsufficientCreditsModal } from "@/components/auth/InsufficientCreditsModal";
import { handleAgentError } from "@/utils/agentErrorHandler";

type ToolCall = {
  id: string;
  name: string;
  status: "running" | "completed";
  description: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  files?: { name: string; size: number }[];
  charts?: { title: string; url: string }[];
  toolCalls?: ToolCall[];
};

type Props = {
  agentKey: string;
};

const MARKDOWN_COMPONENTS = {
  h1: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="font-orbitron text-cyber-cyan border-cyber-cyan mb-4 border-l-4 pl-3 text-lg font-bold shadow-[0_0_10px_rgba(0,243,255,0.3)]"
      {...props}
    />
  ),
  h2: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-orbitron mt-5 mb-3 text-base font-semibold text-white" {...props} />
  ),
  h3: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-orbitron mt-4 mb-2 text-sm font-medium text-white/90" {...props} />
  ),
  p: ({ ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-3 text-sm leading-relaxed text-white/70" {...props} />
  ),
  ul: ({ ...props }: HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-3 list-none space-y-1.5 text-sm" {...props} />
  ),
  ol: ({ ...props }: HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-3 list-inside list-decimal space-y-1.5 text-sm" {...props} />
  ),
  li: ({ ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li
      className="before:text-cyber-cyan flex items-start gap-2 text-sm text-white/70 before:mt-0.5 before:flex-shrink-0 before:content-['▸']"
      {...props}
    />
  ),
  strong: ({ ...props }: HTMLAttributes<HTMLElement>) => (
    <strong className="text-cyber-cyan font-semibold" {...props} />
  ),
  em: ({ ...props }: HTMLAttributes<HTMLElement>) => (
    <em className="text-white/80 italic" {...props} />
  ),
  code: ({ className, children, ...props }: HTMLAttributes<HTMLElement>) => {
    const isInline = !className?.includes("language-");
    return isInline ? (
      <code
        className="bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30 rounded border px-1.5 py-0.5 font-mono text-xs"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code
        className="border-cyber-cyan/30 block overflow-x-auto rounded-lg border bg-black/60 p-4 font-mono text-xs text-white/80 shadow-inner"
        {...props}
      >
        {children}
      </code>
    );
  },
  img: ({ ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      className="border-cyber-cyan/30 mt-4 w-full rounded-lg border-2 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
      loading="lazy"
      {...props}
    />
  ),
  a: ({ ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-cyber-cyan decoration-cyber-cyan/40 hover:decoration-cyber-cyan underline underline-offset-2 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: ({ ...props }: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-cyber-cyan/60 bg-cyber-cyan/5 rounded-r border-l-2 py-2 pl-3 text-sm text-white/70 italic"
      {...props}
    />
  ),
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
      {content}
    </ReactMarkdown>
  );
}

function ToolStatusIndicator({ tool }: { tool: ToolCall }) {
  const isRunning = tool.status === "running";
  const icon =
    tool.name === "create_chart" ? (
      <BarChart3 className="h-3.5 w-3.5" />
    ) : (
      <Database className="h-3.5 w-3.5" />
    );

  return (
    <div
      className={[
        "group relative flex items-center gap-3 overflow-hidden rounded-lg border px-4 py-2.5 text-xs transition-all",
        isRunning
          ? "animate-slideIn border-cyber-cyan/40 bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
          : "border-white/10 bg-white/5 opacity-70",
      ].join(" ")}
    >
      {/* Scan line effect for running tools */}
      {isRunning && (
        <div className="pointer-events-none absolute inset-0">
          <div className="via-cyber-cyan/50 absolute h-[1px] w-full animate-[scan-line_2s_linear_infinite] bg-gradient-to-r from-transparent to-transparent" />
        </div>
      )}

      <div className="relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center">
        {isRunning ? (
          <div className="relative flex h-3 w-3 items-center justify-center">
            <div className="bg-cyber-cyan absolute h-3 w-3 animate-ping rounded-full opacity-75" />
            <div className="bg-cyber-cyan relative h-2 w-2 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
          </div>
        ) : (
          <div className="text-sm text-green-400">✓</div>
        )}
      </div>
      <div className="text-cyber-cyan/80 flex-shrink-0">{icon}</div>
      <span className="flex-1 truncate font-mono text-white/80">{tool.description}</span>
      {isRunning && (
        <div className="flex gap-0.5">
          <div className="bg-cyber-cyan h-1 w-1 animate-pulse rounded-full" />
          <div
            className="bg-cyber-cyan h-1 w-1 animate-pulse rounded-full"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="bg-cyber-cyan h-1 w-1 animate-pulse rounded-full"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      )}
    </div>
  );
}

const WELCOME = {
  greeting: "[ DATA ANALYSIS SYSTEM ONLINE ]",
  description:
    "深度挖掘业务数据价值，提供智能决策支持与专业分析建议。支持 Excel、CSV、图表、文档等多格式数据分析。",
  cta: "上传数据文件或输入分析需求，系统将为您生成专业报告与可视化图表。",
  suggestions: [
    "上传 Excel → 分析销售数据趋势",
    "如何优化用户留存率？",
    "上传图表 → 解读数据可视化",
  ],
};

export function DataAnalyst({ agentKey }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingCharts, setStreamingCharts] = useState<{ title: string; url: string }[]>([]);
  const [streamingTools, setStreamingTools] = useState<ToolCall[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [sessionId] = useState(() => `user_${Date.now()}`); // 保持会话 ID

  // 身份验证模态框
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState<{
    required: number;
    current: number;
    permanent: number;
    daily: number;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingContent, streamingTools]);

  function handleAbort() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setStreamingContent("");
    setStreamingCharts([]);
    const abortMessage: Message = {
      role: "assistant",
      content: "已中止分析请求。",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, abortMessage]);
  }

  async function run() {
    if (!prompt.trim() && files.length === 0) return;

    const userMessage: Message = {
      role: "user",
      content: prompt || "（已上传文件，请分析）",
      timestamp: Date.now(),
      files: files.length > 0 ? files.map((f) => ({ name: f.name, size: f.size })) : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setError(null);
    setStreamingContent("");
    setStreamingCharts([]);
    setStreamingTools([]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const fd = new FormData();
      fd.set("query", prompt || "请分析上传的文件");
      fd.set("session_id", sessionId); // 传递会话 ID

      // 添加所有文件到 FormData
      files.forEach((file, index) => {
        fd.append(`file_${index}`, file);
      });
      fd.set("file_count", String(files.length));

      const res = await fetch(`/api/agents/${encodeURIComponent(agentKey)}/run`, {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });

      // 处理身份验证错误
      const handled = await handleAgentError(res, {
        onLoginRequired: () => {
          // 移除刚添加的用户消息
          setMessages((prev) => prev.slice(0, -1));
          setShowLoginModal(true);
        },
        onInsufficientCredits: (info) => {
          // 移除刚添加的用户消息
          setMessages((prev) => prev.slice(0, -1));
          setCreditsInfo(info);
          setShowCreditsModal(true);
        },
      });

      if (handled) {
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(json.error?.message || "请求失败");
      }

      // 处理流式响应
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("无法读取响应流");
      }

      let fullContent = "";
      let buffer = "";
      let shouldStop = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            shouldStop = true;
            break;
          }

          try {
            const json = JSON.parse(data) as {
              content?: string;
              done?: boolean;
              fullAnswer?: string;
              charts?: { title: string; url: string }[];
              type?: string;
              tool?: string;
              args?: Record<string, unknown>;
              result?: string;
            };

            // 处理工具事件
            if (json.type === "tool_start" && json.tool) {
              const toolName = json.tool;
              const args = json.args || {};
              let description = "";

              // 生成友好的描述
              if (toolName === "read_data_file") {
                const fileKey = (args.file_key || args.file_url || "") as string;
                const fileName = fileKey.split("/").pop() || "文件";
                description = `正在读取 ${fileName}`;
              } else if (toolName === "create_chart") {
                const chartType = args.chart_type as string;
                const title = args.title as string;
                const typeMap: Record<string, string> = {
                  bar: "柱状图",
                  line: "折线图",
                  pie: "饼图",
                  scatter: "散点图",
                };
                const typeName = typeMap[chartType] || "图表";
                description = title ? `正在生成${typeName}：${title}` : `正在生成${typeName}`;
              } else {
                description = `正在执行 ${toolName}`;
              }

              setStreamingTools((prev) => [
                ...prev,
                {
                  id: `${toolName}_${Date.now()}`,
                  name: toolName,
                  status: "running",
                  description,
                },
              ]);
            } else if (json.type === "tool_complete" && json.tool) {
              const toolName = json.tool;
              const result = json.result || "";

              setStreamingTools((prev) =>
                prev.map((tool) => {
                  if (tool.name === toolName && tool.status === "running") {
                    let completedDesc = tool.description;

                    // 更新完成描述
                    if (toolName === "read_data_file") {
                      const match = result.match(/总行数:\s*(\d+)/);
                      if (match) {
                        completedDesc = `已读取 ${match[1]} 行数据`;
                      } else {
                        completedDesc = "已读取文件";
                      }
                    } else if (toolName === "create_chart") {
                      completedDesc = "已生成图表";
                    } else {
                      completedDesc = `已完成 ${toolName}`;
                    }

                    return { ...tool, status: "completed" as const, description: completedDesc };
                  }
                  return tool;
                }),
              );
            }

            // 处理内容
            if (json.content) {
              fullContent += json.content;
              setStreamingContent(fullContent);
            }
            if (json.done) {
              const filtered = filterReportContent(fullContent);
              fullContent = filtered || fullContent;
              setStreamingContent(fullContent);
              if (json.fullAnswer && json.fullAnswer.length > fullContent.length) {
                fullContent = json.fullAnswer;
                setStreamingContent(fullContent);
              }
              // 保存图表
              if (json.charts && json.charts.length > 0) {
                setStreamingCharts(json.charts);
              }
              shouldStop = true;
              break;
            }
          } catch {
            // 忽略解析错误
          }
        }

        if (shouldStop) {
          reader.cancel().catch(() => {});
          break;
        }
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: fullContent || "分析完成，但未返回内容。",
        timestamp: Date.now(),
        charts: streamingCharts.length > 0 ? streamingCharts : undefined,
        toolCalls: streamingTools.length > 0 ? streamingTools : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
      setStreamingCharts([]);
      setStreamingTools([]);
      setPrompt("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return; // 用户主动中止，不显示错误
      }
      const errorMsg = e instanceof Error ? e.message : "未知错误";
      setError(errorMsg);
      const errorMessage: Message = {
        role: "assistant",
        content: `抱歉，分析失败：${errorMsg}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setPrompt(suggestion);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      run();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="border-cyber-cyan/20 mb-4 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-cyber-cyan/10 border-cyber-cyan/30 flex h-8 w-8 items-center justify-center rounded border">
            <BarChart3 className="text-cyber-cyan h-4 w-4" />
          </div>
          <div>
            <div className="text-cyber-cyan font-mono text-xs tracking-[0.2em] uppercase">
              Data Analytics
            </div>
            <div className="font-mono text-[10px] text-white/40">v2.1.0 | Neural Engine</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-cyber-cyan h-2 w-2 animate-pulse rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
          <span className="text-cyber-cyan/80 font-mono text-[10px] tracking-widest uppercase">
            Online
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="border-cyber-cyan/20 relative mb-4 flex-1 overflow-y-auto rounded-2xl border bg-black/40 p-4 backdrop-blur-sm">
        {/* Scan Line Effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="via-cyber-cyan/20 absolute h-[2px] w-full animate-[scan-line_4s_linear_infinite] bg-gradient-to-r from-transparent to-transparent" />
        </div>
        {messages.length === 0 && !loading ? (
          <div className="relative z-10 flex h-full flex-col items-start justify-start gap-5 p-6">
            <div className="flex w-full gap-4">
              <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                <BarChart3 className="text-cyber-cyan h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="font-orbitron text-cyber-cyan mb-3 text-sm font-bold tracking-wide">
                  {WELCOME.greeting}
                </div>
                <p className="mb-2 text-sm leading-relaxed text-white/70">{WELCOME.description}</p>
                <p className="font-mono text-xs text-white/50">{WELCOME.cta}</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <div className="text-cyber-cyan/60 mb-1 font-mono text-xs tracking-wider uppercase">
                ▸ Quick Actions
              </div>
              <div className="flex flex-wrap gap-2">
                {WELCOME.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="border-cyber-cyan/20 bg-cyber-cyan/5 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 group rounded-lg border px-4 py-3 text-xs text-white/80 transition-all hover:shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                  >
                    <span className="group-hover:text-cyber-cyan font-mono whitespace-nowrap transition-colors">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  className={[
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  {msg.role === "assistant" ? (
                    <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                      <BarChart3 className="text-cyber-cyan h-5 w-5" />
                    </div>
                  ) : null}
                  <div
                    className={[
                      "relative max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "border border-white/20 bg-white/10 text-white"
                        : "bg-cyber-cyan/5 border-cyber-cyan/20 border text-white/90 shadow-[0_0_10px_rgba(0,243,255,0.05)]",
                    ].join(" ")}
                  >
                    {msg.role === "assistant" ? (
                      <MarkdownContent content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                    {msg.files && msg.files.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {msg.files.map((file, idx) => (
                          <div
                            key={idx}
                            className="border-cyber-cyan/20 bg-cyber-cyan/5 flex items-center gap-2 rounded-lg border px-3 py-2"
                          >
                            <FileText className="text-cyber-cyan h-3.5 w-3.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-semibold text-white">
                                {file.name}
                              </div>
                              <div className="text-cyber-cyan/60 font-mono text-[10px]">
                                {(file.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {msg.charts && msg.charts.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        <div className="border-cyber-cyan/20 flex items-center gap-2 border-t pt-3">
                          <BarChart3 className="text-cyber-cyan h-4 w-4" />
                          <span className="text-cyber-cyan font-mono text-xs font-semibold tracking-wider uppercase">
                            Generated Charts ({msg.charts.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {msg.charts.map((chart, idx) => (
                            <div
                              key={idx}
                              className="group border-cyber-cyan/30 hover:border-cyber-cyan/50 relative overflow-hidden rounded-lg border-2 bg-black/60 p-3 transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                            >
                              <img
                                src={chart.url}
                                alt={chart.title}
                                className="w-full rounded"
                                loading="lazy"
                              />
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="flex-1 truncate text-xs font-medium text-white/90">
                                  {chart.title}
                                </span>
                                <a
                                  href={chart.url}
                                  download={`${chart.title}.png`}
                                  className="border-cyber-cyan/30 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border text-xs transition-all hover:shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                                  title="下载图表"
                                >
                                  ⬇
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {msg.role === "user" ? (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10">
                      <span className="text-sm">👤</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading && streamingContent ? (
              <div className="flex gap-3">
                <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-lg border bg-gradient-to-br shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                  <BarChart3 className="text-cyber-cyan h-5 w-5" />
                </div>
                <div className="bg-cyber-cyan/5 border-cyber-cyan/20 max-w-[80%] rounded-lg border px-4 py-3 text-sm leading-relaxed text-white/90 shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                  <MarkdownContent content={streamingContent} />
                  <span className="bg-cyber-cyan inline-block h-4 w-1 animate-pulse shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                  {streamingCharts.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      <div className="border-cyber-cyan/20 flex items-center gap-2 border-t pt-3">
                        <BarChart3 className="text-cyber-cyan h-4 w-4" />
                        <span className="text-cyber-cyan font-mono text-xs font-semibold tracking-wider uppercase">
                          Generated Charts ({streamingCharts.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {streamingCharts.map((chart, idx) => (
                          <div
                            key={idx}
                            className="border-cyber-cyan/30 overflow-hidden rounded-lg border-2 bg-black/60 p-3"
                          >
                            <img
                              src={chart.url}
                              alt={chart.title}
                              className="w-full rounded"
                              loading="lazy"
                            />
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="flex-1 truncate text-xs font-medium text-white/90">
                                {chart.title}
                              </span>
                              <a
                                href={chart.url}
                                download={`${chart.title}.png`}
                                className="border-cyber-cyan/30 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border text-xs transition-all"
                                title="下载图表"
                              >
                                ⬇
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : loading ? (
              <div className="flex gap-3">
                <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-lg border bg-gradient-to-br shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                  <BarChart3 className="text-cyber-cyan h-5 w-5" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="bg-cyber-cyan/5 border-cyber-cyan/20 text-cyber-cyan w-fit rounded-lg border px-4 py-3 text-sm leading-relaxed shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-3 w-3 items-center justify-center">
                        <div className="bg-cyber-cyan absolute h-3 w-3 animate-ping rounded-full opacity-75" />
                        <div className="bg-cyber-cyan relative h-2 w-2 rounded-full" />
                      </div>
                      <span className="animate-pulse font-mono whitespace-nowrap">
                        [ ANALYZING DATA ]
                      </span>
                    </div>
                  </div>

                  {/* 工具调用状态 */}
                  {streamingTools.length > 0 ? (
                    <div className="space-y-2">
                      {streamingTools.map((tool) => (
                        <ToolStatusIndicator key={tool.id} tool={tool} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error ? (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚠</span>
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {/* File Upload Area */}
      {files.length > 0 ? (
        <div className="mb-3 space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="border-cyber-cyan/20 bg-cyber-cyan/5 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-[0_0_10px_rgba(0,243,255,0.05)]"
            >
              <div className="border-cyber-cyan/30 bg-cyber-cyan/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border">
                <FileText className="text-cyber-cyan h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white">{file.name}</div>
                <div className="text-cyber-cyan/60 font-mono text-[10px]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-white/20 text-white/60 transition-all hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-400"
                aria-label="移除文件"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Input Area */}
      <div className="flex flex-col gap-3">
        <div className="border-cyber-cyan/20 flex items-end gap-3 rounded-lg border bg-black/40 p-3 shadow-[0_0_15px_rgba(0,243,255,0.05)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-cyber-cyan/30 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded border transition-all hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]"
            aria-label="上传文件"
            title="上传 Excel、CSV、图表、文档等"
          >
            <Upload className="text-cyber-cyan h-5 w-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入分析需求或上传文件...（Enter 发送，Shift+Enter 换行）"
            className="border-cyber-cyan/20 focus:ring-cyber-cyan/30 focus:border-cyber-cyan/40 min-h-[44px] flex-1 resize-none rounded border bg-black/60 px-4 py-3 font-mono text-xs text-white placeholder:text-white/30 focus:ring-2 focus:outline-none"
          />
          <button
            type="button"
            disabled={!loading && !prompt.trim() && files.length === 0}
            onClick={loading ? handleAbort : run}
            className={[
              "relative flex h-11 items-center gap-2 rounded px-5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all",
              loading
                ? "border border-red-500/30 bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-500/30"
                : !prompt.trim() && files.length === 0
                  ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/30"
                  : "bg-cyber-cyan border-cyber-cyan hover:bg-cyber-cyan/90 border text-black shadow-[0_0_20px_rgba(0,243,255,0.3)]",
            ].join(" ")}
          >
            {loading ? (
              <>
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute h-2 w-2 rounded-sm bg-red-400" />
                  <span className="absolute h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-red-400" />
                </span>
                Stop
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Analyze
              </>
            )}
          </button>
        </div>
        <div className="text-cyber-cyan/40 flex items-center gap-2 px-2 font-mono text-[9px] tracking-wider uppercase">
          <Zap className="h-3 w-3" />
          <span>
            支持：Excel (.xlsx, .xls) / CSV / 图表 (PNG, JPG) / 文档 (PDF, DOCX) / 最大 10MB
          </span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg,.pdf,.docx,.doc,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 登录提示模态框 */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="请先登录以使用数据分析功能"
      />

      {/* 积分不足模态框 */}
      {creditsInfo && (
        <InsufficientCreditsModal
          isOpen={showCreditsModal}
          onClose={() => setShowCreditsModal(false)}
          required={creditsInfo.required}
          current={creditsInfo.current}
          permanent={creditsInfo.permanent}
          daily={creditsInfo.daily}
        />
      )}
    </div>
  );
}
