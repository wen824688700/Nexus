"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { RetroOSState, RetroOSActions, PowerState, WindowType, Article } from "./types";

interface RetroOSContextValue {
  state: RetroOSState;
  actions: RetroOSActions;
}

const RetroOSContext = createContext<RetroOSContextValue | null>(null);

export function RetroOSProvider({ children }: { children: ReactNode }) {
  const [powerState, setPowerState] = useState<PowerState>("off");
  const [openWindows, setOpenWindows] = useState<RetroOSState["openWindows"]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);

  const togglePower = useCallback(() => {
    if (powerState === "off") {
      setPowerState("booting");
    } else if (powerState === "on") {
      setPowerState("shutting_down");
      setTimeout(() => {
        setPowerState("off");
        setOpenWindows([]);
      }, 1500);
    }
  }, [powerState]);

  const openWindow = useCallback(
    (type: WindowType, data?: Article) => {
      const id = `${type}-${Date.now()}`;
      const newWindow = {
        id,
        type,
        data,
        zIndex: nextZIndex,
        position:
          type === "folder" ? { top: "80px", left: "120px" } : { top: "120px", left: "160px" },
      };
      setOpenWindows((prev) => [...prev, newWindow]);
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex],
  );

  const closeWindow = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setOpenWindows((prev) => {
        const window = prev.find((w) => w.id === id);
        if (!window) return prev;
        const others = prev.filter((w) => w.id !== id);
        return [...others, { ...window, zIndex: nextZIndex }];
      });
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex],
  );

  const state: RetroOSState = {
    powerState,
    openWindows,
    nextZIndex,
  };

  const actions: RetroOSActions = {
    togglePower,
    setPowerState,
    openWindow,
    closeWindow,
    focusWindow,
  };

  return <RetroOSContext.Provider value={{ state, actions }}>{children}</RetroOSContext.Provider>;
}

export function useRetroOS() {
  const context = useContext(RetroOSContext);
  if (!context) {
    throw new Error("useRetroOS must be used within RetroOSProvider");
  }
  return context;
}
