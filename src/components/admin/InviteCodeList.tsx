"use client";

import { useState } from "react";
import { Trash2, Ban } from "lucide-react";
import { getRemainingTime } from "@/lib/invite-codes/validation";
import InviteCodeUsageModal from "./InviteCodeUsageModal";
import { deleteInviteCode, deactivateInviteCode } from "@/app/admin/invite-codes/actions";

interface InviteCodeListProps {
  codes: any[];
  loading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function InviteCodeList({
  codes,
  loading,
  page,
  total,
  onPageChange,
  onRefresh,
}: InviteCodeListProps) {
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [deletingCodeId, setDeletingCodeId] = useState<string | null>(null);
  const [deactivatingCodeId, setDeactivatingCodeId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
  }

  async function handleDeactivate(codeId: string) {
    if (deactivatingCodeId) return;
    
    setDeactivatingCodeId(codeId);
    try {
      const result = await deactivateInviteCode(codeId);
      if (result.success) {
        onRefresh();
      } else {
        alert(result.error || "失效失败");
      }
    } catch (error) {
      alert("失效失败，请重试");
    } finally {
      setDeactivatingCodeId(null);
    }
  }

  async function handleDelete(codeId: string) {
    if (deletingCodeId) return;
    
    setDeletingCodeId(codeId);
    try {
      const result = await deleteInviteCode(codeId);
      if (result.success) {
        setConfirmDelete(null);
        onRefresh();
      } else {
        alert(result.error || "删除失败");
      }
    } catch (error) {
      alert("删除失败，请重试");
    } finally {
      setDeletingCodeId(null);
    }
  }

  function getStatus(code: any) {
    if (!code.is_active) return { label: "失效", color: "text-gray-400" };
    // 永久邀请码（expires_at 为 null）
    if (!code.expires_at) return { label: "有效", color: "text-green-400" };
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
                      {code.expires_at
                        ? new Date(code.expires_at).toLocaleString("zh-CN")
                        : "∞"}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {code.expires_at ? getRemainingTime(code.expires_at) : "∞"}
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
                        {code.is_active && (
                          <button
                            onClick={() => handleDeactivate(code.id)}
                            disabled={deactivatingCodeId === code.id}
                            className="text-sm text-orange-400 transition-colors hover:text-orange-300 disabled:opacity-50"
                            title="失效"
                          >
                            {deactivatingCodeId === code.id ? "处理中..." : "失效"}
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(code.id)}
                          disabled={deletingCodeId === code.id}
                          className="text-sm text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                          title="删除"
                        >
                          删除
                        </button>
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

      {/* 删除确认模态框 */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#0a0a0a] p-6">
            <h3 className="mb-4 text-xl font-bold text-white">确认删除</h3>
            <p className="mb-6 text-white/80">
              确定要删除这个邀请码吗？此操作不可恢复。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingCodeId === confirmDelete}
                className="rounded border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingCodeId === confirmDelete}
                className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deletingCodeId === confirmDelete ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
