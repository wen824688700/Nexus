"use client";

import { useState, useRef, useCallback } from "react";
import { GlitchText, CyberButton, NeonBorder } from "@/components/cyber";
import { Sparkles, Copy, RefreshCw, Check, Film, Zap, Upload, X, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function SeedanceStoryboard() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [sessionId] = useState(() => `user_${Date.now()}`);
  
  // 图片上传相关
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const outputRef = useRef<HTMLDivElement>(null);

  // 开始使用
  const handleStart = () => {
    setShowWelcome(false);
  };

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 3; // 最多3张图片
    
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    // 检查文件数量
    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`最多只能上传 ${maxFiles} 张参考图片`);
      return;
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 验证文件类型
      if (!validTypes.includes(file.type)) {
        setError("请上传图片文件（支持 JPG、PNG、WEBP 格式）");
        continue;
      }
      
      // 验证文件大小
      if (file.size > maxSize) {
        setError("单个文件大小不能超过 10MB");
        continue;
      }
      
      newFiles.push(file);
      
      // 生成预览
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
          setUploadedFiles([...uploadedFiles, ...newFiles]);
          setPreviewUrls([...previewUrls, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    setError(null);
  }, [uploadedFiles, previewUrls]);

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
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // 点击上传
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  // 移除文件
  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  }, [uploadedFiles, previewUrls]);

  // 生成分镜脚本
  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult("");
    setStreamingContent("");

    try {
      // 构建 FormData（支持文件上传）
      const formData = new FormData();
      formData.append("query", prompt);
      formData.append("sessionId", sessionId);
      formData.append("file_count", uploadedFiles.length.toString());
      
      // 添加文件
      uploadedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch("/api/agents/seedance-storyboard/run", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);

            if (json.error) {
              setError(json.error);
              setLoading(false);
              return;
            }

            if (json.content) {
              fullContent += json.content;
              setStreamingContent(fullContent);
            }

            if (json.done) {
              setResult(fullContent);
              setStreamingContent("");
              setLoading(false);
            }
          } catch (e) {
            // 跳过解析错误
          }
        }
      }

      if (fullContent && !result) {
        setResult(fullContent);
        setStreamingContent("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setPrompt("");
    setResult("");
    setStreamingContent("");
    setError(null);
    setUploadedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 复制结果
  const handleCopy = () => {
    const textToCopy = result || streamingContent;
    navigator.clipboard.writeText(textToCopy);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  return (
    <div className="h-full">
      {showWelcome ? (
        <WelcomeView onStart={handleStart} />
      ) : (
        <GeneratorView
          prompt={prompt}
          setPrompt={setPrompt}
          loading={loading}
          error={error}
          result={result}
          streamingContent={streamingContent}
          showCopyToast={showCopyToast}
          outputRef={outputRef}
          uploadedFiles={uploadedFiles}
          previewUrls={previewUrls}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          handleGenerate={handleGenerate}
          handleReset={handleReset}
          handleCopy={handleCopy}
          handleUploadClick={handleUploadClick}
          handleFileInputChange={handleFileInputChange}
          handleRemoveFile={handleRemoveFile}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
        />
      )}
    </div>
  );
}

// 欢迎页
function WelcomeView({ onStart }: { onStart: () => void }) {
  const features = [
    {
      icon: Film,
      title: "专业分镜",
      desc: "基于即梦 Seedance 2.0 标准，生成专业级分镜脚本",
      color: "cyan",
    },
    {
      icon: Zap,
      title: "一句话生成",
      desc: "只需描述你的创意，AI 自动生成完整分镜方案",
      color: "magenta",
    },
    {
      icon: ImageIcon,
      title: "参考素材",
      desc: "支持上传武侠风图片、打斗场景等参考素材",
      color: "purple",
    },
    {
      icon: Copy,
      title: "快速复制",
      desc: "一键复制分镜脚本，无缝对接创作工具",
      color: "cyan",
    },
  ];

  return (
    <div className="h-full flex items-center justify-center p-6 overflow-y-auto">
      <NeonBorder color="gradient" intensity="high" animated className="max-w-6xl w-full">
        <div className="bg-cyber-dark/90 p-8">
          <div className="flex gap-8 items-center">
            {/* 左侧：标题 + 功能特性 */}
            <div className="flex-1">
              <div className="mb-6">
                <GlitchText
                  as="h2"
                  className="text-3xl font-orbitron font-bold text-white mb-3"
                  intensity="high"
                >
                  ◢ Seedance 2.0 分镜助手 ◣
                </GlitchText>
                <p className="text-white/60 text-base">
                  将你的创意转化为专业的即梦 Seedance 2.0 分镜脚本，让视频创作更高效
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyber-cyan/50 transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-${feature.color}-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-4 h-4 text-cyber-${feature.color}`} />
                    </div>
                    <h3 className="font-orbitron text-white font-bold text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧：示例 + 按钮 */}
            <div className="flex-shrink-0 w-80 flex flex-col items-center justify-center">
              <div className="mb-8 w-full">
                <div className="text-xs text-white/40 font-mono mb-3 text-center">示例输入</div>
                <div className="bg-black/40 border border-cyber-cyan/30 rounded-lg p-4 mb-4">
                  <p className="text-white/70 text-sm font-mono">
                    &quot;我想做一个海边日落的视频，镜头从远处慢慢推进，最后定格在夕阳下的剪影&quot;
                  </p>
                </div>
                <div className="text-xs text-white/40 font-mono text-center">
                  ↓ AI 生成专业分镜脚本 ↓
                </div>
              </div>

              <CyberButton
                variant="primary"
                size="lg"
                glowColor="cyan"
                onClick={onStart}
                className="animate-pulse w-full"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                立即开始
                <span className="ml-2">&gt;&gt;</span>
              </CyberButton>
            </div>
          </div>
        </div>
      </NeonBorder>
    </div>
  );
}

// 生成器视图
interface GeneratorViewProps {
  prompt: string;
  setPrompt: (v: string) => void;
  loading: boolean;
  error: string | null;
  result: string;
  streamingContent: string;
  showCopyToast: boolean;
  outputRef: React.RefObject<HTMLDivElement | null>;
  uploadedFiles: File[];
  previewUrls: string[];
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleGenerate: () => void;
  handleReset: () => void;
  handleCopy: () => void;
  handleUploadClick: () => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

function GeneratorView({
  prompt,
  setPrompt,
  loading,
  error,
  result,
  streamingContent,
  showCopyToast,
  outputRef,
  uploadedFiles,
  previewUrls,
  isDragging,
  fileInputRef,
  handleGenerate,
  handleReset,
  handleCopy,
  handleUploadClick,
  handleFileInputChange,
  handleRemoveFile,
  handleDragOver,
  handleDragLeave,
  handleDrop,
}: GeneratorViewProps) {
  const hasContent = result || streamingContent;

  return (
    <div className="flex h-full">
      {/* 左侧：输入区域 */}
      <div className="w-1/2 h-full overflow-y-auto border-r border-white/10 bg-cyber-dark/30 p-6">
        <div className="space-y-6">
          {/* 输入框 */}
          <div className="rounded-lg border border-cyber-cyan/50 bg-cyber-cyan/5 p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm font-bold text-cyber-cyan">01</span>
              <h4 className="font-orbitron text-white">描述你的视频创意</h4>
            </div>

            <p className="text-xs text-white/50 mb-3">
              用一句话描述你想要的视频内容、镜头运动、场景氛围等
            </p>

            <div className="relative">
              <span className="absolute left-4 top-4 text-cyber-cyan animate-pulse">&gt;</span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：海边日落，镜头从远处推进到夕阳剪影..."
                disabled={loading}
                className="w-full h-32 bg-black/50 border border-cyber-cyan/30 rounded-lg 
                         pl-10 pr-4 py-3 text-white text-sm placeholder-white/30
                         focus:border-cyber-cyan focus:shadow-[0_0_15px_rgba(0,243,255,0.2)]
                         transition-all duration-300 font-mono resize-none
                         disabled:opacity-50 disabled:cursor-not-allowed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleGenerate();
                  }
                }}
              />
            </div>

            <div className="mt-4 flex gap-3">
              <CyberButton
                variant="primary"
                size="sm"
                glowColor="cyan"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Film className="w-4 h-4 mr-2" />
                )}
                {loading ? "生成中..." : "生成分镜"}
              </CyberButton>

              {hasContent && (
                <CyberButton
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新开始
                </CyberButton>
              )}
            </div>

            <div className="mt-3 text-xs text-white/40 font-mono">
              提示：Ctrl + Enter 快速生成
            </div>
          </div>

          {/* 图片上传区域 */}
          <div className="rounded-lg border border-cyber-magenta/50 bg-cyber-magenta/5 p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm font-bold text-cyber-magenta">02</span>
              <h4 className="font-orbitron text-white">上传参考图片（可选）</h4>
            </div>

            <p className="text-xs text-white/50 mb-3">
              上传武侠风图片、打斗场景、侠客造型等参考素材（最多3张）
            </p>

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* 拖拽上传区域 */}
            {uploadedFiles.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-cyber-magenta bg-cyber-magenta/10"
                    : "border-white/20 hover:border-cyber-magenta/50 hover:bg-white/5"
                }`}
              >
                <Upload className="w-8 h-8 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-1">
                  点击上传或拖拽图片到此处
                </p>
                <p className="text-white/40 text-xs">
                  支持 JPG、PNG、WEBP 格式，单个文件不超过 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 已上传的图片预览 */}
                <div className="grid grid-cols-3 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-cyber-magenta/30">
                        <img
                          src={url}
                          alt={`参考图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white 
                                 flex items-center justify-center opacity-0 group-hover:opacity-100 
                                 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-xs text-white/80 truncate">
                          {uploadedFiles[index].name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 继续添加按钮 */}
                {uploadedFiles.length < 3 && (
                  <button
                    onClick={handleUploadClick}
                    className="w-full py-2 border border-dashed border-cyber-magenta/30 rounded-lg
                             text-cyber-magenta text-sm hover:bg-cyber-magenta/5 transition-colors
                             flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    继续添加图片（{uploadedFiles.length}/3）
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠</span>
                <div>
                  <h4 className="text-red-400 font-bold mb-1">生成失败</h4>
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          {!hasContent && !loading && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h4 className="font-orbitron text-white mb-3 text-sm">💡 使用技巧</h4>
              <ul className="space-y-2 text-xs text-white/60">
                <li className="flex items-start gap-2">
                  <span className="text-cyber-cyan">•</span>
                  <span>描述场景：海边、森林、城市等</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-cyan">•</span>
                  <span>说明镜头：推进、拉远、跟随、俯拍等</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-cyan">•</span>
                  <span>表达氛围：温馨、紧张、梦幻、史诗等</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-cyan">•</span>
                  <span>越详细越好，但保持简洁清晰</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 右侧：输出区域 */}
      <div 
        ref={outputRef}
        className="w-1/2 h-full overflow-y-auto bg-black/20 p-6"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <GlitchText as="h3" className="text-lg font-orbitron text-white">
              分镜脚本
            </GlitchText>
            {hasContent && (
              <span className="text-xs text-green-400 font-mono animate-pulse">
                [ 生成完成 ]
              </span>
            )}
          </div>

          <NeonBorder 
            color="cyan" 
            intensity={hasContent ? "high" : "low"} 
            animated={!!hasContent}
          >
            <div className="bg-black/60 min-h-[500px] flex flex-col">
              {/* 终端标题栏 */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="w-2 h-2 rounded-full bg-red-500/50" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <span className="w-2 h-2 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[10px] text-white/30 font-mono">
                  {hasContent ? "seedance_storyboard.md" : "waiting_for_input..."}
                </span>
              </div>

              {/* 内容区 */}
              <div className="flex-1 p-6 overflow-y-auto">
                {!hasContent && !loading && (
                  <div className="h-full flex items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎬</div>
                      <p className="font-mono text-sm">在左侧输入创意开始生成</p>
                    </div>
                  </div>
                )}

                {loading && !streamingContent && (
                  <div className="h-full flex items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="text-4xl mb-4 animate-pulse">✨</div>
                      <p className="font-mono text-sm">AI 正在生成分镜脚本...</p>
                    </div>
                  </div>
                )}

                {(streamingContent || result) && (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingContent || result}
                    </ReactMarkdown>
                    {loading && streamingContent && (
                      <span className="inline-block w-2 h-4 bg-cyber-cyan animate-pulse ml-1" />
                    )}
                  </div>
                )}
              </div>

              {/* 底部操作栏 */}
              {hasContent && (
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-white/10 bg-white/5 relative">
                  <div className="text-xs text-white/40 font-mono">
                    {result.length || streamingContent.length} 字符
                  </div>
                  <CyberButton 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopy}
                    disabled={loading}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    复制脚本
                  </CyberButton>

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
