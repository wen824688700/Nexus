import { env } from "@/env";
import { cozeChatStreamToCompletion, cozeRunWorkflow, cozeUploadFile } from "@/lib/coze";
import { extractValidImages, filterReportContent } from "@/utils/filterReport";
import { createClient } from "@/lib/supabase/server";
import { CreditManager } from "@/lib/credits/manager";
import { getAgentPrice } from "@/lib/credits/pricing";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return Response.json({ error: { message } }, { status });
}

function asNonEmptyString(v: FormDataEntryValue | null) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

// Data Analyst Agent Handler
async function handleDataAnalyst(req: Request) {
  const apiUrl = env.COZE_ANALYST_API_URL;
  const token = env.COZE_ANALYST_TOKEN;

  if (!apiUrl || !token) {
    return jsonError(500, "数据分析专家配置缺失");
  }

  // 提取 base URL（用于文件上传）
  const baseUrl = apiUrl.replace(/\/v\d+\/.*$/, "");
  console.log(`[Data Analyst] Chat API: ${apiUrl}, Base URL: ${baseUrl}`);

  // 处理 FormData（支持文件上传）
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch (err) {
    console.error("[Data Analyst] Failed to parse FormData:", err);
    return jsonError(400, "请求格式错误：需要 FormData 格式");
  }

  const query = asNonEmptyString(fd.get("query"));
  const fileCount = parseInt(asNonEmptyString(fd.get("file_count")) || "0", 10);

  if (!query && fileCount === 0) {
    return jsonError(400, "缺少查询内容或文件");
  }

  try {
    // 获取或生成 session_id（支持会话上下文）
    const sessionId = asNonEmptyString(fd.get("session_id")) || `user_${Date.now()}`;

    // 构建消息内容（始终是字符串）
    let messageContent = query || "你好";

    // 如果有文件，上传到智能体的对象存储
    if (fileCount > 0) {
      const fileUrls: string[] = [];

      for (let i = 0; i < fileCount; i++) {
        const file = fd.get(`file_${i}`);
        if (file instanceof File) {
          try {
            console.log(
              `[File Upload] 开始上传 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
            );
            console.log(`[File Upload] 文件类型: ${file.type}`);

            // 构建上传请求到智能体的 /upload 端点
            const uploadFormData = new FormData();
            // 保留原始文件名和扩展名
            uploadFormData.append("file", file, file.name);

            // 使用智能体自己的上传端点
            const uploadUrl = `${baseUrl}/upload`;
            console.log(`[File Upload] 上传到: ${uploadUrl}`);

            const uploadResponse = await fetch(uploadUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: uploadFormData,
            });

            console.log(
              `[File Upload] 响应状态: ${uploadResponse.status} ${uploadResponse.statusText}`,
            );

            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              console.error(`[File Upload] 上传失败:`, errorText);
              throw new Error(`文件上传失败 (${uploadResponse.status}): ${errorText}`);
            }

            const uploadData = (await uploadResponse.json()) as {
              code?: number;
              msg?: string;
              message?: string;
              data?: {
                file_url?: string;
                file_key?: string;
                url?: string;
              };
              file_url?: string;
              url?: string;
            };

            console.log("[File Upload] 完整响应:", JSON.stringify(uploadData, null, 2));

            // 检查响应格式
            if (uploadData.code !== undefined && uploadData.code !== 0) {
              throw new Error(uploadData.msg || uploadData.message || "上传失败");
            }

            // 提取文件 URL
            const fileUrl =
              uploadData.data?.file_url ||
              uploadData.data?.url ||
              uploadData.file_url ||
              uploadData.url;

            if (!fileUrl) {
              console.error("[File Upload] 无法从响应中提取文件 URL，完整响应:", uploadData);
              throw new Error("上传响应中缺少文件 URL");
            }

            console.log(`[File Upload] ✓ ${file.name} -> ${fileUrl}`);
            fileUrls.push(fileUrl);
          } catch (err) {
            console.error(`[File Upload] ✗ ${file.name}:`, err);
            throw err;
          }
        }
      }

      // 将文件 URL 传递给智能体
      if (fileUrls.length > 0) {
        messageContent = `请分析以下文件：\n${fileUrls.map((url) => `- ${url}`).join("\n")}\n\n${query || "请生成完整的数据分析报告和可视化图表。"}`;
        console.log(`[File Upload] 传递给智能体的文件 URL: ${fileUrls.join(", ")}`);
      }
    }

    // 构建标准请求（消息内容始终是字符串）
    const requestBody = {
      model: "doubao-seed-1-6-251015",
      messages: [
        {
          role: "user",
          content: messageContent, // 纯字符串
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4000,
      session_id: sessionId,
    };

    // 日志（截断长内容）
    console.log(
      "[Chat Request]",
      JSON.stringify(
        {
          ...requestBody,
          messages: [
            {
              role: "user",
              content:
                typeof messageContent === "string" && messageContent.length > 500
                  ? messageContent.slice(0, 500) + `... (总长度: ${messageContent.length} 字符)`
                  : messageContent,
            },
          ],
        },
        null,
        2,
      ),
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[Chat Response] Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Coze API Error ${response.status}]`, errorText);

      // 尝试解析错误信息
      try {
        const errorJson = JSON.parse(errorText);
        const errorMsg = errorJson.error?.message || errorJson.message || errorText;
        throw new Error(`Coze API 返回错误: ${errorMsg}`);
      } catch {
        throw new Error(`Coze API 返回错误: ${response.status} - ${errorText}`);
      }
    }

    // 创建流式响应（添加超时保护）
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let hasContent = false;
        let fullAnswer = "";
        // 数据分析报告可能很长，单次会话事件数会远超 500
        const maxEvents = 5000; // 仅作为异常保护，避免无限流

        // 工具调用状态追踪（在外层，跨多次 consumeStream 调用）
        const toolCallsMap = new Map<number, { id: string; name: string; args: string }>();

        try {
          const consumeStream = async (res: Response) => {
            const innerReader = res.body?.getReader();
            if (!innerReader) {
              return { hasContent: false, sawToolOutput: false, toolErrors: [] as string[] };
            }

            const innerDecoder = new TextDecoder();
            let innerBuffer = "";
            let eventCount = 0;
            let localHasContent = false;
            let sawToolOutput = false;
            const toolErrors: string[] = [];

            while (true) {
              const { done, value } = await innerReader.read();
              if (done) break;

              innerBuffer += innerDecoder.decode(value, { stream: true });
              const lines = innerBuffer.split("\n");
              innerBuffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.trim() || !line.startsWith("data: ")) continue;

                const data = line.slice(6).trim();

                // 开发环境下记录原始数据
                if (process.env.NODE_ENV !== "production") {
                  console.log("[Coze SSE]", data.slice(0, 300));
                }

                if (data === "[DONE]") {
                  continue;
                }

                try {
                  const json = JSON.parse(data) as {
                    id?: string;
                    choices?: Array<{
                      delta?: {
                        content?: string;
                        role?: string;
                        tool_calls?: Array<{
                          index: number;
                          id?: string;
                          type?: string;
                          function?: {
                            name?: string;
                            arguments?: string;
                          };
                        }>;
                        tool_call_id?: string;
                      };
                      finish_reason?: string | null;
                    }>;
                    // Coze 自定义格式
                    type?: string;
                    event?: string;
                    content?:
                      | string
                      | {
                          answer?: string;
                          thinking?: string;
                          tool_response?: string;
                          message_start?: unknown;
                          message_end?: unknown;
                        };
                    finish?: boolean;
                    sequence_id?: number;
                  };

                  eventCount++;

                  // 防止死循环
                  if (eventCount > maxEvents) {
                    console.error(`[Stream] 超过最大事件数 ${maxEvents}，强制结束`);
                    return { hasContent: localHasContent, sawToolOutput, toolErrors };
                  }

                  const delta = json.choices?.[0]?.delta;
                  const deltaRole = delta?.role;
                  const finishReason = json.choices?.[0]?.finish_reason;

                  // 🔍 调试：打印所有包含 tool 的事件
                  if (delta?.tool_calls || deltaRole === "tool" || finishReason === "tool_calls") {
                    console.log(
                      "🔧 [TOOL EVENT DETECTED]",
                      JSON.stringify(
                        {
                          eventCount,
                          deltaRole,
                          finishReason,
                          hasToolCalls: !!delta?.tool_calls,
                          toolCallsCount: delta?.tool_calls?.length,
                          toolCallId: delta?.tool_call_id,
                        },
                        null,
                        2,
                      ),
                    );
                  }

                  // 检测工具调用
                  if (delta?.tool_calls && Array.isArray(delta.tool_calls)) {
                    console.log("[Tool Calls Detected]", JSON.stringify(delta.tool_calls, null, 2));
                    for (const toolCall of delta.tool_calls) {
                      const idx = toolCall.index;
                      const existing = toolCallsMap.get(idx);

                      if (!existing) {
                        // 新工具调用
                        toolCallsMap.set(idx, {
                          id: toolCall.id || `tool_${idx}`,
                          name: toolCall.function?.name || "",
                          args: toolCall.function?.arguments || "",
                        });
                        console.log(`[Tool Call #${idx}] 新工具: ${toolCall.function?.name}`);
                      } else {
                        // 累积参数（增量式）
                        if (toolCall.function?.name) {
                          existing.name = toolCall.function.name;
                        }
                        if (toolCall.function?.arguments) {
                          existing.args += toolCall.function.arguments;
                        }
                      }
                    }
                  }

                  // 工具调用结束，发送工具启动事件
                  if (finishReason === "tool_calls") {
                    console.log(
                      "[Tool Calls Finished] 发送工具启动事件，工具数量:",
                      toolCallsMap.size,
                    );
                    for (const [idx, tool] of toolCallsMap) {
                      console.log(`[Tool #${idx}] ${tool.name}, args length: ${tool.args.length}`);
                      if (tool.name && tool.args) {
                        try {
                          const args = JSON.parse(tool.args);
                          const event = { type: "tool_start", tool: tool.name, args };
                          console.log("[Sending Tool Start Event]", JSON.stringify(event, null, 2));
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                        } catch (err) {
                          console.error(`[Tool Args Parse Error] ${tool.name}:`, err);
                          // 参数解析失败，发送不带参数的事件
                          controller.enqueue(
                            encoder.encode(
                              `data: ${JSON.stringify({ type: "tool_start", tool: tool.name, args: {} })}\n\n`,
                            ),
                          );
                        }
                      }
                    }
                  }

                  // 检测工具返回结果
                  if (deltaRole === "tool" && delta?.tool_call_id && delta?.content) {
                    sawToolOutput = true;
                    // 查找对应的工具名称
                    let toolName = "";
                    for (const [, tool] of toolCallsMap) {
                      if (tool.id === delta.tool_call_id) {
                        toolName = tool.name;
                        break;
                      }
                    }
                    console.log(
                      `[Tool Complete] ${toolName}, result length: ${delta.content.length}`,
                    );
                    const event = { type: "tool_complete", tool: toolName, result: delta.content };
                    console.log(
                      "[Sending Tool Complete Event]",
                      JSON.stringify({ ...event, result: event.result.slice(0, 100) + "..." }),
                    );
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                  }

                  // 开发环境下记录所有事件
                  if (process.env.NODE_ENV !== "production") {
                    const contentObj =
                      json.content && typeof json.content === "object" ? json.content : null;
                    console.log(
                      `[Coze Event #${json.sequence_id || eventCount}]`,
                      json.type,
                      contentObj?.answer
                        ? `answer: ${contentObj.answer.slice(0, 100)}...`
                        : contentObj?.thinking
                          ? `thinking: ${contentObj.thinking.slice(0, 100)}...`
                          : contentObj?.tool_response
                            ? `tool_response: ${contentObj.tool_response.slice(0, 100)}...`
                            : delta?.tool_calls
                              ? "tool_calls"
                              : "no content",
                    );
                  }

                  // 尝试提取内容
                  let content: string | null = null;

                  // 标准 OpenAI 格式
                  if (json.choices && json.choices[0]?.delta?.content && deltaRole !== "tool") {
                    content = json.choices[0].delta.content;
                  }
                  // Coze 自定义格式 - content 为纯字符串
                  else if (typeof json.content === "string" && json.type === "answer") {
                    content = json.content;
                  }
                  // Coze 自定义格式 - answer 字段
                  else if (
                    json.content &&
                    typeof json.content === "object" &&
                    json.content.answer
                  ) {
                    content = json.content.answer;
                  }

                  // 如果找到内容，转发
                  if (content) {
                    localHasContent = true;
                    hasContent = true;
                    fullAnswer += content;
                    const chunk = {
                      content,
                      done: false,
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                  }

                  // 仅在明确的 Coze 终止事件时结束；忽略 finish_reason=stop/length
                  const isTerminal =
                    json.type === "done" ||
                    json.type === "message_end" ||
                    json.event === "done" ||
                    json.finish === true;

                  if (isTerminal && deltaRole !== "tool") {
                    innerReader.cancel().catch(() => {});
                    return { hasContent: localHasContent, sawToolOutput, toolErrors };
                  }
                } catch (parseErr) {
                  // 记录解析错误但继续处理
                  if (process.env.NODE_ENV !== "production") {
                    console.error("解析 SSE 数据失败:", data.slice(0, 200), parseErr);
                  }
                }
              }
            }

            return { hasContent: localHasContent, sawToolOutput, toolErrors };
          };

          const firstPass = await consumeStream(response);

          // 如果只拿到了工具输出而没有最终报告，尝试继续生成
          if (!hasContent && firstPass.sawToolOutput) {
            const followUp = {
              model: "doubao-seed-1-6-251015",
              messages: [
                {
                  role: "user",
                  content:
                    "请继续输出最终的数据分析报告（包含关键发现、结论与图表链接），不要输出工具的中间结果。",
                },
              ],
              stream: true,
              temperature: 0.7,
              max_tokens: 4000,
              session_id: sessionId,
            };

            const retryRes = await fetch(apiUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(followUp),
            });

            if (retryRes.ok) {
              await consumeStream(retryRes);
            } else {
              const errorText = await retryRes.text().catch(() => "");
              console.error("[Coze Retry Error]", errorText);
            }
          }

          if (hasContent) {
            // 过滤无效内容
            const filteredAnswer = filterReportContent(fullAnswer);

            // 提取图表
            const charts = extractValidImages(filteredAnswer);

            // 调试日志
            console.log("[Chart Extraction] 完整内容长度:", fullAnswer.length);
            console.log("[Chart Extraction] 过滤后内容长度:", filteredAnswer.length);
            console.log("[Chart Extraction] 提取到的图表数量:", charts.length);
            if (charts.length > 0) {
              console.log("[Chart Extraction] 图表详情:", JSON.stringify(charts, null, 2));
            } else {
              // 如果没有提取到图表，打印内容片段用于调试
              const snippet = filteredAnswer.slice(0, 500);
              console.log("[Chart Extraction] 内容片段（前500字符）:", snippet);

              // 检查是否包含图片 Markdown 语法
              const hasImageSyntax = /!\[.*?\]\(.*?\)/.test(filteredAnswer);
              console.log("[Chart Extraction] 是否包含图片语法:", hasImageSyntax);

              if (hasImageSyntax) {
                // 打印所有匹配的图片语法
                const allMatches = filteredAnswer.match(/!\[.*?\]\(.*?\)/g);
                console.log("[Chart Extraction] 找到的图片语法:", allMatches);
              }
            }

            // 发送最终响应（包含图表数组）
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  content: filteredAnswer,
                  charts: charts,
                  done: true,
                  fullAnswer: filteredAnswer,
                })}\n\n`,
              ),
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            return;
          }

          // 如果流结束但没有内容，发送一个提示
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: "抱歉，未能获取到分析结果。请检查文件格式或稍后重试。", done: false })}\n\n`,
            ),
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, charts: [] })}\n\n`),
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("[Stream Error]", error);
          controller.error(error);
        } finally {
          try {
            controller.close();
          } catch {
            // Controller 可能已经关闭，忽略错误
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return jsonError(500, message);
  }
}

// Image Editor Agent Handler
async function handleImageEditor(req: Request) {
  const apiUrl = env.COZE_IMAGE_EDITOR_API_URL;
  const projectId = env.COZE_IMAGE_EDITOR_PROJECT_ID;
  const token = env.COZE_IMAGE_EDITOR_TOKEN;
  // 尝试获取 Replicate token（可选）
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  if (!apiUrl || !projectId || !token) {
    return jsonError(500, "图像编辑智能体配置缺失");
  }

  // 提取 base URL（用于文件上传）
  const baseUrl = apiUrl.replace(/\/v\d+\/.*$/, "");
  console.log(`[Image Editor] API: ${apiUrl}, Base URL: ${baseUrl}, Project ID: ${projectId}`);

  // 处理 FormData
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch (err) {
    console.error("[Image Editor] Failed to parse FormData:", err);
    return jsonError(400, "请求格式错误：需要 FormData 格式");
  }

  const query = asNonEmptyString(fd.get("query"));
  const sessionId = asNonEmptyString(fd.get("session_id")) || `user_${Date.now()}`;
  const fileCount = parseInt(asNonEmptyString(fd.get("file_count")) || "0", 10);

  // 图像编辑必须有图片
  if (fileCount === 0) {
    return jsonError(400, "请先上传图片");
  }

  try {
    // 构建消息内容
    const fileUrls: string[] = [];

    // 上传文件到智能体的 /upload 端点（和数据分析智能体一样）
    if (fileCount > 0) {
      for (let i = 0; i < fileCount; i++) {
        const file = fd.get(`file_${i}`);
        if (file instanceof File) {
          try {
            console.log(
              `[Image Upload] 开始上传 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
            );
            console.log(`[Image Upload] 文件类型: ${file.type}`);

            // 构建上传请求
            const uploadFormData = new FormData();
            uploadFormData.append("file", file, file.name);

            // 使用智能体自己的上传端点（尝试多个可能的路径）
            const uploadPaths = ["/upload", "/v1/upload", "/v1/files/upload"];
            let uploadResponse: Response | null = null;
            let uploadUrl = "";

            for (const path of uploadPaths) {
              uploadUrl = `${baseUrl}${path}`;
              console.log(`[Image Upload] 尝试上传到: ${uploadUrl}`);

              try {
                uploadResponse = await fetch(uploadUrl, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: uploadFormData,
                });

                console.log(
                  `[Image Upload] 响应状态: ${uploadResponse.status} ${uploadResponse.statusText}`,
                );

                if (uploadResponse.ok) {
                  console.log(`[Image Upload] ✓ 成功使用端点: ${path}`);
                  break;
                }
              } catch (err) {
                console.log(`[Image Upload] 端点 ${path} 失败:`, err);
              }
            }

            if (!uploadResponse || !uploadResponse.ok) {
              const errorText = uploadResponse ? await uploadResponse.text() : "所有端点都失败";
              console.error(`[Image Upload] 上传失败:`, errorText);
              throw new Error(`文件上传失败: ${errorText}`);
            }

            const uploadData = (await uploadResponse.json()) as {
              code?: number;
              msg?: string;
              message?: string;
              data?: {
                file_url?: string;
                url?: string;
                id?: string;
              };
              file_url?: string;
              url?: string;
              id?: string;
              filename?: string;
            };

            console.log("[Image Upload] 完整响应:", JSON.stringify(uploadData, null, 2));

            // 检查响应格式
            if (uploadData.code !== undefined && uploadData.code !== 0) {
              throw new Error(uploadData.msg || uploadData.message || "上传失败");
            }

            // 提取文件 URL（支持多种格式）
            const fileUrl =
              uploadData.data?.file_url ||
              uploadData.data?.url ||
              uploadData.file_url ||
              uploadData.url ||
              // 如果返回的是 id，构建 URL
              (uploadData.data?.id
                ? `https://coze-coding-project.tos.coze.site/${uploadData.data.id}`
                : null) ||
              (uploadData.id ? `https://coze-coding-project.tos.coze.site/${uploadData.id}` : null);

            if (!fileUrl) {
              console.error("[Image Upload] 无法从响应中提取文件 URL，完整响应:", uploadData);
              throw new Error("上传响应中缺少文件 URL");
            }

            console.log(`[Image Upload] ✓ ${file.name} -> ${fileUrl}`);
            fileUrls.push(fileUrl);
          } catch (err) {
            console.error(`[Image Upload] ✗ ${file.name}:`, err);
            throw err;
          }
        }
      }
    }

    if (fileUrls.length === 0) {
      return jsonError(400, "文件上传失败");
    }

    // 构建消息（直接使用文件 URL，让智能体自动下载）
    const messageContent = `${query || "请处理这张图片"}\n\n图片：${fileUrls[0]}`;
    console.log(`[Image Upload] 传递文件 URL: ${fileUrls[0]}`);

    // 构建请求（使用字符串格式，不是结构化对象）
    const requestBody = {
      model: projectId,
      messages: [
        {
          role: "user",
          content: messageContent, // 纯字符串
        },
      ],
      stream: true,
      session_id: sessionId,
      // 如果有 Replicate token，传递给智能体
      ...(replicateToken
        ? {
            custom_variables: {
              REPLICATE_API_TOKEN: replicateToken,
            },
          }
        : {}),
    };

    console.log(
      "[Image Editor Request]",
      JSON.stringify(
        {
          ...requestBody,
          messages: [
            {
              role: "user",
              content:
                messageContent.length > 200 ? messageContent.slice(0, 200) + "..." : messageContent,
            },
          ],
        },
        null,
        2,
      ),
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[Image Editor Response] Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Image Editor Error]`, errorText);
      throw new Error(`API 错误: ${errorText}`);
    }

    // 创建流式响应（使用和数据分析智能体相同的处理逻辑）
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          console.error("[Image Editor] No response body reader");
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let eventCount = 0;
        const toolCallsMap = new Map<number, { id: string; name: string; args: string }>();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log(`[Image Editor] Stream ended after ${eventCount} events`);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || !line.startsWith("data: ")) continue;

              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);
                eventCount++;

                // 详细日志：打印每个事件的完整结构
                console.log(`[Image Editor Event #${eventCount}]`, JSON.stringify(json, null, 2));

                // 检测错误
                if (json.error) {
                  console.error(`[Image Editor] API Error:`, json.error);
                  const errorMsg = json.error.message || json.error.type || "智能体处理失败";
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        content: `❌ 错误：${errorMsg}\n\n这可能是智能体配置问题，请检查 Coze 平台上的智能体设置。`,
                        done: true,
                        error: json.error,
                      })}\n\n`,
                    ),
                  );
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  reader.cancel().catch(() => {});
                  return;
                }

                const delta = json.choices?.[0]?.delta;
                const finishReason = json.choices?.[0]?.finish_reason;
                const eventType = json.type || json.event;

                // 处理工具调用
                if (delta?.tool_calls) {
                  console.log("[Image Editor] Tool calls detected:", delta.tool_calls);
                  for (const toolCall of delta.tool_calls) {
                    const idx = toolCall.index;
                    const existing = toolCallsMap.get(idx);

                    if (!existing) {
                      toolCallsMap.set(idx, {
                        id: toolCall.id || `tool_${idx}`,
                        name: toolCall.function?.name || "",
                        args: toolCall.function?.arguments || "",
                      });
                    } else {
                      if (toolCall.function?.name) existing.name = toolCall.function.name;
                      if (toolCall.function?.arguments)
                        existing.args += toolCall.function.arguments;
                    }
                  }
                }

                // 工具调用结束
                if (finishReason === "tool_calls") {
                  console.log("[Image Editor] Tool calls finished");
                  for (const [, tool] of toolCallsMap) {
                    if (tool.name && tool.args) {
                      try {
                        const args = JSON.parse(tool.args);
                        const descriptions: Record<string, string> = {
                          remove_background: "正在智能抠图，移除背景...",
                          upscale_image: `正在放大图片 ${args.scale || 2}x...`,
                          restore_face: "正在修复面部细节...",
                          flux_edit: "正在使用 FLUX 进行创意编辑...",
                        };
                        const description = descriptions[tool.name] || `正在执行 ${tool.name}...`;

                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ type: "tool_start", tool: tool.name, args, description })}\n\n`,
                          ),
                        );
                      } catch (err) {
                        console.error(`[Image Editor] Failed to parse tool args:`, err);
                      }
                    }
                  }
                }

                // 工具返回结果
                if (delta?.role === "tool" && delta?.content) {
                  let toolName = "";
                  for (const [, tool] of toolCallsMap) {
                    if (tool.id === delta.tool_call_id) {
                      toolName = tool.name;
                      break;
                    }
                  }
                  console.log(`[Image Editor] Tool complete: ${toolName}`);
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "tool_complete", tool: toolName, result: delta.content })}\n\n`,
                    ),
                  );
                }

                // 处理内容（支持 Coze 原生格式和 OpenAI 格式）
                let content: string | null = null;

                // Coze 原生格式：type: "answer", content: "..."
                if (eventType === "answer" && json.content) {
                  content =
                    typeof json.content === "string" ? json.content : json.content.answer || "";

                  if (content) {
                    console.log(`[Image Editor] Coze format content: ${content.slice(0, 100)}...`);
                  }
                }
                // OpenAI 格式：choices[0].delta.content
                else if (delta?.content && delta?.role !== "tool") {
                  content = delta.content;
                  if (content) {
                    console.log(
                      `[Image Editor] OpenAI format content: ${content.slice(0, 100)}...`,
                    );
                  }
                }

                if (content && content.length > 0) {
                  // 只过滤掉 URL 链接，保留所有文字描述
                  // 匹配 http/https 开头的完整 URL（包括参数）
                  const filteredContent = content
                    .replace(/https?:\/\/[^\s\)\]]+/g, "") // 移除链接
                    .replace(/\s+/g, " ") // 合并多余空格
                    .trim();

                  // 只要有内容就发送（即使只是文字）
                  if (filteredContent) {
                    fullContent += filteredContent;
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ content: filteredContent, done: false })}\n\n`,
                      ),
                    );
                  }
                }

                // 注意：不要在这里提前结束流，让它自然读取完所有事件
              } catch (err) {
                console.error("[Image Editor] Failed to parse SSE data:", data.slice(0, 200), err);
              }
            }
          }

          // 流自然结束，发送最终响应
          console.log(
            `[Image Editor] Stream complete after ${eventCount} events, content length: ${fullContent.length}`,
          );
          console.log(`[Image Editor] Full content:`, fullContent);

          // 提取图片 URL（在过滤之前）
          const images: Array<{ url: string; description: string }> = [];
          const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
          let match;

          while ((match = markdownRegex.exec(fullContent)) !== null) {
            const description = match[1] || "处理结果";
            const url = match[2];

            if (!url.includes("plugin_icon") && !url.includes("workflow.png")) {
              images.push({ url, description });
            }
          }

          console.log(`[Image Editor] Extracted ${images.length} images from response`);

          // 过滤最终内容中的所有 URL 链接
          const finalContent = fullContent
            .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // 移除 Markdown 图片链接
            .replace(/https?:\/\/[^\s\)\]]+/g, "") // 移除普通 URL
            .replace(/\s+/g, " ") // 合并多余空格
            .trim();

          console.log(
            `[Image Editor] Filtered content (${finalContent.length} chars):`,
            finalContent,
          );

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: finalContent, done: true, images })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("[Image Editor Stream Error]", error);
          controller.error(error);
        } finally {
          console.log("[Image Editor] Stream closed");
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return jsonError(500, message);
  }
}

// Audio Style Analyzer Agent Handler
async function handleAudioAnalyzer(req: Request) {
  const apiUrl = env.COZE_AUDIO_ANALYZER_API_URL;
  const projectId = env.COZE_AUDIO_ANALYZER_PROJECT_ID;
  const token = env.COZE_AUDIO_ANALYZER_TOKEN;

  if (!apiUrl || !projectId || !token) {
    return jsonError(500, "音频风格分析智能体配置缺失");
  }

  // 提取 base URL（用于文件上传）
  const baseUrl = apiUrl.replace(/\/v\d+\/.*$/, "");
  console.log(`[Audio Analyzer] API: ${apiUrl}, Base URL: ${baseUrl}, Project ID: ${projectId}`);

  // 处理 FormData
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch (err) {
    console.error("[Audio Analyzer] Failed to parse FormData:", err);
    return jsonError(400, "请求格式错误：需要 FormData 格式");
  }

  const query = asNonEmptyString(fd.get("query"));
  const sessionId = asNonEmptyString(fd.get("session_id")) || `user_${Date.now()}`;
  const fileCount = parseInt(asNonEmptyString(fd.get("file_count")) || "0", 10);

  // 音频分析必须有音频文件
  if (fileCount === 0) {
    return jsonError(400, "请先上传音频文件");
  }

  try {
    // 上传文件到智能体
    const fileUrls: string[] = [];

    for (let i = 0; i < fileCount; i++) {
      const file = fd.get(`file_${i}`);
      if (file instanceof File) {
        try {
          console.log(
            `[Audio Upload] 开始上传 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
          );
          console.log(`[Audio Upload] 文件类型: ${file.type}`);

          // 构建上传请求
          const uploadFormData = new FormData();
          uploadFormData.append("file", file, file.name);

          // 尝试多个可能的上传端点
          const uploadPaths = ["/upload", "/v1/upload", "/v1/files/upload"];
          let uploadResponse: Response | null = null;
          let uploadUrl = "";

          for (const path of uploadPaths) {
            uploadUrl = `${baseUrl}${path}`;
            console.log(`[Audio Upload] 尝试上传到: ${uploadUrl}`);

            try {
              uploadResponse = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: uploadFormData,
              });

              console.log(
                `[Audio Upload] 响应状态: ${uploadResponse.status} ${uploadResponse.statusText}`,
              );

              if (uploadResponse.ok) {
                console.log(`[Audio Upload] ✓ 成功使用端点: ${path}`);
                break;
              }
            } catch (err) {
              console.log(`[Audio Upload] 端点 ${path} 失败:`, err);
            }
          }

          if (!uploadResponse || !uploadResponse.ok) {
            const errorText = uploadResponse ? await uploadResponse.text() : "所有端点都失败";
            console.error(`[Audio Upload] 上传失败:`, errorText);
            throw new Error(`文件上传失败: ${errorText}`);
          }

          const uploadData = (await uploadResponse.json()) as {
            code?: number;
            msg?: string;
            message?: string;
            data?: {
              file_url?: string;
              url?: string;
              id?: string;
            };
            file_url?: string;
            url?: string;
            id?: string;
          };

          console.log("[Audio Upload] 完整响应:", JSON.stringify(uploadData, null, 2));

          // 检查响应格式
          if (uploadData.code !== undefined && uploadData.code !== 0) {
            throw new Error(uploadData.msg || uploadData.message || "上传失败");
          }

          // 提取文件 URL
          const fileUrl =
            uploadData.data?.file_url ||
            uploadData.data?.url ||
            uploadData.file_url ||
            uploadData.url ||
            (uploadData.data?.id
              ? `https://coze-coding-project.tos.coze.site/${uploadData.data.id}`
              : null) ||
            (uploadData.id ? `https://coze-coding-project.tos.coze.site/${uploadData.id}` : null);

          if (!fileUrl) {
            console.error("[Audio Upload] 无法从响应中提取文件 URL，完整响应:", uploadData);
            throw new Error("上传响应中缺少文件 URL");
          }

          console.log(`[Audio Upload] ✓ ${file.name} -> ${fileUrl}`);
          fileUrls.push(fileUrl);
        } catch (err) {
          console.error(`[Audio Upload] ✗ ${file.name}:`, err);
          throw err;
        }
      }
    }

    if (fileUrls.length === 0) {
      return jsonError(400, "文件上传失败");
    }

    // 构建消息（使用字符串格式）
    const messageContent = `${query || "请分析这个音频的风格特征"}\n\n音频文件：${fileUrls[0]}`;
    console.log(`[Audio Upload] 传递文件 URL: ${fileUrls[0]}`);

    // 构建请求（标准 Chat API 格式）
    const requestBody = {
      model: projectId,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      stream: true,
      session_id: sessionId,
    };

    console.log(
      "[Audio Analyzer Request]",
      JSON.stringify(
        {
          ...requestBody,
          messages: [
            {
              role: "user",
              content:
                messageContent.length > 200 ? messageContent.slice(0, 200) + "..." : messageContent,
            },
          ],
        },
        null,
        2,
      ),
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[Audio Analyzer Response] Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Audio Analyzer Error]`, errorText);
      throw new Error(`API 错误: ${errorText}`);
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          console.error("[Audio Analyzer] No response body reader");
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let eventCount = 0;
        let sawToolOutput = false;
        let hasContent = false;
        const toolCallsMap = new Map<number, { id: string; name: string; args: string }>();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log(`[Audio Analyzer] Stream ended after ${eventCount} events`);
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || !line.startsWith("data: ")) continue;

              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);
                eventCount++;

                // 🔍 详细日志：打印每个事件
                console.log(`[Audio Analyzer Event #${eventCount}]`, JSON.stringify(json, null, 2));

                // 检测错误
                if (json.error) {
                  console.error(`[Audio Analyzer] API Error:`, json.error);
                  const errorMsg = json.error.message || json.error.type || "智能体处理失败";
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        content: `❌ 错误：${errorMsg}`,
                        done: true,
                        error: json.error,
                      })}\n\n`,
                    ),
                  );
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  reader.cancel().catch(() => {});
                  return;
                }

                const delta = json.choices?.[0]?.delta;
                const eventType = json.type || json.event;
                const finishReason = json.choices?.[0]?.finish_reason;

                // 检测工具调用（OpenAI 格式）
                if (delta?.tool_calls && Array.isArray(delta.tool_calls)) {
                  console.log("[Audio Analyzer] Tool calls detected:", delta.tool_calls);
                  for (const toolCall of delta.tool_calls) {
                    const idx = toolCall.index;
                    const existing = toolCallsMap.get(idx);

                    if (!existing) {
                      // 新工具调用
                      toolCallsMap.set(idx, {
                        id: toolCall.id || `tool_${idx}`,
                        name: toolCall.function?.name || "",
                        args: toolCall.function?.arguments || "",
                      });
                      console.log(`[Audio Analyzer] Tool Call #${idx}: ${toolCall.function?.name}`);
                    } else {
                      // 累积参数
                      if (toolCall.function?.name) {
                        existing.name = toolCall.function.name;
                      }
                      if (toolCall.function?.arguments) {
                        existing.args += toolCall.function.arguments;
                      }
                    }
                  }
                }

                // 工具调用结束，发送工具启动事件
                if (finishReason === "tool_calls") {
                  console.log("[Audio Analyzer] Tool calls finished, sending tool_start events");
                  for (const [, tool] of toolCallsMap) {
                    if (tool.name) {
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({
                            type: "tool_start",
                            tool: tool.name,
                          })}\n\n`,
                        ),
                      );
                    }
                  }
                }

                // 检测工具调用结果
                if (delta?.role === "tool" && delta?.content) {
                  sawToolOutput = true;
                  console.log(
                    `[Audio Analyzer] Tool output detected, length: ${delta.content.length}`,
                  );

                  // 查找对应的工具名称
                  let toolName = "";
                  for (const [, tool] of toolCallsMap) {
                    if (tool.id === delta.tool_call_id) {
                      toolName = tool.name;
                      break;
                    }
                  }

                  // 发送工具完成事件
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "tool_complete",
                        tool: toolName || "音频分析",
                      })}\n\n`,
                    ),
                  );

                  try {
                    const toolResult = JSON.parse(delta.content);
                    if (toolResult.error) {
                      console.error(`[Audio Analyzer] Tool Error:`, toolResult.error);
                      const errorMsg = `智能体工具执行失败：${toolResult.error}`;
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({
                            content: `❌ ${errorMsg}\n\n这是 Coze 智能体内部的错误，请检查智能体配置。`,
                            done: true,
                            error: toolResult,
                          })}\n\n`,
                        ),
                      );
                      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                      reader.cancel().catch(() => {});
                      return;
                    }
                  } catch (e) {
                    // 不是 JSON 格式，继续处理
                  }
                }

                // 处理内容（支持 Coze 原生格式和 OpenAI 格式）
                let content: string | null = null;

                // Coze 原生格式
                if (eventType === "answer" && json.content) {
                  content =
                    typeof json.content === "string" ? json.content : json.content.answer || "";
                  if (content) {
                    console.log(
                      `[Audio Analyzer] Coze format content (${content.length} chars):`,
                      content.slice(0, 100),
                    );
                  }
                }
                // OpenAI 格式（排除工具返回）
                else if (delta?.content && delta?.role !== "tool") {
                  content = delta.content;
                  if (content) {
                    console.log(
                      `[Audio Analyzer] OpenAI format content (${content.length} chars):`,
                      content.slice(0, 100),
                    );
                  }
                }

                if (content && content.length > 0) {
                  // 第一次收到内容时，确保所有工具都标记为完成
                  if (!hasContent && toolCallsMap.size > 0) {
                    console.log(
                      "[Audio Analyzer] First content received, marking all tools as complete",
                    );
                    for (const [, tool] of toolCallsMap) {
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({
                            type: "tool_complete",
                            tool: tool.name,
                          })}\n\n`,
                        ),
                      );
                    }
                  }
                  hasContent = true;
                  fullContent += content;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content, done: false })}\n\n`),
                  );
                }

                // 检测结束（只检测 Coze 明确的终止事件，忽略 finish_reason）
                const isTerminal =
                  json.type === "done" ||
                  json.type === "message_end" ||
                  json.event === "done" ||
                  json.finish === true;

                if (isTerminal && delta?.role !== "tool") {
                  console.log(
                    `[Audio Analyzer] 检测到终止事件: type=${json.type}, event=${json.event}, finish=${json.finish}`,
                  );
                  console.log(
                    `[Audio Analyzer] Stream complete, content length: ${fullContent.length}`,
                  );
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content: "", done: true, fullAnswer: fullContent })}\n\n`,
                    ),
                  );
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  reader.cancel().catch(() => {});
                  return;
                }
              } catch (err) {
                console.error(
                  "[Audio Analyzer] Failed to parse SSE data:",
                  data.slice(0, 200),
                  err,
                );
              }
            }
          }

          // 流自然结束，检查是否需要后续请求
          if (!fullContent && sawToolOutput) {
            console.log("[Audio Analyzer] 工具执行成功但没有文本回复，发送后续请求...");

            const followUpRequest = {
              model: projectId,
              messages: [
                {
                  role: "user",
                  content:
                    "请根据上面的音频分析结果，生成一份详细的、人类可读的音频风格分析报告。包括：音乐风格、节奏特点、情绪氛围、技术参数等方面的解读。",
                },
              ],
              stream: true,
              session_id: sessionId,
            };

            console.log("[Audio Analyzer] 发送后续请求...");

            const followUpResponse = await fetch(apiUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(followUpRequest),
            });

            if (followUpResponse.ok) {
              const followUpReader = followUpResponse.body?.getReader();
              if (followUpReader) {
                let followUpBuffer = "";

                while (true) {
                  const { done, value } = await followUpReader.read();
                  if (done) break;

                  followUpBuffer += decoder.decode(value, { stream: true });
                  const lines = followUpBuffer.split("\n");
                  followUpBuffer = lines.pop() || "";

                  for (const line of lines) {
                    if (!line.trim() || !line.startsWith("data: ")) continue;
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") continue;

                    try {
                      const json = JSON.parse(data);
                      const delta = json.choices?.[0]?.delta;

                      if (delta?.content && delta?.role !== "tool") {
                        fullContent += delta.content;
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ content: delta.content, done: false })}\n\n`,
                          ),
                        );
                      }

                      if (json.choices?.[0]?.finish_reason === "stop") {
                        break;
                      }
                    } catch (e) {
                      // 忽略解析错误
                    }
                  }
                }
              }
            }
          }

          console.log(`[Audio Analyzer] Stream complete, content length: ${fullContent.length}`);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: "", done: true, fullAnswer: fullContent })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("[Audio Analyzer Stream Error]", error);
          controller.error(error);
        } finally {
          console.log("[Audio Analyzer] Stream closed");
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return jsonError(500, message);
  }
}

// Seedance 2.0 Storyboard Assistant Handler
async function handleSeedanceStoryboard(req: Request) {
  const apiUrl = env.COZE_SEEDANCE_API_URL;
  const projectId = env.COZE_SEEDANCE_PROJECT_ID;
  const token = env.COZE_SEEDANCE_TOKEN;

  if (!apiUrl || !projectId || !token) {
    return jsonError(500, "Seedance 分镜助手配置缺失");
  }

  // 提取 base URL（用于文件上传）
  const baseUrl = apiUrl.replace(/\/v\d+\/.*$/, "");
  console.log(
    `[Seedance Storyboard] API URL: ${apiUrl}, Base URL: ${baseUrl}, Project ID: ${projectId}`,
  );

  // 处理 FormData（支持文件上传）
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch (err) {
    console.error("[Seedance Storyboard] Failed to parse FormData:", err);
    return jsonError(400, "请求格式错误：需要 FormData 格式");
  }

  const query = asNonEmptyString(fd.get("query"));
  const sessionId = asNonEmptyString(fd.get("sessionId")) || `user_${Date.now()}`;
  const fileCount = parseInt(asNonEmptyString(fd.get("file_count")) || "0", 10);

  if (!query) {
    return jsonError(400, "请输入视频创意描述");
  }

  console.log(`[Seedance Storyboard] Query: ${query}`);
  console.log(`[Seedance Storyboard] Session ID: ${sessionId}`);
  console.log(`[Seedance Storyboard] File count: ${fileCount}`);

  try {
    // 构建消息内容（始终是字符串）
    let messageContent = query;

    // 如果有文件，上传到智能体的对象存储
    if (fileCount > 0) {
      const fileUrls: string[] = [];

      for (let i = 0; i < fileCount; i++) {
        const file = fd.get(`file_${i}`);
        if (file instanceof File) {
          try {
            console.log(
              `[Seedance Storyboard] 开始上传 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
            );

            // 构建上传请求
            const uploadFormData = new FormData();
            uploadFormData.append("file", file, file.name);

            // 尝试多个可能的上传端点
            const uploadPaths = ["/upload", "/v1/upload", "/v1/files/upload"];
            let uploadSuccess = false;

            for (const path of uploadPaths) {
              const uploadUrl = `${baseUrl}${path}`;
              console.log(`[Seedance Storyboard] 尝试上传到: ${uploadUrl}`);

              const uploadResponse = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: uploadFormData,
              });

              if (uploadResponse.ok) {
                const uploadData = (await uploadResponse.json()) as {
                  url?: string;
                  file_url?: string;
                  data?: { file_url?: string };
                  id?: string;
                };

                // 灵活提取文件 URL
                const fileUrl =
                  uploadData.url ||
                  uploadData.file_url ||
                  uploadData.data?.file_url ||
                  (uploadData.id
                    ? `https://coze-coding-project.tos.coze.site/${uploadData.id}`
                    : null);

                if (fileUrl) {
                  fileUrls.push(fileUrl);
                  console.log(`[Seedance Storyboard] ✓ 上传成功: ${fileUrl}`);
                  uploadSuccess = true;
                  break;
                }
              }
            }

            if (!uploadSuccess) {
              console.error(`[Seedance Storyboard] 所有上传端点都失败`);
            }
          } catch (err) {
            console.error(`[Seedance Storyboard] 文件上传失败:`, err);
          }
        }
      }

      // 将文件 URL 添加到消息内容
      if (fileUrls.length > 0) {
        messageContent += `\n\n参考图片：${fileUrls.join(", ")}`;
        console.log(`[Seedance Storyboard] 添加了 ${fileUrls.length} 个文件引用`);
      }
    }

    // 构建请求体（标准 Chat API 格式）
    const requestBody = {
      model: projectId,
      messages: [{ role: "user", content: messageContent }],
      stream: true,
      session_id: sessionId,
    };

    console.log(`[Seedance Storyboard] Request body:`, JSON.stringify(requestBody, null, 2));

    // 调用 Coze API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[Seedance Storyboard] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Seedance Storyboard] API error:`, errorText);
      return jsonError(response.status, `API 请求失败: ${errorText}`);
    }

    // 创建 SSE 流
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("无法读取响应流");
          }

          const decoder = new TextDecoder();
          let buffer = "";
          let fullContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log(
                `[Seedance Storyboard] Stream ended naturally, content length: ${fullContent.length}`,
              );
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || !line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);

                // 检测错误
                if (json.error) {
                  console.error(`[Seedance Storyboard] API error:`, json.error);
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ error: json.error.message || "生成失败" })}\n\n`,
                    ),
                  );
                  reader.cancel();
                  return;
                }

                // 处理内容（Coze 格式）
                if (json.type === "answer" && json.content) {
                  const content =
                    typeof json.content === "string" ? json.content : json.content.answer || "";
                  if (content) {
                    fullContent += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                }

                // 处理内容（OpenAI 格式）
                const delta = json.choices?.[0]?.delta;
                if (delta?.content && delta?.role !== "tool") {
                  fullContent += delta.content;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`),
                  );
                }

                // 检测结束（只检测 Coze 明确的终止事件）
                const isTerminal =
                  json.type === "done" ||
                  json.type === "message_end" ||
                  json.event === "done" ||
                  json.finish === true;

                if (isTerminal && delta?.role !== "tool") {
                  console.log(
                    `[Seedance Storyboard] ✓ Stream completed, total content: ${fullContent.length} chars`,
                  );
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content: "", done: true, fullAnswer: fullContent })}\n\n`,
                    ),
                  );
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  reader.cancel();
                  return;
                }
              } catch {
                // 跳过解析错误
                console.warn(`[Seedance Storyboard] Failed to parse SSE event`);
              }
            }
          }

          // 流自然结束
          if (fullContent) {
            console.log(`[Seedance Storyboard] ✓ Stream ended, sending final response`);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ content: "", done: true, fullAnswer: fullContent })}\n\n`,
              ),
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          }
        } catch (error) {
          console.error("[Seedance Storyboard Stream Error]", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    console.error(`[Seedance Storyboard] Error:`, message);
    return jsonError(500, message);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ agentKey: string }> }) {
  try {
    const { agentKey } = await ctx.params;

    console.log(`[API] POST /api/agents/${agentKey}/run`);
    console.log(`[API] Content-Type: ${req.headers.get("content-type")}`);

    // ============================================================================
    // 积分检查和扣费
    // ============================================================================

    // 开发者模式：跳过身份验证和积分检查
    if (env.DEV_MODE_SKIP_AUTH) {
      console.log(`[DEV MODE] Skipping authentication and credit check for ${agentKey}`);

      // 直接调用智能体
      if (agentKey === "data_analyst" || agentKey === "o2") {
        return await handleDataAnalyst(req);
      }
      if (agentKey === "image_editor") {
        return await handleImageEditor(req);
      }
      if (agentKey === "audio_analyzer") {
        return await handleAudioAnalyzer(req);
      }
      if (agentKey === "seedance-storyboard") {
        return await handleSeedanceStoryboard(req);
      }
      if (agentKey !== "portrait") {
        return jsonError(404, `Unknown agentKey: ${agentKey}`);
      }
      // 继续处理 portrait agent...
    }

    const supabase = await createClient();
    const creditManager = new CreditManager();

    // 1. 验证用户登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError(401, "请先登录");
    }

    console.log(`[Credit] User ID: ${user.id}, Agent: ${agentKey}`);

    // 2. 获取操作类型（如果需要）
    let operationType: string | undefined;
    try {
      const formData = await req.clone().formData();
      operationType = formData.get("operation_type") as string | undefined;
    } catch {
      // 如果不是 FormData，忽略
    }

    // 3. 计算所需积分
    let requiredCredits: number;
    try {
      requiredCredits = getAgentPrice(agentKey, operationType);
      console.log(
        `[Credit] Required credits: ${requiredCredits}, Operation type: ${operationType || "default"}`,
      );
    } catch (error) {
      console.error(`[Credit] Unknown agent: ${agentKey}`);
      // 未知智能体，不扣费，继续执行
      requiredCredits = 0;
    }

    // 4. 检查余额并扣除积分
    let transactionId: string | undefined;

    if (requiredCredits > 0) {
      // 检查余额
      const hasSufficientBalance = await creditManager.checkSufficientBalance(
        user.id,
        requiredCredits,
      );

      if (!hasSufficientBalance) {
        const balance = await creditManager.getBalance(user.id);
        console.log(`[Credit] Insufficient balance: ${balance.total} < ${requiredCredits}`);
        return Response.json(
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
        agentKey,
        operationType,
      );

      if (!deductResult.success) {
        console.error(`[Credit] Deduct failed: ${deductResult.error}`);
        return jsonError(500, "积分扣除失败，请稍后重试");
      }

      transactionId = deductResult.transactionId;
      console.log(`[Credit] Deducted ${requiredCredits} credits, transaction ID: ${transactionId}`);
    }

    // ============================================================================
    // 智能体调用（包装在 try-catch 中，失败时退款）
    // ============================================================================

    try {
      // Handle data analyst agent (支持多个 agentKey)
      if (agentKey === "data_analyst" || agentKey === "o2") {
        return await handleDataAnalyst(req);
      }

      // Handle image editor agent
      if (agentKey === "image_editor") {
        return await handleImageEditor(req);
      }

      // Handle audio analyzer agent
      if (agentKey === "audio_analyzer") {
        return await handleAudioAnalyzer(req);
      }

      // Handle seedance storyboard assistant
      if (agentKey === "seedance-storyboard") {
        return await handleSeedanceStoryboard(req);
      }

      // P0: only integrate the portrait agent.
      if (agentKey !== "portrait") {
        return jsonError(404, `Unknown agentKey: ${agentKey}`);
      }

      const botId = env.COZE_PORTRAIT_BOT_ID ?? env.COZE_BOT_ID;
      if (!botId) return jsonError(500, "Missing COZE_PORTRAIT_BOT_ID (or COZE_BOT_ID fallback)");

      const openrouterKey = env.OPENROUTER_API_KEY;
      if (!openrouterKey) {
        return jsonError(500, "Missing OPENROUTER_API_KEY (server-side only)");
      }

      const workflowId = env.COZE_PORTRAIT_WORKFLOW_ID;

      const fd = await req.formData();
      const mode = asNonEmptyString(fd.get("mode")) ?? "txt2img";
      const prompt = asNonEmptyString(fd.get("prompt"));
      if (!prompt) return jsonError(400, "Missing prompt");

      const image = fd.get("image");

      // Prefer workflow execution for image agents: Coze Chat API may not execute workflow-mode agents,
      // and can return tool-call metadata without running the workflow.
      if (workflowId) {
        const params: Record<string, unknown> = { api_key: openrouterKey };

        if (mode === "img_edit") {
          if (!(image instanceof File))
            return jsonError(400, "Missing image (IMG→EDIT requires an upload)");

          const uploaded = await cozeUploadFile({
            file: image,
            filename: image.name || "image.png",
          });

          // Your workflow Start node shows `user_image` (Image) and `user_input` (String).
          // For Image parameters, pass Coze file references. Most workflows accept `{ type: "image", file_id }`.
          params.user_input = prompt;
          params.user_image = { type: "image", file_id: uploaded.fileId };

          // Keep these for backwards compatibility with older drafts, but the workflow should rely on
          // `user_image` as the canonical image input.
          params.edit_instruction = prompt;
        } else {
          params.user_input = prompt;
          params.prompt = prompt;
        }

        const data = await cozeRunWorkflow({ workflowId, parameters: params });

        // Best-effort: extract result_url/image_url from workflow output.
        const raw = data;
        const jsonText = typeof raw === "string" ? raw : JSON.stringify(raw);

        const candidates: string[] = [];
        const scan = (v: unknown) => {
          if (!v) return;
          if (typeof v === "string") {
            candidates.push(v);
            const matches = v.match(/https?:\/\/[^\s"'\\]+/gi) ?? [];
            for (const m of matches) candidates.push(m);
            return;
          }
          if (Array.isArray(v)) {
            for (const x of v) scan(x);
            return;
          }
          if (typeof v === "object") {
            for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
              if (typeof val === "string" && (k.includes("url") || k.includes("image")))
                candidates.push(val);
              scan(val);
            }
          }
        };
        scan(raw);
        if (typeof raw === "string") {
          const t = raw.trim();
          if ((t.startsWith("{") || t.startsWith("[")) && t.length < 100_000) {
            try {
              scan(JSON.parse(t) as unknown);
            } catch {
              // ignore
            }
          }
        }

        const urls = candidates
          .filter((u) => typeof u === "string" && u.startsWith("http"))
          .filter((u) => !u.includes("plugin_icon") && !u.includes("workflow.png"))
          .slice(0, 8);

        return Response.json({
          image_urls: urls,
          text: jsonText,
          ...(process.env.NODE_ENV !== "production"
            ? { debug: { mode: "workflow", data: raw } }
            : {}),
        });
      }

      let additionalMessages: unknown[] = [];

      if (mode === "img_edit") {
        if (!(image instanceof File))
          return jsonError(400, "Missing image (IMG→EDIT requires an upload)");

        const uploaded = await cozeUploadFile({ file: image, filename: image.name || "image.png" });

        // Coze v3 chat supports multimodal content in `object_string` form (JSON-stringified array).
        // The exact schema is model/agent-dependent; we keep it generic and let the agent prompt handle it.
        additionalMessages = [
          {
            role: "user",
            content_type: "object_string",
            content: JSON.stringify([
              { type: "text", text: `模式：图片编辑\n${prompt}` },
              { type: "image", file_id: uploaded.fileId },
            ]),
          },
        ];
      } else {
        additionalMessages = [
          {
            role: "user",
            content_type: "text",
            content: `模式：文生图\n${prompt}`,
          },
        ];
      }

      const userId = crypto.randomUUID();

      const result = await cozeChatStreamToCompletion({
        botId,
        userId,
        additionalMessages,
        parameters: { mode },
        // Provide OpenRouter key to the agent/workflow via variables (do NOT expose to client).
        // Your Coze bot should read this as a prompt/workflow variable (e.g. {{api_key}}).
        customVariables: { api_key: openrouterKey },
      });

      return Response.json({
        image_urls: result.imageUrls,
        text: result.text,
        ...(process.env.NODE_ENV !== "production" && !result.imageUrls.length
          ? {
              debug: {
                note: "No image url extracted; inspect completed_event to update parser or agent output.",
                completed_event: result.rawCompletedEvent ?? null,
                text_preview: result.text?.slice(0, 500) ?? null,
              },
            }
          : {}),
      });
    } catch (agentError) {
      // ============================================================================
      // 智能体调用失败，退还积分
      // ============================================================================

      if (transactionId && requiredCredits > 0) {
        console.log(`[Credit] Agent call failed, refunding ${requiredCredits} credits...`);
        const refundSuccess = await creditManager.refundCredits(transactionId);
        if (refundSuccess) {
          console.log(`[Credit] Refund successful`);
        } else {
          console.error(`[Credit] Refund failed for transaction ${transactionId}`);
        }
      }

      // 重新抛出错误
      throw agentError;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(500, message);
  }
}
