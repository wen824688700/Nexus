"use client";

import { useState } from "react";

interface GenerateCodesFormProps {
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [100, 500, 1000];

export default function GenerateCodesForm({ onSuccess }: GenerateCodesFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setGeneratedCodes([]);
    setLoading(true);

    try {
      const credits = selectedAmount === "custom" ? parseInt(customAmount) : selectedAmount;

      if (isNaN(credits) || credits <= 0) {
        setError("请输入有效的积分数量");
        setLoading(false);
        return;
      }

      if (quantity <= 0 || quantity > 100) {
        setError("生成数量必须在 1-100 之间");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/redemption/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: credits, count: quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "生成失败");
      }

      // 提取 code 字段（后端返回的是对象数组）
      const codeStrings = data.codes.map((item: { code: string }) => item.code);
      setGeneratedCodes(codeStrings);
      setSuccess(`成功生成 ${codeStrings.length} 个兑换码`);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join("\n"));
    setSuccess("已复制所有兑换码到剪贴板");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 面额选择 */}
        <div>
          <label className="mb-2 block text-sm font-medium">积分面额</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setSelectedAmount(amount)}
                className={`rounded-lg border px-4 py-2 transition-colors ${
                  selectedAmount === amount
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                {amount} 积分
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedAmount("custom")}
              className={`rounded-lg border px-4 py-2 transition-colors ${
                selectedAmount === "custom"
                  ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              自定义
            </button>
          </div>
        </div>

        {/* 自定义面额输入 */}
        {selectedAmount === "custom" && (
          <div>
            <label className="mb-2 block text-sm font-medium">自定义积分数量</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="输入积分数量"
              min="1"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        {/* 生成数量 */}
        <div>
          <label className="mb-2 block text-sm font-medium">生成数量</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            max="100"
            className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 focus:border-cyan-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-white/50">最多一次生成 100 个</p>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 px-6 py-3 font-medium transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-gray-600"
        >
          {loading ? "生成中..." : "生成兑换码"}
        </button>
      </form>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/20 p-4 text-green-400">
          {success}
        </div>
      )}

      {/* 生成的兑换码 */}
      {generatedCodes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">生成的兑换码</h3>
            <button
              onClick={copyAllCodes}
              className="rounded bg-white/10 px-3 py-1 text-sm transition-colors hover:bg-white/20"
            >
              复制全部
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-black/50 p-4">
            <div className="space-y-1 font-mono text-sm">
              {generatedCodes.map((code, index) => (
                <div key={index} className="text-cyan-400">
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
