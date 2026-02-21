import { Suspense } from "react";
import InviteCodeManager from "@/components/admin/InviteCodeManager";

export default function InviteCodesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-white">邀请码管理</h1>

        <Suspense fallback={<div className="text-white/60">加载中...</div>}>
          <InviteCodeManager />
        </Suspense>
      </div>
    </div>
  );
}
