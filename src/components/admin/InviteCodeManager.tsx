"use client";

import { useState, useEffect } from "react";
import {
  generateInviteCodes,
  getInviteCodes,
  exportInviteCodes,
} from "@/app/admin/invite-codes/actions";
import InviteCodeList from "./InviteCodeList";
import InviteCodeGenerator from "./InviteCodeGenerator";

interface InviteCode {
  id: string;
  code: string;
  created_at: string;
  expires_at: string;
  use_count: number;
}

export default function InviteCodeManager() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function loadCodes() {
      setLoading(true);
      const result = await getInviteCodes(page, 20);
      if (result.success) {
        setCodes(result.codes || []);
        setTotal(result.total || 0);
      }
      setLoading(false);
    }
    loadCodes();
  }, [page]);

  async function handleGenerate(count: number) {
    const result = await generateInviteCodes(count);
    if (result.success) {
      // 重新加载列表
      const refreshResult = await getInviteCodes(page, 20);
      if (refreshResult.success) {
        setCodes(refreshResult.codes || []);
        setTotal(refreshResult.total || 0);
      }
      return result.codes;
    }
    throw new Error(result.error);
  }

  async function handleExport() {
    const result = await exportInviteCodes();
    if (result.success) {
      // 下载文件
      const blob = new Blob([result.content || ""], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invite-codes-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-6">
      {/* 生成器 */}
      <InviteCodeGenerator onGenerate={handleGenerate} />

      {/* 导出按钮 */}
      <button
        onClick={handleExport}
        className="rounded border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
      >
        导出邀请码列表
      </button>

      {/* 邀请码列表 */}
      <InviteCodeList
        codes={codes}
        loading={loading}
        page={page}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
