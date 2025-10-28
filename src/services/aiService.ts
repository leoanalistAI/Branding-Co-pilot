import { GoogleGenAI, Modality, Type } from "@google/genai";
import {
    AppContext,
    GroundedResponse,
    BrandDna,
    AudienceAvatar,
    OptimizedProfile,
    ProductIdea,
    CopywritingResult,
    BrainstormIdea,
    EditorialCalendarPost,
    CompetitorAnalysis,
    FoundCompetitor,
    FunnelStageSuggestions,
    VideoAnalysisResult,
    ScriptResult,
    SeoAnalysisResult,
    ImageResult,
    CarouselResult,
    Source
} from '@/types';
import { API_KEY_STORAGE_KEY } from "@/src/constants";
import * as Prompts from './ai/prompts';

const getAiClient = (): GoogleGenAI => {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
        throw new Error("Chave de API não encontrada. Por favor, configure sua chave de API.");
    }
    return new GoogleGenAI({ apiKey });
};

const MODEL = 'gemini-2.5-flash';
const PRO_MODEL = 'gemini-2.5-pro';
const IMAGE_MODEL = 'imagen-4.0-generate-001';
const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';

const cleanJsonString = (jsonString: string): string => {
    let cleaned = jsonString.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return cleaned.trim();
};

const generateContentWithSchema = async <T>(prompt: string, schema: any, useSearch: boolean = false): Promise<GroundedResponse<T>> => {
    const ai = getAiClient();
    const config: any = {
        responseMimeType: "application/json",
        responseSchema: schema,
    };

    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
        delete config.responseMimeType;
        delete config.responseSchema;
    }
    
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: config
    });
    
    const text = cleanJsonString(response.text || '');

    let data: T;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON response:", text, e);
        throw new Error("Invalid JSON response from API.");
    }
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
            title: chunk.web?.title || '',
            uri: chunk.web?.uri || '',
        }))
        .filter((s: Source) => s.uri) || [];

    return { data, sources };
};

export const generateBrandDnaService = (name: string, purpose: string, expertise: string, audience: string, transformation: string, personality: string): Promise<GroundedResponse<BrandDna>> => {
    const { prompt, schema } = Prompts.brandDnaPrompt(name, purpose, expertise, audience, transformation, personality);
    return generateContentWithSchema<BrandDna>(prompt, schema, true);
};

export const generateAudienceAvatarService = (brandDna: BrandDna): Promise<GroundedResponse<AudienceAvatar>> => {
    const { prompt, schema } = Prompts.audienceAvatarPrompt(brandDna);
    return generateContentWithSchema<AudienceAvatar>(prompt, schema, true);
};

export const optimizeProfileService = async (platform: string, imageBase64: string, imageMimeType: string, currentBio: string, appContext: AppContext): Promise<OptimizedProfile> => {
    const ai = getAiClient();
    const { prompt, schema } = Prompts.optimizeProfilePrompt(platform, currentBio, appContext);
    const imagePart = { inlineData: { data: imageBase64, mimeType: imageMimeType } };

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: { parts: [{ text: prompt }, imagePart] },
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    
    const text = cleanJsonString(response.text || '');
    return JSON.parse(text);
};

export const developProductService = (productIdea: string, appContext: AppContext): Promise<GroundedResponse<ProductIdea>> => {
    const { prompt, schema } = Prompts.developProductPrompt(productIdea, appContext);
    return generateContentWithSchema<ProductIdea>(prompt, schema, true);
};

export const brainstormMarketingIdeasService = (topic: string, appContext: AppContext): Promise<GroundedResponse<BrainstormIdea[]>> => {
    const { prompt, schema } = Prompts.brainstormMarketingIdeasPrompt(topic, appContext);
    return generateContentWithSchema<BrainstormIdea[]>(prompt, schema, true);
};

export const createEditorialCalendarService = (theme: string, platforms: string[], numPosts: number, appContext: AppContext): Promise<GroundedResponse<EditorialCalendarPost[]>> => {
    const { prompt, schema } = Prompts.createEditorialCalendarPrompt(theme, platforms, numPosts, appContext);
    return generateContentWithSchema<EditorialCalendarPost[]>(prompt, schema, true);
};

export const analyzeCompetitorService = (competitorUrl: string, appContext: AppContext): Promise<GroundedResponse<CompetitorAnalysis>> => {
    const { prompt, schema } = Prompts.analyzeCompetitorPrompt(competitorUrl, appContext);
    return generateContentWithSchema<CompetitorAnalysis>(prompt, schema, true);
};

export const findPeersService = (brandDna: BrandDna): Promise<GroundedResponse<FoundCompetitor[]>> => {
    const { prompt, schema } = Prompts.findPeersPrompt(brandDna);
    return generateContentWithSchema<FoundCompetitor[]>(prompt, schema, true);
};

export const generateFunnelStageSuggestionsService = (stageTitle: string, stageDescription: string, appContext: AppContext): Promise<GroundedResponse<FunnelStageSuggestions>> => {
    const { prompt, schema } = Prompts.generateFunnelStageSuggestionsPrompt(stageTitle, stageDescription, appContext);
    return generateContentWithSchema<FunnelStageSuggestions>(prompt, schema, true);
};

export const analyzeVideoService = async (videoBase64: string, videoMimeType: string, userPrompt: string, appContext: AppContext): Promise<VideoAnalysisResult> => {
    const ai = getAiClient();
    const { prompt, schema } = Prompts.analyzeVideoPrompt(userPrompt, appContext);
    const videoPart = { inlineData: { data: videoBase64, mimeType: videoMimeType } };

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: { parts: [{ text: prompt }, videoPart] },
        config: { responseMimeType: "application/json", responseSchema: schema }
    });

    const text = cleanJsonString(response.text || '');
    return JSON.parse(text);
};

export const generateCopyService = (type: string, topic: string, toneOfVoice: string, appContext: AppContext): Promise<GroundedResponse<CopywritingResult>> => {
    const { prompt, schema } = Prompts.generateCopyPrompt(type, topic, toneOfVoice, appContext);
    return generateContentWithSchema<CopywritingResult>(prompt, schema, true);
};

export const createScriptService = (videoType: string, topic: string, title: string, hook: string, appContext: AppContext): Promise<GroundedResponse<ScriptResult>> => {
    const { prompt, schema } = Prompts.createScriptPrompt(videoType, topic, title, hook, appContext);
    return generateContentWithSchema<ScriptResult>(prompt, schema, true);
};

export const generateCarouselService = (topic: string, platform: string, numSlides: number, appContext: AppContext): Promise<GroundedResponse<CarouselResult>> => {
    const { prompt, schema } = Prompts.generateCarouselPrompt(topic, platform, numSlides, appContext);
    return generateContentWithSchema<CarouselResult>(prompt, schema, true);
};

export const generateSeoAnalysisService = (topic: string, appContext: AppContext): Promise<GroundedResponse<SeoAnalysisResult>> => {
    const { prompt, schema } = Prompts.generateSeoAnalysisPrompt(topic, appContext);
    return generateContentWithSchema<SeoAnalysisResult>(prompt, schema, true);
};

export const generateImageService = async (prompt: string, aspectRatio: string): Promise<ImageResult> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: IMAGE_MODEL,
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("API did not return an image.");
    }

    return { base64: base64ImageBytes, prompt: prompt };
};

export const editImageService = async (prompt: string, imageBase64: string, imageMimeType: string): Promise<ImageResult> => {
    const ai = getAiClient();
    const imagePart = { inlineData: { data: imageBase64, mimeType: imageMimeType } };
    const parts = [imagePart, { text: prompt } as any];

    const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            if (base64ImageBytes) {
                return { base64: base64ImageBytes, prompt: prompt };
            }
        }
    }

    throw new Error("API did not return an image.");
};