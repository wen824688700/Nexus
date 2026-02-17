import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// 框架候选接口
interface FrameworkCandidate {
  id: string;
  name: string;
  description: string;
  matchScore: number;
}

// 读取 Frameworks_Summary.md 文件
async function loadFrameworksSummary(): Promise<string> {
  const summaryPath = path.join(
    process.cwd(),
    "public",
    "prompt-optimizer",
    "Frameworks_Summary.md"
  );
  
  try {
    const content = await fs.readFile(summaryPath, "utf-8");
    return content;
  } catch (error) {
    console.error("Error loading Frameworks_Summary.md:", error);
    throw new Error("Failed to load frameworks summary");
  }
}

// 从 Frameworks_Summary.md 中提取框架的应用场景描述
function parseFrameworkScenarios(summaryContent: string): Map<string, string> {
  const scenariosMap = new Map<string, string>();
  
  try {
    const lines = summaryContent.split('\n');
    
    // 查找表格内容（跳过标题行和分隔行）
    let inTable = false;
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检测表格开始
      if (trimmedLine.startsWith('|') && trimmedLine.includes('框架名称')) {
        inTable = true;
        continue;
      }
      
      // 跳过分隔行
      if (trimmedLine.startsWith('|:---') || trimmedLine.startsWith('|---')) {
        continue;
      }
      
      // 检测表格结束
      if (inTable && trimmedLine.startsWith('---')) {
        break;
      }
      
      // 解析表格行
      if (inTable && trimmedLine.startsWith('|')) {
        const parts = trimmedLine.split('|').map(p => p.trim());
        // parts 格式: ['', '序号', '框架名称', '应用场景', '']
        if (parts.length >= 4) {
          const frameworkName = parts[2];
          const scenarios = parts[3];
          
          if (frameworkName && scenarios && frameworkName !== '框架名称') {
            // 存储带 "Framework" 后缀的版本
            scenariosMap.set(frameworkName, scenarios);
            
            // 同时存储不带 "Framework" 后缀的版本
            if (frameworkName.endsWith(' Framework')) {
              const baseName = frameworkName.replace(' Framework', '');
              scenariosMap.set(baseName, scenarios);
            }
          }
        }
      }
    }
    
    console.log(`解析了 ${scenariosMap.size} 个框架的应用场景描述`);
    return scenariosMap;
  } catch (error) {
    console.error("解析框架场景描述失败:", error);
    return scenariosMap;
  }
}

// 使用 DeepSeek API 分析用户需求并匹配框架
async function matchFrameworksWithAI(
  userInput: string,
  frameworksSummary: string
): Promise<FrameworkCandidate[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiBaseUrl = process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com";
  
  console.log("=== 框架匹配开始 ===");
  console.log("API Key存在:", !!apiKey);
  console.log("API Base URL:", apiBaseUrl);
  console.log("用户输入:", userInput);
  
  if (!apiKey) {
    console.error("❌ DEEPSEEK_API_KEY 未配置！");
    throw new Error("DEEPSEEK_API_KEY not configured");
  }
  
  // 解析框架场景描述
  const scenariosMap = parseFrameworkScenarios(frameworksSummary);
  
  // 按照SKILL.md的Step 2要求构建提示词
  const prompt = `你是一个专业的提示词工程专家。你需要严格按照 Prompt Optimizer Skill 的工作流程来匹配框架。

# SKILL 工作流程 - Step 2: Match Scenario and Select Framework

你现在处于第2步：匹配场景并选择框架。

## SKILL.md 中的框架选择指南

### 按复杂度选择：
- **简单任务（≤3元素）**：APE, ERA, TAG, RTF, BAB, PEE, ELI5
- **中等任务（4-5元素）**：RACE, CIDI, SPEAR, SPAR, FOCUS, SMART, GOPA, ORID, CARE, ROSE, PAUSE, TRACE, GRADE, TRACI, RODES
- **复杂任务（6+元素）**：RACEF, CRISPE, SCAMPER, Six Thinking Hats, ROSES, PROMPT, RISEN, RASCEF, Atomic Prompting

### 按领域选择：
- **营销内容**：BAB, SPEAR, Challenge-Solution-Benefit, BLOG, PROMPT, RHODES
- **决策分析**：RICE, Pros and Cons, Six Thinking Hats, Tree of Thought, PAUSE, What If
- **教育培训**：Bloom's Taxonomy, ELI5, Socratic Method, PEE, Hamburger Model
- **产品开发**：SCAMPER, HMW, CIDI, RELIC, 3Cs Model
- **AI对话助手**：COAST, ROSES, TRACE, RACE, RASCEF
- **写作创作**：BLOG, 4S Method, Hamburger Model, Few-shot, RHODES, Chain of Destiny
- **图像生成**：Atomic Prompting
- **快速简单任务**：Zero-shot, ERA, TAG, APE, RTF
- **复杂推理**：Chain of Thought, Tree of Thought

## 可用框架列表
${frameworksSummary}

## 用户需求
${userInput}

## 匹配要求

请深入分析用户需求和框架特性，选出最匹配的框架：

1. **分析用户需求**：
   - 识别任务类型（营销、决策、教育、产品开发等）
   - 评估任务复杂度（简单/中等/复杂）
   - 确定关键需求点

2. **评估框架匹配度**：
   - 框架是否适合该领域和任务类型
   - 框架的复杂度是否匹配任务需求
   - 框架的特点和优势是否满足用户的具体需求
   - 框架的应用场景是否与用户需求一致

## 输出格式

以JSON格式返回3个最匹配的框架：

\`\`\`json
{
  "frameworks": [
    {
      "name": "框架名称",
      "matchScore": 数字,
      "reason": "匹配原因"
    }
  ]
}
\`\`\`

**重要**：
- matchScore 是 0-100 之间的整数，请根据实际匹配程度自由评分（完全不匹配=0，完美匹配=100）
- 第一个框架应该是最匹配的（分数最高）
- 框架名称必须与列表中完全一致
- 只返回JSON，不要有其他文字`;

  console.log("正在调用 DeepSeek API...");
  
  const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  
  console.log("DeepSeek API 响应状态:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("DeepSeek API 错误响应:", errorText);
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log("DeepSeek API 返回数据:", JSON.stringify(data, null, 2));
  
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    console.error("❌ DeepSeek 响应中没有内容");
    throw new Error("No content in DeepSeek response");
  }
  
  console.log("DeepSeek 返回内容:", content);
  
  // 提取 JSON（可能被包裹在 markdown 代码块中）
  let jsonStr = content;
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }
  
  const result = JSON.parse(jsonStr);
  console.log("解析后的结果:", result);
  
  // 转换为 FrameworkCandidate 格式，使用 Frameworks_Summary.md 中的应用场景描述
  const candidates: FrameworkCandidate[] = result.frameworks.map((fw: any) => {
    // 尝试多种方式查找框架描述
    let description = null;
    
    // 1. 直接匹配
    description = scenariosMap.get(fw.name);
    
    // 2. 添加 " Framework" 后缀尝试
    if (!description) {
      description = scenariosMap.get(`${fw.name} Framework`);
    }
    
    // 3. 移除 " Framework" 后缀尝试
    if (!description && fw.name.endsWith(" Framework")) {
      const baseName = fw.name.replace(" Framework", "");
      description = scenariosMap.get(baseName);
    }
    
    // 4. 使用 AI 返回的原因作为后备
    if (!description) {
      description = fw.reason || "AI 推荐的框架";
      console.warn(`未找到框架 ${fw.name} 的应用场景描述，使用 AI 原因`);
    }
    
    return {
      id: fw.name,
      name: fw.name,
      description: description,
      matchScore: Math.min(100, Math.max(0, fw.matchScore || 0)),
    };
  });
  
  console.log("✅ 框架匹配完成，返回", candidates.length, "个框架");
  console.log("=== 框架匹配结束 ===");
  
  return candidates.slice(0, 3);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;
    
    console.log("\n========== 框架匹配 API 调用 ==========");
    console.log("收到请求，用户输入:", input);
    
    if (!input || typeof input !== "string") {
      console.error("❌ 无效输入");
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }
    
    // 加载框架摘要
    console.log("正在加载框架摘要...");
    const summaryContent = await loadFrameworksSummary();
    console.log("框架摘要加载成功，长度:", summaryContent.length);
    
    // 使用 AI 匹配框架
    const candidates = await matchFrameworksWithAI(input, summaryContent);
    
    console.log("✅ API 调用成功，返回框架数量:", candidates.length);
    console.log("========================================\n");
    
    return NextResponse.json({
      frameworks: candidates,
    });
  } catch (error) {
    console.error("❌ 框架匹配 API 错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
