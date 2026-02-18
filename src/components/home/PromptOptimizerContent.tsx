"use client";

import { useState, useRef, useEffect } from "react";
import { GlitchText, CyberButton, NeonBorder, HolographicCard } from "@/components/cyber";
import {
  Sparkles,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  Zap,
  MessageSquare,
  Search,
  FileEdit,
} from "lucide-react";

// 优化器步骤类型
type Step = "input" | "frameworks" | "dialogue" | "result";

// 框架候选
interface FrameworkCandidate {
  id: string;
  name: string;
  description: string;
  matchScore: number;
}

export function PromptOptimizerContent() {
  const [showWelcome, setShowWelcome] = useState(true);

  // 状态管理
  const [currentStep, setCurrentStep] = useState<Step>("input");
  const [userInput, setUserInput] = useState("");
  const [frameworks, setFrameworks] = useState<FrameworkCandidate[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>("");

  // 追问答案 (两个必填 + 三个可选)
  const [answers, setAnswers] = useState({
    goal: "", // 必填
    audience: "", // 必填
    format: "", // 可选
    constraints: "", // 可选
    extra: "", // 可选
  });

  const [showOptional, setShowOptional] = useState(false);
  const [result, setResult] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // 右侧输出区域引用 (用于自动滚动)
  const outputRef = useRef<HTMLDivElement>(null);

  // ========== 步骤 1: 分析需求 ==========
  const handleAnalyze = async () => {
    if (userInput.length < 10) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/prompt-optimizer/frameworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput }),
      });
      const data = await response.json();
      setFrameworks(data.frameworks);
      setCurrentStep("frameworks");
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 步骤 2: 选择框架 ==========
  const handleSelectFramework = (frameworkId: string) => {
    setSelectedFramework(frameworkId);
    setCurrentStep("dialogue");
  };

  // ========== 步骤 3: 生成提示词 ==========
  const handleGenerate = async () => {
    if (!answers.goal || !answers.audience) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/prompt-optimizer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: userInput,
          frameworkId: selectedFramework,
          clarificationAnswers: answers,
        }),
      });
      const data = await response.json();
      setResult(data.output);
      setEditedResult(data.output);
      setCurrentStep("result");
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 开始优化流程 ==========
  const handleStart = () => {
    setShowWelcome(false);
  };

  // ========== 重置流程 ==========
  const handleReset = () => {
    setCurrentStep("input");
    setUserInput("");
    setFrameworks([]);
    setSelectedFramework("");
    setAnswers({ goal: "", audience: "", format: "", constraints: "", extra: "" });
    setShowOptional(false);
    setResult("");
    setEditedResult("");
    setIsEditing(false);
  };

  // ========== 复制结果 ==========
  const handleCopy = () => {
    const textToCopy = isEditing ? editedResult : result;
    navigator.clipboard.writeText(textToCopy);

    // 显示复制成功提示
    setShowCopyToast(true);

    // 2秒后自动隐藏
    setTimeout(() => {
      setShowCopyToast(false);
    }, 2000);
  };

  // ========== 保存编辑 ==========
  const handleSaveEdit = () => {
    setResult(editedResult);
    setIsEditing(false);
  };

  // 自动滚动到最新步骤
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [currentStep, result]);

  return (
    <div className="h-full">
      {showWelcome ? (
        <WelcomeView onStart={handleStart} />
      ) : (
        <OptimizerView
          currentStep={currentStep}
          userInput={userInput}
          setUserInput={setUserInput}
          frameworks={frameworks}
          selectedFramework={selectedFramework}
          answers={answers}
          setAnswers={setAnswers}
          showOptional={showOptional}
          setShowOptional={setShowOptional}
          result={result}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editedResult={editedResult}
          setEditedResult={setEditedResult}
          isLoading={isLoading}
          showCopyToast={showCopyToast}
          outputRef={outputRef}
          handleAnalyze={handleAnalyze}
          handleSelectFramework={handleSelectFramework}
          handleGenerate={handleGenerate}
          handleReset={handleReset}
          handleCopy={handleCopy}
          handleSaveEdit={handleSaveEdit}
        />
      )}
    </div>
  );
}

// ========== 欢迎页组件 ==========
function WelcomeView({ onStart }: { onStart: () => void }) {
  const features = [
    {
      icon: Search,
      title: "智能匹配",
      desc: "自动分析需求，智能匹配最佳框架方案",
      color: "cyan",
    },
    {
      icon: MessageSquare,
      title: "深度对话",
      desc: "自然语言交互，精准捕捉真实意图",
      color: "magenta",
    },
    {
      icon: Zap,
      title: "一键优化",
      desc: "快速生成专业级提示词，输出立即可用",
      color: "purple",
    },
    {
      icon: FileEdit,
      title: "即时微调",
      desc: "边改边看，实时预览优化效果",
      color: "cyan",
    },
  ];

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
                  ◢ 提示词优化器 ◣
                </GlitchText>
                <p className="text-base text-white/60">
                  将您的想法转化为精确的提示词，覆盖商业、技术、创作等各大行业场景
                </p>
              </div>

              {/* 功能卡片网格 - 2x2 */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature) => (
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

            {/* 右侧：流程 + 按钮 */}
            <div className="flex w-80 flex-shrink-0 flex-col items-center justify-center">
              {/* 流程示意 */}
              <div className="mb-8 w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex-1 text-right font-mono text-white/40">输入需求</span>
                  <span className="text-cyber-cyan">→</span>
                  <span className="flex-1 font-mono text-white/40">选择框架</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex-1 text-right font-mono text-white/40">补充信息</span>
                  <span className="text-cyber-cyan">→</span>
                  <span className="flex-1 font-mono text-white/40">生成结果</span>
                </div>
              </div>

              {/* 开始按钮 */}
              <CyberButton
                variant="primary"
                size="lg"
                glowColor="cyan"
                onClick={onStart}
                className="w-full animate-pulse"
              >
                <Sparkles className="mr-2 h-5 w-5" />
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

// ========== 优化器视图组件 ==========
interface OptimizerViewProps {
  currentStep: Step;
  userInput: string;
  setUserInput: (v: string) => void;
  frameworks: FrameworkCandidate[];
  selectedFramework: string;
  answers: {
    goal: string;
    audience: string;
    format: string;
    constraints: string;
    extra: string;
  };
  setAnswers: (v: {
    goal: string;
    audience: string;
    format: string;
    constraints: string;
    extra: string;
  }) => void;
  showOptional: boolean;
  setShowOptional: (v: boolean) => void;
  result: string;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  editedResult: string;
  setEditedResult: (v: string) => void;
  isLoading: boolean;
  showCopyToast: boolean;
  outputRef: React.RefObject<HTMLDivElement | null>;
  handleAnalyze: () => void;
  handleSelectFramework: (id: string) => void;
  handleGenerate: () => void;
  handleReset: () => void;
  handleCopy: () => void;
  handleSaveEdit: () => void;
}

function OptimizerView({
  currentStep,
  userInput,
  setUserInput,
  frameworks,
  selectedFramework,
  answers,
  setAnswers,
  showOptional,
  setShowOptional,
  result,
  isEditing,
  setIsEditing,
  editedResult,
  setEditedResult,
  isLoading,
  showCopyToast,
  outputRef,
  handleAnalyze,
  handleSelectFramework,
  handleGenerate,
  handleReset,
  handleCopy,
  handleSaveEdit,
}: OptimizerViewProps) {
  return (
    <div className="flex h-full">
      {/* ========== 左侧：问答区域 ========== */}
      <div className="bg-cyber-dark/30 h-full w-1/2 overflow-y-auto border-r border-white/10 p-6">
        <div className="space-y-6">
          {/* 步骤 1: 输入一句话需求 */}
          <StepSection
            stepNumber="01"
            title="输入一句话需求"
            isActive={currentStep === "input"}
            isCompleted={currentStep !== "input"}
          >
            <p className="mb-3 text-xs text-white/50">简单、自然地描述你想要的 Prompt</p>
            <div className="relative">
              <span className="text-cyber-cyan absolute top-4 left-4 animate-pulse">&gt;</span>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="例如：帮我写一个关于产品营销的提示词"
                disabled={currentStep !== "input"}
                className="border-cyber-cyan/30 focus:border-cyber-cyan h-28 w-full resize-none rounded-lg border bg-black/50 py-3 pr-4 pl-10 font-mono text-sm text-white placeholder-white/30 transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {currentStep === "input" && (
              <div className="mt-4 flex justify-end">
                <CyberButton
                  variant="primary"
                  size="sm"
                  glowColor="cyan"
                  onClick={handleAnalyze}
                  disabled={isLoading || userInput.length < 10}
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  开始分析
                </CyberButton>
              </div>
            )}
          </StepSection>

          {/* 步骤 2: 选择框架 */}
          {(currentStep === "frameworks" ||
            currentStep === "dialogue" ||
            currentStep === "result") && (
            <StepSection
              stepNumber="02"
              title="选择框架"
              isActive={currentStep === "frameworks"}
              isCompleted={currentStep === "dialogue" || currentStep === "result"}
            >
              <div className="grid grid-cols-1 gap-3">
                {frameworks.map((fw) => (
                  <FrameworkCard
                    key={fw.id}
                    framework={fw}
                    isSelected={selectedFramework === fw.id}
                    onClick={() => handleSelectFramework(fw.id)}
                    disabled={currentStep !== "frameworks"}
                  />
                ))}
              </div>

              {selectedFramework && (
                <div className="text-cyber-cyan mt-3 font-mono text-xs">
                  [ 已选择: {selectedFramework} ]
                </div>
              )}
            </StepSection>
          )}

          {/* 步骤 3: 补充信息 */}
          {(currentStep === "dialogue" || currentStep === "result") && (
            <StepSection
              stepNumber="03"
              title="补充信息"
              isActive={currentStep === "dialogue"}
              isCompleted={currentStep === "result"}
            >
              <div className="space-y-4">
                {/* 必填项 */}
                <QuestionInput
                  number="①"
                  label="目标是什么？"
                  required
                  value={answers.goal}
                  onChange={(v) => setAnswers({ ...answers, goal: v })}
                  placeholder="例如：推广智能手表，提升销量"
                  disabled={currentStep !== "dialogue"}
                />

                <QuestionInput
                  number="②"
                  label="目标受众是谁？"
                  required
                  value={answers.audience}
                  onChange={(v) => setAnswers({ ...answers, audience: v })}
                  placeholder="例如：18-30岁科技爱好者"
                  disabled={currentStep !== "dialogue"}
                />

                {/* 可选项折叠区 */}
                <div className="border-t border-white/10 pt-4">
                  <button
                    onClick={() => setShowOptional(!showOptional)}
                    disabled={currentStep !== "dialogue"}
                    className="hover:text-cyber-cyan flex items-center gap-2 text-sm text-white/60 transition-colors disabled:opacity-50"
                  >
                    {showOptional ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    继续补充 (可选)
                  </button>

                  {showOptional && (
                    <div className="mt-4 animate-[fade-in_0.3s_ease-out] space-y-4">
                      <QuestionInput
                        number="③"
                        label="格式要求"
                        value={answers.format}
                        onChange={(v) => setAnswers({ ...answers, format: v })}
                        placeholder="例如：小红书风格，带 emoji"
                        disabled={currentStep !== "dialogue"}
                      />

                      <QuestionInput
                        number="④"
                        label="约束条件"
                        value={answers.constraints}
                        onChange={(v) => setAnswers({ ...answers, constraints: v })}
                        placeholder="例如：200字以内，禁用竞品名称"
                        disabled={currentStep !== "dialogue"}
                      />

                      <QuestionInput
                        number="⑤"
                        label="补充信息"
                        value={answers.extra}
                        onChange={(v) => setAnswers({ ...answers, extra: v })}
                        placeholder="任何有助于生成更好结果的信息"
                        disabled={currentStep !== "dialogue"}
                      />
                    </div>
                  )}
                </div>

                {/* 生成按钮 */}
                {currentStep === "dialogue" && (
                  <div className="flex gap-3 pt-4">
                    <CyberButton
                      variant="secondary"
                      size="sm"
                      glowColor="magenta"
                      onClick={handleGenerate}
                      disabled={isLoading || !answers.goal || !answers.audience}
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      开始生成
                    </CyberButton>
                  </div>
                )}
              </div>
            </StepSection>
          )}

          {/* 步骤 4: 完成提示 */}
          {currentStep === "result" && (
            <StepSection stepNumber="04" title="优化完成" isActive={false} isCompleted={true}>
              <div className="flex flex-wrap gap-3">
                <CyberButton variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新开始
                </CyberButton>
              </div>
            </StepSection>
          )}
        </div>
      </div>

      {/* ========== 右侧：输出区域 ========== */}
      <div ref={outputRef} className="h-full w-1/2 overflow-y-auto bg-black/20 p-6">
        <div className="flex h-full flex-col">
          {/* 标题 */}
          <div className="mb-4 flex items-center justify-between">
            <GlitchText as="h3" className="font-orbitron text-lg text-white">
              输出预览
            </GlitchText>
            {currentStep === "result" && (
              <span className="animate-pulse font-mono text-xs text-green-400">[ 生成完成 ]</span>
            )}
          </div>

          {/* 输出内容容器 */}
          <NeonBorder
            color="cyan"
            intensity={currentStep === "result" ? "high" : "low"}
            animated={currentStep === "result"}
          >
            <div className="flex min-h-[400px] flex-col bg-black/60">
              {/* 终端标题栏 */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500/50" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <span className="h-2 w-2 rounded-full bg-green-500/50" />
                <span className="ml-2 font-mono text-[10px] text-white/30">
                  {currentStep === "result" ? "optimized_prompt.md" : "waiting_for_input..."}
                </span>
              </div>

              {/* 内容区 */}
              <div className="flex-1 p-4">
                {currentStep === "input" && (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="mb-4 text-4xl">📋</div>
                      <p className="font-mono text-sm">在左侧输入需求开始</p>
                    </div>
                  </div>
                )}

                {currentStep === "frameworks" && (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="mb-4 animate-pulse text-4xl">🔍</div>
                      <p className="font-mono text-sm">AI 正在分析最佳框架...</p>
                    </div>
                  </div>
                )}

                {currentStep === "dialogue" && (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="mb-4 text-4xl">💭</div>
                      <p className="font-mono text-sm">填写补充信息后生成</p>
                      <div className="text-cyber-cyan mt-4 text-xs">
                        已选择框架: {selectedFramework}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === "result" && (
                  <>
                    {isEditing ? (
                      <textarea
                        value={editedResult}
                        onChange={(e) => setEditedResult(e.target.value)}
                        className="h-full min-h-[350px] w-full resize-none bg-transparent font-mono text-sm text-white/90 outline-none"
                      />
                    ) : (
                      <pre className="font-mono text-sm whitespace-pre-wrap text-white/90">
                        {result}
                      </pre>
                    )}
                  </>
                )}
              </div>

              {/* 底部操作栏 */}
              {currentStep === "result" && (
                <div className="relative flex items-center justify-between gap-2 border-t border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex gap-2">
                    <CyberButton variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="mr-1 h-4 w-4" />
                      复制
                    </CyberButton>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <CyberButton variant="primary" size="sm" onClick={handleSaveEdit}>
                        <Check className="mr-1 h-4 w-4" />
                        保存
                      </CyberButton>
                    ) : (
                      <CyberButton variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="mr-1 h-4 w-4" />
                        编辑
                      </CyberButton>
                    )}
                  </div>

                  {/* 复制成功提示 */}
                  {showCopyToast && (
                    <div className="bg-cyber-cyan/90 font-orbitron pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 animate-[fade-in_0.2s_ease-out] rounded-lg px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(0,243,255,0.5)]">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
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

// ========== 步骤区域容器 ==========
interface StepSectionProps {
  stepNumber: string;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}

function StepSection({ stepNumber, title, isActive, isCompleted, children }: StepSectionProps) {
  return (
    <div
      className={`rounded-lg border transition-all duration-300 ${
        isActive
          ? "border-cyber-cyan/50 bg-cyber-cyan/5"
          : isCompleted
            ? "border-green-500/30 bg-green-500/5"
            : "border-white/10 bg-white/5"
      }`}
    >
      <div className="p-4">
        {/* 步骤标题 */}
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`font-mono text-sm font-bold ${
              isActive ? "text-cyber-cyan" : isCompleted ? "text-green-400" : "text-white/40"
            }`}
          >
            {stepNumber}
          </span>
          <h4
            className={`font-orbitron ${
              isActive ? "text-white" : isCompleted ? "text-white/80" : "text-white/40"
            }`}
          >
            {title}
          </h4>
          {isCompleted && <span className="text-xs text-green-400">✓</span>}
        </div>

        {/* 内容 */}
        <div className={isActive ? "" : "opacity-70"}>{children}</div>
      </div>
    </div>
  );
}

// ========== 框架卡片 ==========
interface FrameworkCardProps {
  framework: FrameworkCandidate;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

function FrameworkCard({ framework, isSelected, onClick, disabled }: FrameworkCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg border p-3 text-left transition-all duration-300 ${
        isSelected
          ? "border-cyber-magenta bg-cyber-magenta/10 shadow-[0_0_15px_rgba(255,0,255,0.2)]"
          : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`font-orbitron font-bold ${isSelected ? "text-cyber-magenta" : "text-white"}`}
        >
          {framework.name}
        </span>
        <span className="text-cyber-cyan font-mono text-sm">{framework.matchScore}% 匹配</span>
      </div>

      {/* 匹配度条 */}
      <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="from-cyber-cyan to-cyber-magenta h-full bg-gradient-to-r transition-all duration-500"
          style={{ width: `${framework.matchScore}%` }}
        />
      </div>

      <p className="text-xs text-white/50">{framework.description}</p>
    </button>
  );
}

// ========== 问题输入框 ==========
interface QuestionInputProps {
  number: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
}

function QuestionInput({
  number,
  label,
  required,
  value,
  onChange,
  placeholder,
  disabled,
}: QuestionInputProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-cyber-cyan font-mono">{number}</span>
        <span className={required ? "text-white" : "text-white/70"}>{label}</span>
        {required && <span className="text-cyber-magenta text-xs">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="focus:border-cyber-cyan w-full border-b-2 border-white/20 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/20 transition-colors duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
