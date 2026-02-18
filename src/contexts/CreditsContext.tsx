"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";

interface CreditsContextType {
  showInsufficientCreditsModal: (required: number, current: number) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within CreditsProvider");
  }
  return context;
}

interface CreditsProviderProps {
  children: ReactNode;
}

/**
 * 积分管理提供者
 *
 * 提供全局的积分不足提示功能
 * 验证需求：1.7, 17.3
 */
export function CreditsProvider({ children }: CreditsProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [required, setRequired] = useState(0);
  const [current, setCurrent] = useState(0);

  const showInsufficientCreditsModal = useCallback(
    (requiredCredits: number, currentCredits: number) => {
      setRequired(requiredCredits);
      setCurrent(currentCredits);
      setIsModalOpen(true);
    },
    [],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <CreditsContext.Provider value={{ showInsufficientCreditsModal }}>
      {children}
      <InsufficientCreditsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        required={required}
        current={current}
      />
    </CreditsContext.Provider>
  );
}
