export function filterReportContent(content: string): string {
  if (!content) return "";

  const lines = content.split(/\r?\n/);
  const filteredLines: string[] = [];
  const invalidPatterns = [
    /File:\s*\[assets\//i,
    /File:\s*\[output\//i,
    /File:\s*\[.*\.png\]/i,
    /File:\s*\[.*\.jpg\]/i,
    /File:\s*\[.*\.jpeg\]/i,
    /\/path\/to\//i,
    /\/tmp\//i,
    /\[TOOL_ERROR\]/i,
    /创建图表失败/i,
    /读取文件失败/i,
  ];

  for (const line of lines) {
    let shouldSkip = false;
    for (const pattern of invalidPatterns) {
      if (pattern.test(line)) {
        shouldSkip = true;
        break;
      }
    }
    if (!shouldSkip) filteredLines.push(line);
  }

  return filteredLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractValidImages(content: string): Array<{ title: string; url: string }> {
  const images: Array<{ title: string; url: string }> = [];

  // 匹配 Markdown 图片语法：![title](url)
  // 支持 URL 中包含查询参数（如 ?sign=...）
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null = null;

  while ((match = imageRegex.exec(content)) !== null) {
    const title = match[1] || "图表"; // 如果没有标题，使用默认值
    const url = match[2];

    // 验证 URL 格式
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      // 去除 URL 末尾可能的空格或换行符
      const cleanUrl = url.trim();
      images.push({ title: title.trim(), url: cleanUrl });
    }
  }

  return images;
}
