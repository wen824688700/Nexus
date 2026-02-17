'use client';

import { useQuota } from '@/contexts/QuotaContext';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuotaDisplayProps {
  agentKey: string;
  className?: string;
  showLabel?: boolean;
}

export function QuotaDisplay({ agentKey, className = '', showLabel = true }: QuotaDisplayProps) {
  const { checkQuota } = useQuota();
  const quota = checkQuota(agentKey);

  const getStatusColor = () => {
    if (quota.remaining === 999) return 'text-purple-400'; // 开发者
    if (quota.remaining > 5) return 'text-green-400';
    if (quota.remaining > 2) return 'text-yellow-400';
    if (quota.remaining > 0) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusIcon = () => {
    if (quota.remaining === 999) return <Zap className="w-4 h-4" />;
    if (quota.remaining > 2) return <CheckCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (quota.remaining === 999) return '∞';
    return `${quota.remaining}/10`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-xs text-gray-500 font-mono">今日配额</span>
      )}
      <div className={`flex items-center gap-1.5 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="font-mono text-sm font-bold">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}
