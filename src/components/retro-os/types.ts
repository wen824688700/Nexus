// Retro OS 类型定义

export type PowerState = "off" | "booting" | "on" | "shutting_down";

export type WindowType = "folder" | "article";

export interface Article {
  id: string;
  title: string;
  icon: string;
  date: string;
  category?: string;
  summary: string;
  content: string;
  tags?: string[];
}

export interface WindowInstance {
  id: string;
  type: WindowType;
  data?: Article;
  zIndex: number;
  position?: { top: string; left: string };
}

export interface RetroOSState {
  powerState: PowerState;
  openWindows: WindowInstance[];
  nextZIndex: number;
}

export interface RetroOSActions {
  togglePower: () => void;
  setPowerState: (state: PowerState) => void;
  openWindow: (type: WindowType, data?: Article) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}
