"use client";

import { useState } from "react";
import GenerateCodesForm from "./GenerateCodesForm";
import CodesListTable from "./CodesListTable";
import StatsPanel from "./StatsPanel";

export default function RedemptionCodesAdmin() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCodesGenerated = () => {
    // 触发列表和统计刷新
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* 统计面板 */}
      <StatsPanel refreshTrigger={refreshTrigger} />

      {/* 生成兑换码表单 */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-xl font-semibold">生成兑换码</h2>
        <GenerateCodesForm onSuccess={handleCodesGenerated} />
      </div>

      {/* 兑换码列表 */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-xl font-semibold">兑换码列表</h2>
        <CodesListTable refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
