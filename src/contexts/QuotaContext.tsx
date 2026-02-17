'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { QuotaManager } from '@/lib/quotaManager';

interface QuotaContextValue {
  isUnlocked: boolean;
  checkQuota: (agentKey: string) => { allowed: boolean; remaining: number; used: number };
  consumeQuota: (agentKey: string) => boolean;
  getTodayUsage: () => Record<string, number>;
  resetSession: () => void;
}

const QuotaContext = createContext<QuotaContextValue | null>(null);

export function QuotaProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return QuotaManager.isUnlocked();
    }
    return false;
  });

  const checkQuota = (agentKey: string) => {
    return QuotaManager.checkQuota(agentKey);
  };

  const consumeQuota = (agentKey: string) => {
    const success = QuotaManager.consumeQuota(agentKey);
    return success;
  };

  const getTodayUsage = () => {
    return QuotaManager.getTodayUsage();
  };

  const resetSession = () => {
    QuotaManager.resetSession();
    setIsUnlocked(false);
  };

  return (
    <QuotaContext.Provider
      value={{
        isUnlocked,
        checkQuota,
        consumeQuota,
        getTodayUsage,
        resetSession,
      }}
    >
      {children}
    </QuotaContext.Provider>
  );
}

export function useQuota() {
  const context = useContext(QuotaContext);
  if (!context) {
    throw new Error('useQuota must be used within QuotaProvider');
  }
  return context;
}
