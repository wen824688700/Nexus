export type Agent = {
  title: string;
  botId: string;
  icon: string;
  kind:
    | "portrait"
    | "chat"
    | "analysis"
    | "workflow"
    | "promptOptimizer"
    | "imageEditor"
    | "audioAnalyzer"
    | "springFestivalMeme"
    | "seedanceStoryboard";
  status?: "online" | "offline";
};

export type LivePulseItem = {
  time: string;
  text: string;
  url?: string;
  content?: string;
};
