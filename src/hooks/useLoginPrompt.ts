import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * 登录提示 Hook
 *
 * 检查用户登录状态，未登录时显示登录提示
 * 验证需求：18.10
 */
export function useLoginPrompt() {
  const { user } = useAuth();
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const checkAuth = useCallback(
    (callback?: () => void) => {
      if (!user) {
        setIsPromptOpen(true);
        return false;
      }

      if (callback) {
        callback();
      }

      return true;
    },
    [user],
  );

  const closePrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  return {
    isAuthenticated: !!user,
    isPromptOpen,
    checkAuth,
    closePrompt,
  };
}
