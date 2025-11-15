export interface Source {
    title: string;
    uri: string;
}

export interface GroundedResponse<T> {
    data: T;
    sources: Source[];
}

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

export interface OptimizedProfile {
    bio: string;
    suggestions: {
        profilePicture: string[];
        banner: string[];
        headline: string[];
        general: string[];
    };
}

export interface BrandingConcept {
    name: string;
    description: string;
    audience: string;
    keyComponents: string[];
}

export interface CopywritingResult {
    headline: string;
    body: string;
    cta: string;
}

export interface BrainstormIdea {
    idea: string;
    description: string;
}

export interface EditorialCalendarPost {
    date: string;
    platform: string;
    topic: string;
    contentIdea: string;
}

export interface CompetitorAnalysis {
    competitorName: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
}

export interface FoundCompetitor {
    name: string;
    url: string;
}


export interface VideoAnalysisResult {
    insights: string[];
    copyableContent: {
        title: string;
        description: string;
        hook: string;
    };
}

export interface ScriptScene {
    scene: string;
    visual: string;
    dialogue: string;
}

export interface ScriptResult {
    title: string;
    hook: string;
    script: ScriptScene[];
    cta: string;
}

export interface SeoAnalysisResult {
    primaryKeywords: string[];
    secondaryKeywords: string[];
    commonQuestions: string[];
    suggestedStructure: {
        title: string;
        introduction: string;
        sections: string[];
        conclusion: string;
    };
}

export interface ImageResult {
    base64: string;
    prompt: string;
}

export interface CarouselSlide {
    slideNumber: number;
    title: string;
    content: string;
    imagePrompt: string;
}

export interface CarouselResult {
    mainTitle: string;
    slides: CarouselSlide[];
    cta: string;
}

export type BrandHistories = Record<string, Record<string, HistoryItem[]>>;

export interface HistoryState {
    dna: HistoryItem[];
    brandHistories: BrandHistories;
}


export interface AppContext {
    brandDna: BrandDna | null;
    activeBrandId: string | null;
    history: HistoryState;
    prefillData: { tab: string, data: any } | null;
    setPrefillData: (tab: string, data: any) => void;
    clearPrefillData: () => void;
    setActiveBrand: (item: HistoryItem | null) => void;
    addToHistory: (tab: string, item: HistoryItem) => void;
    removeFromHistory: (tab: string, itemId: string) => void;
    clearHistory: (tab: string) => void;
}

export interface HistoryItem {
    id: string;
    timestamp: string;
    type: string;
    summary: string;
    result: any;
    inputs?: any;
}