"use client";

import { useState } from "react";
import { getRemainingTime } from "@/lib/invite-codes/validation";
import InviteCodeUsageModal from "./InviteCodeUsageModal";

interface InviteCodeListProps {
  codes: any[];
  loading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function InviteCodeList({
  codes,
  loading,
  page,
  total,
  onPageChange,
}: InviteCodeListProps) {
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
  }

  function getStatus(code: any) {
    if (!code.is_active) return { label: "失效", color: "text-gray-400" };
    if (new Date(code.expires_at) < new Date())
      return { label: "已过期", color: "text-red-400" };
    return { label: "有效", color: "text-green-400" };
  }

  if (loading) {
    return <div className="text-center text-white/60">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-white/80">邀请码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/80">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/80">过期时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/80">剩余时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/80">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/80">使用次数</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/80">操作</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => {
                const status = getStatus(code);
                const usageCount = code.invite_code_uses?.[0]?.count || 0;

                return (
                  <tr key={code.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <code className="font-mono text-white">{code.code}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {new Date(code.created_at).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {new Date(code.expires_at).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {getRemainingTime(code.expires_at)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${status.color}`}>{status.label}</td>
                    <td className="px-4 py-3 text-sm text-white/60">{usageCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(code.code)}
                          className="text-sm text-white/60 transition-colors hover:text-white"
                        >
                          复制
                        </button>
                        {usageCount > 0 && (
                          <button
                            onClick={() => setSelectedCodeId(code.id)}
                            className="text-sm text-white/60 transition-colors hover:text-white"
                          >
                            查看使用
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            共 {total} 条记录，第 {page} / {totalPages} 页
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              上一页
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 使用记录模态框 */}
      {selectedCodeId && (
        <InviteCodeUsageModal
          inviteCodeId={selectedCodeId}
          onClose={() => setSelectedCodeId(null)}
        />
      )}
    </div>
  );
}
