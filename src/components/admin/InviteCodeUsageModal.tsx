"use client";

import { useState, useEffect } from "react";
import { getInviteCodeUsage } from "@/app/admin/invite-codes/actions";

interface UsageRecord {
  id: string;
  used_at: string;
  ip_address: string | null;
  profiles?: {
    username?: string;
    email?: string;
  };
}

interface InviteCodeUsageModalProps {
  inviteCodeId: string;
  onClose: () => void;
}

export default function InviteCodeUsageModal({
  inviteCodeId,
  onClose,
}: InviteCodeUsageModalProps) {
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsage() {
      setLoading(true);
      const result = await getInviteCodeUsage(inviteCodeId);
      if (result.success) {
        setUsage(result.usage || []);
      }
      setLoading(false);
    }
    loadUsage();
  }, [inviteCodeId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-white/10 bg-[#0a0a0a] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">使用记录</h2>
          <button
            onClick={onClose}
            className="text-white/60 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-white/60">加载中...</div>
        ) : usage.length === 0 ? (
          <div className="py-8 text-center text-white/60">暂无使用记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">
                    用户名
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">邮箱</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">
                    使用时间
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">
                    IP 地址
                  </th>
                </tr>
              </thead>
              <tbody>
                {usage.map((record) => (
                  <tr key={record.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-sm text-white">
                      {record.profiles?.username || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {record.profiles?.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {new Date(record.used_at).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {record.ip_address || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
