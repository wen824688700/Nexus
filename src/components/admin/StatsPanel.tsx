"use client";

import { useState, useEffect, useCallback } from "react";

interface Stats {
  totalUsers: number;
  totalCreditsGranted: number;
  totalCreditsConsumed: number;
}

interface StatsPanelProps {
  refreshTrigger: number;
}

export default function StatsPanel({ refreshTrigger }: StatsPanelProps) {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCreditsGranted: 0,
    totalCreditsConsumed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/redemption/stats");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "加载失败");
      }

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger, fetchStats]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* 总用户数 */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-2 text-sm text-white/70">总用户数</div>
        <div className="text-3xl font-bold text-cyan-400">
          {loading ? "..." : (stats.totalUsers || 0).toLocaleString()}
        </div>
      </div>

      {/* 总发放积分 */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-2 text-sm text-white/70">总发放积分</div>
        <div className="text-3xl font-bold text-green-400">
          {loading ? "..." : (stats.totalCreditsGranted || 0).toLocaleString()}
        </div>
      </div>

      {/* 总消耗积分 */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-2 text-sm text-white/70">总消耗积分</div>
        <div className="text-3xl font-bold text-orange-400">
          {loading ? "..." : (stats.totalCreditsConsumed || 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
