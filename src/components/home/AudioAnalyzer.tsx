"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Music, Loader2, AlertCircle, CheckCircle2, Copy, Check, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { NeonBorder, CyberButton, GlitchText } from "@/components/cyber";

type ToolCall = {
  id: string;
  name: string;
  status: "running" | "complete";
  description: string;
};

type AudioAnalyzerProps = {
  agentKey: string;
};

export function AudioAnalyzer({ agentKey }: AudioAnalyzerProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId] = useState(() => `user_${Date.now()}`);
  
  // 分析结果和工具调用状态
  const [analysisResult, setAnalysisResult] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // 复制结果
  const handleCopy = useCallback(() => {
    const textToCopy = analysisResult || streamingContent;
    navigator.clipboard.writeText(textToCopy);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  }, [analysisResult, streamingContent]);

  // 重新开始
  const handleReset = useCallback(() => {
    setPrompt("");
    setUploadedFile(null);
    setAnalysisResult("");
    setStreamingContent("");
    setToolCalls([]);
    setError(null);
    setHasAnalyzed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    // 验证文件类型
    const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/flac"];
    const validExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".flac"];
    
    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType && !isValidExtension) {
      setError("请上传音频文件（支持 MP3、WAV、OGG、M4A、FLAC 格式）");
      return;
    }

    // 验证文件大小（限制 50MB）
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("文件大小不能超过 50MB");
      return;
    }

    setUploadedFile(file);
    setError(null);
  }, []);

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // 点击上传
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // 移除文件
  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 发送消息
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      setError("请先上传音频文件");
      return;
    }

    setLoading(true);
    setError(null);
    setStreamingContent("");
    setToolCalls([]);
    setAnalysisResult("");
    setHasAnalyzed(true);

    try {
      // 构建 FormData
      const formData = new FormData();
      formData.append("query", prompt.trim() || "请分析这个音频的风格特征，生成可用于 AI 音乐生成的提示词");
      formData.append("session_id", sessionId);
      formData.append("file_count", "1");
      formData.append("file_0", uploadedFile);

      // 调用 API
      const response = await fetch(`/api/agents/${agentKey}/run`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "请求失败" } }));
        throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;
          
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);

            // 处理工具调用开始
            if (json.type === "tool_start") {
              const toolId = `tool_${Date.now()}_${Math.random()}`;
              const toolName = json.tool || "音频分析";
              setToolCalls(prev => [...prev, {
                id: toolId,
                name: toolName,
                status: "running",
                description: getToolDescription(toolName)
              }]);
              scrollToBottom();
            }

            // 处理工具调用完成
            if (json.type === "tool_complete") {
              const toolName = json.tool || "音频分析";
              setToolCalls(prev => {
                // 找到最后一个 running 状态的工具并标记为完成
                const lastRunningIndex = prev.findIndex(t => t.status === "running");
                if (lastRunningIndex !== -1) {
                  const updated = [...prev];
                  updated[lastRunningIndex] = { ...updated[lastRunningIndex], status: "complete" };
                  return updated;
                }
                return prev;
              });
              scrollToBottom();
            }

            // 处理内容
            if (json.content && !json.done) {
              fullContent += json.content;
              setStreamingContent(fullContent);
              scrollToBottom();
            }

            // 处理完成
            if (json.done) {
              const finalContent = json.fullAnswer || fullContent;
              setAnalysisResult(finalContent);
              setStreamingContent("");
            }

            // 处理错误
            if (json.error) {
              throw new Error(json.error.message || "分析失败");
            }
          } catch (parseErr) {
            console.error("解析 SSE 数据失败:", parseErr);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "未知错误";
      setError(message);
      console.error("[Audio Analyzer Error]", err);
    } finally {
      setLoading(false);
    }
  }, [uploadedFile, prompt, sessionId, agentKey, scrollToBottom]);

  // 获取工具描述
  function getToolDescription(toolName: string): string {
    const descriptions: Record<string, string> = {
      "音频分析": "正在分析音频的频谱、节奏、音色特征...",
      "风格识别": "正在识别音乐流派和风格特征...",
      "特征提取": "正在提取音频的专业特征参数...",
      "提示词生成": "正在生成 AI 音乐提示词...",
    };
    return descriptions[toolName] || `正在执行 ${toolName}...`;
  }

  return (
    <div className="flex h-full">
      {/* ========== 左侧：上传和输入区域 ========== */}
      <div className="w-1/2 h-full overflow-y-auto border-r border-white/10 bg-cyber-dark/30 p-6">
        <div className="space-y-6">
          {/* 标题 */}
          <div>
            <GlitchText as="h3" className="text-2xl font-orbitron font-bold text-white mb-2">
              音频风格分析
            </GlitchText>
            <p className="text-sm text-white/60">
              上传音频文件，AI 将智能识别音乐风格、节奏、情绪等特征，生成专业的音频分析报告和 AI 音乐提示词
            </p>
          </div>

          {/* 功能特性 */}
          {!hasAnalyzed && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="mb-2 text-2xl">🎼</div>
                <div className="font-mono text-xs font-bold text-purple-400">10 维度分析</div>
                <div className="mt-1 text-[10px] text-white/50">流派、节奏、音色、情感</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="mb-2 text-2xl">✍️</div>
                <div className="font-mono text-xs font-bold text-purple-400">AI 提示词</div>
                <div className="mt-1 text-[10px] text-white/50">可直接用于音乐生成</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="mb-2 text-2xl">🌍</div>
                <div className="font-mono text-xs font-bold text-purple-400">双语输出</div>
                <div className="mt-1 text-[10px] text-white/50">英文提示 + 中文解析</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="mb-2 text-2xl">📋</div>
                <div className="font-mono text-xs font-bold text-purple-400">一键复制</div>
                <div className="mt-1 text-[10px] text-white/50">Markdown 格式输出</div>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 文件上传区域 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <span className="text-cyber-cyan font-mono">①</span>
              <span>上传音频文件</span>
              <span className="text-cyber-magenta text-xs">*</span>
            </label>
            
            {!uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={[
                  "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all",
                  isDragging
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/10"
                ].join(" ")}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Upload className="mx-auto mb-3 h-10 w-10 text-purple-400" />
                <p className="mb-1 font-mono text-sm font-bold text-white">
                  点击或拖拽上传音频文件
                </p>
                <p className="text-xs text-white/50">
                  支持 MP3、WAV、OGG、M4A、FLAC 格式，最大 50MB
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/20">
                  <Music className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="truncate font-mono text-sm font-bold text-white">
                      {uploadedFile.name}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={loading}
                  className="flex-shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  移除
                </button>
              </div>
            )}
          </div>

          {/* 分析要求输入 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <span className="text-cyber-cyan font-mono">②</span>
              <span>分析要求（可选）</span>
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：重点分析节奏和情绪特征..."
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-purple-500/50 focus:bg-white/10 disabled:opacity-50"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {!hasAnalyzed ? (
              <CyberButton
                variant="primary"
                size="lg"
                glowColor="cyan"
                onClick={handleSubmit}
                disabled={loading || !uploadedFile}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    分析中
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    开始分析
                  </>
                )}
              </CyberButton>
            ) : (
              <>
                <CyberButton
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1"
                >
                  重新开始
                </CyberButton>
                {!loading && analysisResult && (
                  <CyberButton
                    variant="primary"
                    size="lg"
                    glowColor="cyan"
                    onClick={handleCopy}
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    复制结果
                  </CyberButton>
                )}
              </>
            )}
          </div>

          {/* 工具调用状态 */}
          {toolCalls.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-white/60 font-mono">分析进度：</div>
              {toolCalls.map((tool) => (
                <div
                  key={tool.id}
                  className={[
                    "flex items-center gap-3 rounded-lg border p-3 transition-all",
                    tool.status === "running"
                      ? "border-cyber-cyan/30 bg-cyber-cyan/5"
                      : "border-green-500/30 bg-green-500/5"
                  ].join(" ")}
                >
                  <div className="flex-shrink-0">
                    {tool.status === "running" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-cyber-cyan" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-xs font-bold text-white">
                      {tool.name}
                    </div>
                    <div className="text-[10px] text-white/50">
                      {tool.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== 右侧：输出预览区域 ========== */}
      <div className="w-1/2 h-full overflow-y-auto bg-black/20 p-6">
        <div className="h-full flex flex-col">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-4">
            <GlitchText as="h3" className="text-lg font-orbitron text-white">
              分析报告
            </GlitchText>
            {analysisResult && (
              <span className="text-xs text-green-400 font-mono animate-pulse">
                [ 分析完成 ]
              </span>
            )}
          </div>

          {/* 输出容器 */}
          <NeonBorder 
            color="cyan" 
            intensity={analysisResult ? "high" : "low"} 
            animated={!!analysisResult}
            className="flex-1"
          >
            <div className="bg-black/60 h-full flex flex-col">
              {/* 终端标题栏 */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="w-2 h-2 rounded-full bg-red-500/50" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <span className="w-2 h-2 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[10px] text-white/30 font-mono">
                  {analysisResult || streamingContent ? "audio_analysis.md" : "waiting_for_upload..."}
                </span>
              </div>

              {/* 内容区 */}
              <div 
                ref={outputRef}
                className="flex-1 p-4 overflow-y-auto"
              >
                {!hasAnalyzed ? (
                  <div className="h-full flex items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎵</div>
                      <p className="font-mono text-sm">上传音频文件开始分析</p>
                    </div>
                  </div>
                ) : loading && !streamingContent ? (
                  <div className="h-full flex items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="text-4xl mb-4 animate-pulse">🎼</div>
                      <p className="font-mono text-sm">正在上传和分析音频...</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {analysisResult || streamingContent}
                    </ReactMarkdown>
                    {loading && streamingContent && (
                      <span className="inline-block h-4 w-1 animate-pulse bg-cyber-cyan ml-1" />
                    )}
                  </div>
                )}
              </div>

              {/* 底部操作栏 */}
              {(analysisResult || streamingContent) && (
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-white/10 bg-white/5 relative">
                  <div className="text-[10px] text-white/40 font-mono">
                    {analysisResult 
                      ? `${analysisResult.length} 字符` 
                      : `生成中... ${streamingContent.length} 字符`}
                  </div>
                  <div className="flex gap-2">
                    {!loading && analysisResult && (
                      <CyberButton variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-1" />
                        复制
                      </CyberButton>
                    )}
                  </div>
                  
                  {/* 复制成功提示 */}
                  {showCopyToast && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                                  bg-cyber-cyan/90 text-black px-4 py-2 rounded-lg 
                                  font-orbitron text-sm font-bold
                                  shadow-[0_0_20px_rgba(0,243,255,0.5)]
                                  animate-[fade-in_0.2s_ease-out]
                                  pointer-events-none z-50">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>已复制到剪贴板</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </NeonBorder>
        </div>
      </div>
    </div>
  );
}
