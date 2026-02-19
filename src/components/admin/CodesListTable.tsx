"use client";

import { useState, useEffect } from "react";

interface RedemptionCode {
  id: string;
  code: string;
  credits: number;
  expires_at: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  user_email?: string;
}

interface CodesListTableProps {
  refreshTrigger: number;
}

type StatusFilter = "all" | "unused" | "used" | "expired";

export default function CodesListTable({ refreshTrigger }: CodesListTableProps) {
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page, refreshTrigger]);

  const fetchCodes = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/redemption/list?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "加载失败");
      }

      setCodes(data.codes);
      setTotalPages(Math.ceil(data.total / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (code: RedemptionCode): string => {
    if (code.used_by) return "已使用";
    if (new Date(code.expires_at) < new Date()) return "已过期";
    return "未使用";
  };

  const getStatusColor = (code: RedemptionCode): string => {
    if (code.used_by) return "text-gray-400";
    if (new Date(code.expires_at) < new Date()) return "text-red-400";
    return "text-green-400";
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/redemption/export");
      if (!response.ok) {
        throw new Error("导出失败");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redemption-codes-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导出失败");
    }
  };

  return (
    <div className="space-y-4">
      {/* 筛选和导出 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "unused", "used", "expired"] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setStatusFilter(filter);
                setPage(1);
              }}
              className={`rounded-lg border px-4 py-2 transition-colors ${
                statusFilter === filter
                  ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              {filter === "all" && "全部"}
              {filter === "unused" && "未使用"}
              {filter === "used" && "已使用"}
              {filter === "expired" && "已过期"}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="rounded-lg bg-white/10 px-4 py-2 transition-colors hover:bg-white/20"
        >
          导出 TXT
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="py-8 text-center text-white/50">加载中...</div>
      ) : codes.length === 0 ? (
        <div className="py-8 text-center text-white/50">暂无数据</div>
      ) : (
        <>
          {/* 表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left font-medium">兑换码</th>
                  <th className="px-4 py-3 text-left font-medium">积分</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">创建时间</th>
                  <th className="px-4 py-3 text-left font-medium">过期时间</th>
                  <th className="px-4 py-3 text-left font-medium">使用信息</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-cyan-400">{code.code}</td>
                    <td className="px-4 py-3">{code.credits}</td>
                    <td className={`px-4 py-3 ${getStatusColor(code)}`}>{getStatus(code)}</td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {formatDate(code.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {formatDate(code.expires_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {code.used_by ? (
                        <div>
                          <div>{code.user_email || "未知用户"}</div>
                          <div className="text-xs text-white/50">
                            {code.used_at && formatDate(code.used_at)}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg bg-white/10 px-4 py-2 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:bg-white/5"
              >
                上一页
              </button>
              <span className="px-4 py-2">
                第 {page} / {totalPages} 页
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg bg-white/10 px-4 py-2 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:bg-white/5"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
