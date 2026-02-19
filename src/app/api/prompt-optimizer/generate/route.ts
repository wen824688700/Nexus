import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { CreditManager } from "@/lib/credits/manager";
import { getAgentPrice } from "@/lib/credits/pricing";

// 读取框架详细信息
async function loadFrameworkDetails(frameworkId: string): Promise<string> {
  try {
    const frameworksDir = path.join(process.cwd(), "public", "prompt-optimizer", "frameworks");

    const files = await fs.readdir(frameworksDir);

    // 标准化框架ID：移除 "Framework" 后缀，替换空格为下划线
    const searchPattern = frameworkId
      .replace(/\s*Framework\s*$/i, "")
      .trim()
      .replace(/\s+/g, "_");

    // 查找匹配的文件：XX_{searchPattern}_Framework.md
    const matchingFile = files.find((file) => {
      const fileName = file.toLowerCase();
      const pattern = searchPattern.toLowerCase();

      return (
        fileName.includes(`_${pattern}_framework.md`) ||
        fileName.includes(`_${pattern.replace(/_/g, "")}_framework.md`)
      );
    });

    if (!matchingFile) {
      console.error("❌ 未找到匹配的框架文件");

      // 返回基本框架文档作为后备
      return `# ${frameworkId} Framework

## 概述
这是 ${frameworkId} 框架的基本说明。

## 应用场景
适用于各种提示词优化场景。

## 框架构成
请根据用户需求和框架特点生成优化后的提示词。`;
    }

    const filePath = path.join(frameworksDir, matchingFile);
    const content = await fs.readFile(filePath, "utf-8");

    return content;
  } catch (error) {
    console.error("❌ 加载框架详细信息失败:", error);

    // 返回基本框架文档作为后备
    return `# ${frameworkId} Framework

## 概述
这是 ${frameworkId} 框架的基本说明。

## 应用场景
适用于各种提示词优化场景。`;
  }
}

// 使用 DeepSeek 生成优化后的提示词
async function generateWithDeepSeek(
  userInput: string,
  frameworkId: string,
  frameworkContent: string,
  answers: Record<string, string>,
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiBaseUrl = process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com";

  if (!apiKey) {
    console.error("❌ DEEPSEEK_API_KEY 未配置");
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const { goal, audience, format, constraints, extra } = answers;

  // 构建系统提示（与原始项目 llm_service.py 的 generate_prompt 方法一致）
  const systemPrompt = `你是一个专业的 Prompt 工程师。请根据以下框架文档和用户提供的信息，生成一个优化后的提示词。

框架文档：
${frameworkContent}

请严格按照框架文档中的结构和最佳实践来生成提示词：
1. 仔细阅读框架的"框架构成"部分，了解每个组成部分的作用
2. 参考"最佳实践"中的示例，学习如何应用框架
3. 确保生成的提示词包含框架的所有必要组成部分
4. 使用清晰的 Markdown 格式，包含适当的标题和结构
5. 根据框架特点，生成具体、可执行的提示词

生成的提示词应该：
- 结构清晰，遵循框架的组成部分
- 包含所有必要的上下文信息
- 具体明确，避免模糊表述
- 易于理解和执行
- 符合框架的最佳实践`;

  // 构建用户提示（与原始项目一致）
  let userPrompt = `用户原始需求：
${userInput}

追问信息：
- 目标清晰度：${goal || "未提供"}
- 目标受众：${audience || "未提供"}
- 上下文完整性：${extra || "未提供"}
- 格式要求：${format || "未提供"}
- 约束条件：${constraints || "未提供"}`;

  userPrompt +=
    "\n\n请基于上述框架文档和用户信息，生成一个完整的、优化后的提示词（使用 Markdown 格式）：";

  const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DeepSeek API 错误响应:", errorText);
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    console.error("❌ DeepSeek 响应中没有内容");
    throw new Error("No content in DeepSeek response");
  }

  return content.trim();
}

export async function POST(request: NextRequest) {
  try {
    // ============================================================================
    // 身份验证和积分检查
    // ============================================================================
    const supabase = await createClient();
    const creditManager = new CreditManager();

    // 1. 验证用户登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 2. 计算所需积分
    const requiredCredits = getAgentPrice("prompt-optimizer");

    // 3. 检查余额并扣除积分
    const hasSufficientBalance = await creditManager.checkSufficientBalance(
      user.id,
      requiredCredits,
    );

    if (!hasSufficientBalance) {
      const balance = await creditManager.getBalance(user.id);
      return NextResponse.json(
        {
          error: {
            message: `积分不足，需要 ${requiredCredits} 积分，当前余额 ${balance.total} 积分`,
            code: "INSUFFICIENT_CREDITS",
            required: requiredCredits,
            current: balance.total,
            permanent: balance.permanent,
            daily: balance.daily,
          },
        },
        { status: 402 },
      );
    }

    // 扣除积分
    const deductResult = await creditManager.deductCredits(
      user.id,
      requiredCredits,
      "prompt-optimizer",
    );

    if (!deductResult.success) {
      return NextResponse.json({ error: "积分扣除失败，请稍后重试" }, { status: 500 });
    }

    const transactionId = deductResult.transactionId;

    // ============================================================================
    // 智能体调用（包装在 try-catch 中，失败时退款）
    // ============================================================================
    try {
      const body = await request.json();
      const { input, frameworkId, clarificationAnswers } = body;

      if (!input || !frameworkId || !clarificationAnswers) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const frameworkContent = await loadFrameworkDetails(frameworkId);
      const optimizedPrompt = await generateWithDeepSeek(
        input,
        frameworkId,
        frameworkContent,
        clarificationAnswers,
      );

      return NextResponse.json({
        output: optimizedPrompt,
        framework: frameworkId,
      });
    } catch (agentError) {
      // 智能体调用失败，退还积分
      if (transactionId) {
        await creditManager.refundCredits(transactionId);
      }
      throw agentError;
    }
  } catch (error) {
    console.error("❌ 生成 API 错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
