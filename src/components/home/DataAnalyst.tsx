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
    <h1 className="mb-4 text-lg font-orbitron font-bold text-cyber-cyan border-l-4 border-cyber-cyan pl-3 shadow-[0_0_10px_rgba(0,243,255,0.3)]" {...props} />
  ),
  h2: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-5 mb-3 text-base font-orbitron font-semibold text-white" {...props} />
  ),
  h3: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-4 mb-2 text-sm font-orbitron font-medium text-white/90" {...props} />
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
    <li className="text-sm text-white/70 flex items-start gap-2 before:content-['▸'] before:text-cyber-cyan before:flex-shrink-0 before:mt-0.5" {...props} />
  ),
  strong: ({ ...props }: HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-cyber-cyan" {...props} />
  ),
  em: ({ ...props }: HTMLAttributes<HTMLElement>) => (
    <em className="text-white/80 italic" {...props} />
  ),
  code: ({ className, children, ...props }: HTMLAttributes<HTMLElement>) => {
    const isInline = !className?.includes("language-");
    return isInline ? (
      <code
        className="rounded bg-cyber-cyan/10 px-1.5 py-0.5 font-mono text-xs text-cyber-cyan border border-cyber-cyan/30"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code
        className="block overflow-x-auto rounded-lg border border-cyber-cyan/30 bg-black/60 p-4 font-mono text-xs text-white/80 shadow-inner"
        {...props}
      >
        {children}
      </code>
    );
  },
  img: ({ ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      className="mt-4 w-full rounded-lg border-2 border-cyber-cyan/30 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
      loading="lazy"
      {...props}
    />
  ),
  a: ({ ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-cyber-cyan underline decoration-cyber-cyan/40 underline-offset-2 hover:decoration-cyber-cyan transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: ({ ...props }: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-2 border-cyber-cyan/60 pl-3 text-sm italic text-white/70 bg-cyber-cyan/5 py-2 rounded-r"
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
  const icon = tool.name === "create_chart" ? <BarChart3 className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />;

  return (
    <div
      className={[
        "group flex items-center gap-3 rounded-lg border px-4 py-2.5 text-xs transition-all relative overflow-hidden",
        isRunning
          ? "animate-slideIn border-cyber-cyan/40 bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
          : "border-white/10 bg-white/5 opacity-70",
      ].join(" ")}
    >
      {/* Scan line effect for running tools */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent animate-[scan-line_2s_linear_infinite]" />
        </div>
      )}
      
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center relative z-10">
        {isRunning ? (
          <div className="relative flex h-3 w-3 items-center justify-center">
            <div className="absolute h-3 w-3 animate-ping rounded-full bg-cyber-cyan opacity-75" />
            <div className="relative h-2 w-2 rounded-full bg-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
          </div>
        ) : (
          <div className="text-green-400 text-sm">✓</div>
        )}
      </div>
      <div className="text-cyber-cyan/80 flex-shrink-0">{icon}</div>
      <span className="font-mono flex-1 truncate text-white/80">{tool.description}</span>
      {isRunning && (
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-cyber-cyan animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-cyber-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-1 rounded-full bg-cyber-cyan animate-pulse" style={{ animationDelay: '0.4s' }} />
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
      <div className="mb-4 flex items-center justify-between border-b border-cyber-cyan/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-cyber-cyan/10 border border-cyber-cyan/30">
            <BarChart3 className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div>
            <div className="font-mono text-xs tracking-[0.2em] text-cyber-cyan uppercase">
              Data Analytics
            </div>
            <div className="font-mono text-[10px] text-white/40">
              v2.1.0 | Neural Engine
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
          <span className="text-[10px] font-mono tracking-widest text-cyber-cyan/80 uppercase">
            Online
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="relative mb-4 flex-1 overflow-y-auto rounded-2xl border border-cyber-cyan/20 bg-black/40 p-4 backdrop-blur-sm">
        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent animate-[scan-line_4s_linear_infinite]" />
        </div>
        {messages.length === 0 && !loading ? (
          <div className="flex h-full flex-col items-start justify-start gap-5 p-6 relative z-10">
            <div className="flex gap-4 w-full">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                <BarChart3 className="w-6 h-6 text-cyber-cyan" />
              </div>
              <div className="flex-1">
                <div className="mb-3 text-sm font-orbitron font-bold text-cyber-cyan tracking-wide">
                  {WELCOME.greeting}
                </div>
                <p className="mb-2 text-sm leading-relaxed text-white/70">
                  {WELCOME.description}
                </p>
                <p className="text-xs text-white/50 font-mono">{WELCOME.cta}</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <div className="text-xs font-mono text-cyber-cyan/60 uppercase tracking-wider mb-1">
                ▸ Quick Actions
              </div>
              <div className="flex flex-wrap gap-2">
                {WELCOME.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 px-4 py-3 text-xs text-white/80 transition-all hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] group"
                  >
                    <span className="font-mono group-hover:text-cyber-cyan transition-colors whitespace-nowrap">
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
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                      <BarChart3 className="w-5 h-5 text-cyber-cyan" />
                    </div>
                  ) : null}
                  <div
                    className={[
                      "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed relative",
                      msg.role === "user"
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-cyber-cyan/5 text-white/90 border border-cyber-cyan/20 shadow-[0_0_10px_rgba(0,243,255,0.05)]",
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
                            className="flex items-center gap-2 rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 px-3 py-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-cyber-cyan flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-xs font-semibold text-white">{file.name}</div>
                              <div className="font-mono text-[10px] text-cyber-cyan/60">
                                {(file.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {msg.charts && msg.charts.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 border-t border-cyber-cyan/20 pt-3">
                          <BarChart3 className="w-4 h-4 text-cyber-cyan" />
                          <span className="text-xs font-mono font-semibold text-cyber-cyan uppercase tracking-wider">
                            Generated Charts ({msg.charts.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {msg.charts.map((chart, idx) => (
                            <div
                              key={idx}
                              className="group relative overflow-hidden rounded-lg border-2 border-cyber-cyan/30 bg-black/60 p-3 transition-all hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]"
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
                                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-cyber-cyan/30 bg-cyber-cyan/10 text-xs transition-all hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 hover:shadow-[0_0_10px_rgba(0,243,255,0.3)]"
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
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/20">
                      <span className="text-sm">👤</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading && streamingContent ? (
              <div className="flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)] animate-pulse">
                  <BarChart3 className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div className="max-w-[80%] rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 px-4 py-3 text-sm leading-relaxed text-white/90 shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                  <MarkdownContent content={streamingContent} />
                  <span className="inline-block h-4 w-1 animate-pulse bg-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                  {streamingCharts.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 border-t border-cyber-cyan/20 pt-3">
                        <BarChart3 className="w-4 h-4 text-cyber-cyan" />
                        <span className="text-xs font-mono font-semibold text-cyber-cyan uppercase tracking-wider">
                          Generated Charts ({streamingCharts.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {streamingCharts.map((chart, idx) => (
                          <div
                            key={idx}
                            className="overflow-hidden rounded-lg border-2 border-cyber-cyan/30 bg-black/60 p-3"
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
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-cyber-cyan/30 bg-cyber-cyan/10 text-xs transition-all hover:bg-cyber-cyan/20"
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
                <div className="flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                  <BarChart3 className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="w-fit rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 px-4 py-3 text-sm leading-relaxed text-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-3 w-3 items-center justify-center">
                        <div className="absolute h-3 w-3 animate-ping rounded-full bg-cyber-cyan opacity-75" />
                        <div className="relative h-2 w-2 rounded-full bg-cyber-cyan" />
                      </div>
                      <span className="font-mono animate-pulse whitespace-nowrap">[ ANALYZING DATA ]</span>
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
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200 font-mono shadow-[0_0_15px_rgba(239,68,68,0.1)]">
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
              className="flex items-center gap-3 rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 px-4 py-3 shadow-[0_0_10px_rgba(0,243,255,0.05)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border border-cyber-cyan/30 bg-cyber-cyan/10">
                <FileText className="w-5 h-5 text-cyber-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs font-semibold text-white">{file.name}</div>
                <div className="font-mono text-[10px] text-cyber-cyan/60">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-white/20 text-white/60 transition-all hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                aria-label="移除文件"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Input Area */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-3 rounded-lg border border-cyber-cyan/20 bg-black/40 p-3 backdrop-blur-sm shadow-[0_0_15px_rgba(0,243,255,0.05)]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded border border-cyber-cyan/30 bg-cyber-cyan/10 transition-all hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]"
            aria-label="上传文件"
            title="上传 Excel、CSV、图表、文档等"
          >
            <Upload className="w-5 h-5 text-cyber-cyan" />
          </button>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入分析需求或上传文件...（Enter 发送，Shift+Enter 换行）"
            className="min-h-[44px] flex-1 resize-none rounded border border-cyber-cyan/20 bg-black/60 px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 focus:border-cyber-cyan/40 font-mono"
          />
          <button
            type="button"
            disabled={!loading && !prompt.trim() && files.length === 0}
            onClick={loading ? handleAbort : run}
            className={[
              "relative h-11 rounded px-5 text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2",
              loading
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                : !prompt.trim() && files.length === 0
                  ? "cursor-not-allowed bg-white/5 text-white/30 border border-white/10"
                  : "bg-cyber-cyan text-black border border-cyber-cyan hover:bg-cyber-cyan/90 shadow-[0_0_20px_rgba(0,243,255,0.3)]",
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
                <Send className="w-3.5 h-3.5" />
                Analyze
              </>
            )}
          </button>
        </div>
        <div className="font-mono px-2 text-[9px] tracking-wider text-cyber-cyan/40 uppercase flex items-center gap-2">
          <Zap className="w-3 h-3" />
          <span>支持：Excel (.xlsx, .xls) / CSV / 图表 (PNG, JPG) / 文档 (PDF, DOCX) / 最大 10MB</span>
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
    </div>
  );
}
