import "server-only";

import { env } from "@/env";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number },
) {
  const { timeoutMs = 25_000, ...rest } = init;

  const maxAttempts = 3;
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...rest, signal: controller.signal });
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts) break;
      await sleep(250 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("fetch failed");
}

function requireCoze() {
  const baseUrl = env.COZE_API_BASE_URL ?? "https://api.coze.cn";
  const token = env.COZE_API_TOKEN;
  if (!token) throw new Error("Missing env.COZE_API_TOKEN");
  return { baseUrl, token };
}

export async function cozeRunWorkflow(args: {
  workflowId: string;
  parameters: Record<string, unknown>;
}) {
  const { baseUrl, token } = requireCoze();

  const res = await fetchWithRetry(`${baseUrl}/v1/workflow/run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow_id: args.workflowId,
      parameters: args.parameters,
    }),
    timeoutMs: 120_000,
  });

  const json = (await res.json().catch(() => null)) as {
    code: number;
    msg: string;
    data?: unknown;
  } | null;

  if (!res.ok || !json || json.code !== 0) {
    const msg = json?.msg || `Coze workflow failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return json.data ?? null;
}

export async function cozeUploadFile(args: {
  file: Blob;
  filename: string;
  baseUrl?: string;
  token?: string;
}) {
  // 使用自定义配置或默认配置
  const baseUrl = args.baseUrl ?? env.COZE_API_BASE_URL ?? "https://api.coze.cn";
  const token = args.token ?? env.COZE_API_TOKEN;

  if (!token) throw new Error("Missing Coze API token");

  const fd = new FormData();
  fd.append("file", args.file, args.filename);

  const res = await fetchWithRetry(`${baseUrl}/v1/files/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
    timeoutMs: 60_000,
  });

  const json = (await res.json().catch(() => null)) as {
    code: number;
    msg: string;
    data?: { id?: string; file_id?: string };
  } | null;

  if (!res.ok || !json || json.code !== 0) {
    const msg = json?.msg || `Coze upload failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  // 支持不同的响应格式
  const id = json.data?.id ?? json.data?.file_id;
  if (!id) throw new Error("Coze upload did not return file id");
  return { fileId: id };
}

function extractImageUrls(text: string) {
  // Accept CDN URLs with querystrings; prioritize common image formats.
  const re = /(https?:\/\/[^\s"'\\]+?\.(?:png|jpe?g|webp)(?:\?[^\s"'\\]*)?)/gi;
  const urls = new Set<string>();
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(text))) urls.add(m[1]);
  return Array.from(urls);
}

function extractAnyUrls(text: string) {
  const re = /(https?:\/\/[^\s"'\\]+)(?=$|[\s"'\\])/gi;
  const urls = new Set<string>();
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(text))) urls.add(m[1]);
  return Array.from(urls);
}

function isLikelyImageUrl(url: string) {
  const u = url.toLowerCase();
  // Never treat Coze plugin/workflow icons as "results".
  if (u.includes("plugin_icon") || u.includes("ocean-cloud-tos/plugin_icon")) return false;
  if (u.endsWith("/workflow.png") || u.includes("workflow.png?")) return false;

  if (/\.(png|jpe?g|webp)(\?|$)/.test(u)) return true;
  // Common image CDNs / paths (heuristic; keeps us from returning random links).
  if (
    u.includes("imagex") ||
    u.includes("byteimg") ||
    u.includes("/image") ||
    u.includes("/images")
  )
    return true;
  if (u.includes("img") && (u.includes("cdn") || u.includes("static"))) return true;
  return false;
}

function isBlockedNonResultUrl(url: string) {
  const u = url.toLowerCase();
  if (u.includes("plugin_icon") || u.includes("ocean-cloud-tos/plugin_icon")) return true;
  if (u.endsWith("/workflow.png") || u.includes("workflow.png?")) return true;
  return false;
}

function maybeParseJsonFromString(s: string): unknown | null {
  const t = s.trim();
  if (!(t.startsWith("{") || t.startsWith("["))) return null;
  if (t.length > 50_000) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return null;
  }
}

function extractValuesByKey(obj: unknown, keys: Set<string>, out: string[]) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const v of obj) extractValuesByKey(v, keys, out);
    return;
  }

  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (keys.has(k) && typeof v === "string") out.push(v);

    if (typeof v === "string") {
      const parsed = maybeParseJsonFromString(v);
      if (parsed) extractValuesByKey(parsed, keys, out);
    } else {
      extractValuesByKey(v, keys, out);
    }
  }
}

function collectStrings(value: unknown, out: string[]) {
  if (!value) return;
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out);
    return;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, out);
  }
}

type CozeStreamResult = {
  text: string | null;
  imageUrls: string[];
  rawCompletedEvent?: unknown;
};

function getEventName(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const rec = obj as Record<string, unknown>;
  const candidates = [rec.event, rec.type, rec.event_type];
  for (const c of candidates) if (typeof c === "string") return c;
  return null;
}

export async function cozeChatStreamToCompletion(args: {
  botId: string;
  userId: string;
  additionalMessages: unknown[];
  parameters?: Record<string, unknown>;
  customVariables?: Record<string, unknown>;
}) {
  const { baseUrl, token } = requireCoze();

  const res = await fetchWithRetry(`${baseUrl}/v3/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bot_id: args.botId,
      user_id: args.userId,
      stream: true,
      additional_messages: args.additionalMessages,
      parameters: args.parameters,
      custom_variables: args.customVariables,
    }),
    timeoutMs: 120_000,
  });

  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new Error(`Coze chat failed: ${res.status} ${res.statusText} ${t}`.slice(0, 1200));
  }

  const decoder = new TextDecoder("utf-8");
  let buf = "";
  let preview = "";

  let completed: unknown | null = null;
  let completedText: string | null = null;
  const urls = new Set<string>();
  const lastMeta: {
    chatId?: string;
    conversationId?: string;
    status?: string;
    lastError?: unknown;
  } = {};

  const reader = res.body.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true }).replace(/\r\n?/g, "\n");
    buf += chunk;
    if (preview.length < 6000) preview += chunk.slice(0, 6000 - preview.length);

    // SSE frames are separated by double newlines.
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);

      const eventName =
        frame
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.startsWith("event:"))
          ?.slice("event:".length)
          .trim() ?? null;

      const dataLines = frame
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice("data:".length).trim());

      for (const payload of dataLines) {
        if (!payload || payload === "[DONE]") continue;

        let obj: unknown;
        try {
          obj = JSON.parse(payload);
        } catch {
          continue;
        }

        const maybeEvent = eventName ?? getEventName(obj);

        // Track meta so we can debug/poll if needed.
        if (obj && typeof obj === "object") {
          const rec = obj as Record<string, unknown>;
          if (typeof rec.id === "string") lastMeta.chatId = rec.id;
          if (typeof rec.conversation_id === "string")
            lastMeta.conversationId = rec.conversation_id;
          if (typeof rec.status === "string") lastMeta.status = rec.status;
          if ("last_error" in rec) lastMeta.lastError = rec.last_error;
        }

        // Collect URLs from any event payload (some agents never embed URLs in the final "completed" event).
        const strs: string[] = [];
        collectStrings(obj, strs);
        const byKey: string[] = [];
        extractValuesByKey(
          obj,
          new Set([
            "image_url",
            "imageUrl",
            "result_url",
            "resultUrl",
            "url",
            "file_url",
            "fileUrl",
            "download_url",
            "downloadUrl",
          ]),
          byKey,
        );
        for (const v of byKey) {
          if (!v.startsWith("http")) continue;
          if (isBlockedNonResultUrl(v)) continue;
          // Key-based URLs should be treated as results even if they have no extension.
          urls.add(v);
        }
        for (const s of strs) {
          for (const u of extractImageUrls(s)) urls.add(u);
          for (const u of extractAnyUrls(s)) if (isLikelyImageUrl(u)) urls.add(u);
        }

        // Coze docs mention `conversation.message.completed` as the final assembled reply.
        if (typeof maybeEvent === "string") {
          const ev = maybeEvent.toLowerCase();
          if (
            ev.includes("completed") &&
            (ev.includes("conversation") || ev.includes("message") || ev.includes("chat"))
          ) {
            completed = { event: maybeEvent, data: obj };

            // Heuristic: longest string is usually the message content.
            const longest = strs.reduce<string | null>(
              (acc, s) => (!acc || s.length > acc.length ? s : acc),
              null,
            );
            completedText = longest;

            reader.cancel().catch(() => {});
            return {
              text: completedText,
              imageUrls: Array.from(urls),
              rawCompletedEvent: completed,
            } satisfies CozeStreamResult;
          }
        }
      }
    }
  }

  // Fallback: try to extract anything from leftovers.
  const strs: string[] = [];
  collectStrings(buf, strs);
  for (const s of strs) {
    for (const u of extractImageUrls(s)) urls.add(u);
    for (const u of extractAnyUrls(s)) if (isLikelyImageUrl(u)) urls.add(u);
  }

  return {
    text: completedText,
    imageUrls: Array.from(urls),
    rawCompletedEvent: completed ?? { sse_preview: preview.slice(0, 6000), last_meta: lastMeta },
  } satisfies CozeStreamResult;
}
