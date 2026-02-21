"use client";

import { useState } from "react";

interface InviteCodeGeneratorProps {
  onGenerate: (count: number, isPermanent: boolean) => Promise<any>;
}

export default function InviteCodeGenerator({ onGenerate }: InviteCodeGeneratorProps) {
  const [count, setCount] = useState(1);
  const [isPermanent, setIsPermanent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  async function handleGenerate() {
    if (count < 1 || count > 50) {
      setError("生成数量必须在 1-50 之间");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCodes([]);

    try {
      const codes = await onGenerate(count, isPermanent);
      setGeneratedCodes(codes.map((c: any) => c.code));
    } catch (err: any) {
      setError(err.message || "生成失败");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
  }

  function handleCopyAll() {
    navigator.clipboard.writeText(generatedCodes.join("\n"));
  }

  return (
    <div className="rounded border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-xl font-semibold text-white">生成邀请码</h2>

      <div className="mb-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="count" className="mb-2 block text-sm text-white/80">
              生成数量（1-50）
            </label>
            <input
              id="count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              disabled={loading}
              className="w-full rounded border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded bg-white px-6 py-2 font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? "生成中..." : "生成"}
            </button>
          </div>
        </div>

        {/* 永久有效选项 */}
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={isPermanent}
            onChange={(e) => setIsPermanent(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/20 disabled:opacity-50"
          />
          <span>永久有效（无过期时间，无使用次数限制）</span>
        </label>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {generatedCodes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/80">生成成功！</p>
            <button
              onClick={handleCopyAll}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              复制全部
            </button>
          </div>

          <div className="max-h-60 space-y-2 overflow-y-auto rounded border border-white/10 bg-black/20 p-4">
            {generatedCodes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded bg-white/5 px-3 py-2"
              >
                <code className="font-mono text-white">{code}</code>
                <button
                  onClick={() => handleCopy(code)}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
