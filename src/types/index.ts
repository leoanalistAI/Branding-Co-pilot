export interface BrandDna {
  name: string;
  brandStatement: string;
  mission: string;
  pillars: string[];
  voiceAndPersonality: string;
  keywords: string[];
}

export interface AudienceAvatar {
  name: string;
  description: string;
  dreamsAndAspirations: string[];
  fearsAndFrustrations: string[];
  dailyThoughts: string[];
  secretWishes: string[];
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  type: string;
  summary: string;
  inputs?: any;
  result: any;
  sources?: Source[];
  avatarSources?: Source[];
}

export interface HistoryState {
  dna: HistoryItem[];
  brandHistories: {
    [brandId: string]: {
      [tabId: string]: HistoryItem[];
    };
  };
}

export interface FunnelStage {
    id: string;
    title: string;
    description: string;
    suggestions?: FunnelStageSuggestions;
    sources?: Source[];
}

export interface FunnelStageSuggestions {
    tactics: string[];
    contentIdeas: string[];
    tools: string[];
}