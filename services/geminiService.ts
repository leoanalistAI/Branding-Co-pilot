import { GoogleGenAI, Type, Modality } from "@google/genai";
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
} from '../types';
import { API_KEY_STORAGE_KEY } from "../App";

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
        // As per docs, responseMimeType and responseSchema are not allowed with googleSearch
        delete config.responseMimeType;
        delete config.responseSchema;
    }
    
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: config
    });
    
    const text = cleanJsonString(response.text ?? '');

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

const getContextPrompt = (appContext: AppContext): string => {
    if (!appContext.brandDna) return '';
    return `
---
CONTEXTO DA MARCA:
Nome da Marca: ${appContext.brandDna.name}
Declaração de Marca: ${appContext.brandDna.brandStatement}
Missão: ${appContext.brandDna.mission}
Pilares de Conteúdo: ${appContext.brandDna.pillars.join(', ')}
Voz e Personalidade: ${appContext.brandDna.voiceAndPersonality}
Palavras-chave: ${appContext.brandDna.keywords.join(', ')}
---
    `;
};

export const generateBrandDnaService = (
    name: string,
    purpose: string,
    expertise: string,
    audience: string,
    transformation: string,
    personality: string
): Promise<GroundedResponse<BrandDna>> => {
    const prompt = `
        Gere um DNA de Marca Pessoal para a seguinte pessoa/projeto. Use o Google Search para se inspirar e trazer informações atualizadas.
        - Nome: ${name}
        - Missão/Propósito: ${purpose}
        - Expertise: ${expertise}
        - Público: ${audience}
        - Transformação Oferecida: ${transformation}
        - Personalidade da Comunicação: ${personality}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "name": (string) O nome da marca/pessoa.
        - "brandStatement": (string) Uma declaração de marca curta e impactante (1-2 frases).
        - "mission": (string) A missão da marca, expandindo o propósito inicial (2-3 frases).
        - "pillars": (string[]) 3 a 5 pilares de conteúdo principais.
        - "voiceAndPersonality": (string) Descreva a voz e personalidade da marca em detalhes (3-4 frases), baseada na personalidade informada.
        - "keywords": (string[]) 5 a 8 palavras-chave e termos relevantes para SEO e busca.
    `;
    return generateContentWithSchema<BrandDna>(prompt, {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            brandStatement: { type: Type.STRING },
            mission: { type: Type.STRING },
            pillars: { type: Type.ARRAY, items: { type: Type.STRING } },
            voiceAndPersonality: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'brandStatement', 'mission', 'pillars', 'voiceAndPersonality', 'keywords']
    }, true);
};

export const generateAudienceAvatarService = (brandDna: BrandDna): Promise<GroundedResponse<AudienceAvatar>> => {
    const prompt = `
        Com base no seguinte DNA de Marca, crie um "Avatar da Audiência" detalhado e específico. Este avatar representa o cliente/seguidor ideal. Use o Google Search para pesquisas sobre o público.
        DNA da Marca:
        ${JSON.stringify(brandDna, null, 2)}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "name": (string) Um nome fictício para o avatar.
        - "description": (string) Uma descrição detalhada do avatar. CRÍTICO: Inclua uma IDADE ESPECÍFICA (ex: 28 anos) e uma PROFISSÃO ou ÁREA DE ESTUDO ESPECÍFICA (ex: 'Desenvolvedor de Software júnior' ou 'Estudante de Marketing Digital').
        - "dreamsAndAspirations": (string[]) 3-4 sonhos e aspirações.
        - "fearsAndFrustrations": (string[]) 3-4 medos e frustrações.
        - "dailyThoughts": (string[]) 3-4 pensamentos que o avatar tem diariamente relacionados ao nicho.
        - "secretWishes": (string[]) 2-3 desejos secretos ou inconfessáveis.
    `;
    return generateContentWithSchema<AudienceAvatar>(prompt, {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            dreamsAndAspirations: { type: Type.ARRAY, items: { type: Type.STRING } },
            fearsAndFrustrations: { type: Type.ARRAY, items: { type: Type.STRING } },
            dailyThoughts: { type: Type.ARRAY, items: { type: Type.STRING } },
            secretWishes: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'description', 'dreamsAndAspirations', 'fearsAndFrustrations', 'dailyThoughts', 'secretWishes']
    }, true);
};

export const optimizeProfileService = async (
    platform: string,
    imageBase64: string,
    imageMimeType: string,
    currentBio: string,
    appContext: AppContext
): Promise<OptimizedProfile> => {
    const ai = getAiClient();
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Analise a imagem do perfil e a biografia para a plataforma ${platform}.
        ${contextPrompt}
        Biografia Atual: "${currentBio}"

        Com base em tudo, forneça:
        1. Uma nova biografia otimizada, focada em clareza, autoridade e chamada para ação.
        2. Sugestões de melhoria para a foto de perfil, banner/capa, título/headline e otimizações gerais.

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
    `;

    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: imageMimeType,
        },
    };

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    bio: { type: Type.STRING },
                    suggestions: {
                        type: Type.OBJECT,
                        properties: {
                            profilePicture: { type: Type.ARRAY, items: { type: Type.STRING } },
                            banner: { type: Type.ARRAY, items: { type: Type.STRING } },
                            headline: { type: Type.ARRAY, items: { type: Type.STRING } },
                            general: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['profilePicture', 'banner', 'headline', 'general']
                    },
                },
                required: ['bio', 'suggestions']
            }
        }
    });
    
    const text = cleanJsonString(response.text ?? '');
    return JSON.parse(text);
};


export const developProductService = (
    productIdea: string,
    appContext: AppContext
): Promise<GroundedResponse<ProductIdea>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Desenvolva a seguinte ideia de produto/serviço em um conceito claro. Use o Google Search para validar a ideia e buscar referências.
        Ideia: "${productIdea}"
        ${contextPrompt}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "name": (string) Um nome atraente para o produto/serviço.
        - "description": (string) Uma descrição detalhada.
        - "targetAudience": (string) Descrição do público-alvo ideal.
        - "keyFeatures": (string[]) 3-5 principais características ou módulos.
    `;
    return generateContentWithSchema<ProductIdea>(prompt, {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'description', 'targetAudience', 'keyFeatures']
    }, true);
};

export const brainstormMarketingIdeasService = (
    topic: string,
    appContext: AppContext
): Promise<GroundedResponse<BrainstormIdea[]>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Gere 5 ideias de marketing criativas e acionáveis sobre o tópico: "${topic}".
        Considere o contexto da marca para alinhar as ideias. Use o Google Search para se inspirar.
        ${contextPrompt}
        
        O resultado deve ser um JSON com uma lista de 5 objetos. CADA OBJETO DEVE CONTER:
        - "idea": (string) Um título curto e criativo para a ideia. NÃO DEIXE VAZIO.
        - "description": (string) Uma descrição detalhada de como implementar a ideia. NÃO DEIXE VAZIO.
        
        NÃO adicione markdown. Garanta que a resposta seja um JSON válido.
    `;
    return generateContentWithSchema<BrainstormIdea[]>(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                idea: { type: Type.STRING },
                description: { type: Type.STRING },
            },
            required: ['idea', 'description']
        }
    }, true);
};

export const createEditorialCalendarService = (
    theme: string,
    platforms: string[],
    numPosts: number,
    appContext: AppContext
): Promise<GroundedResponse<EditorialCalendarPost[]>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Crie um calendário editorial com ${numPosts} posts sobre o tema "${theme}" para as plataformas: ${platforms.join(', ')}.
        ${contextPrompt}
        O resultado deve ser um JSON com um objeto contendo uma chave "posts", que é uma lista de objetos. Para a data, use um formato relativo como "Dia 1", "Dia 2". NÃO adicione markdown.
    `;
    return generateContentWithSchema<{ posts: EditorialCalendarPost[] }>(prompt, {
        type: Type.OBJECT,
        properties: {
            posts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        platform: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        contentIdea: { type: Type.STRING },
                    },
                    required: ['date', 'platform', 'topic', 'contentIdea']
                }
            }
        },
        required: ['posts']
    }, true).then(response => {
        return {
            data: response.data.posts,
            sources: response.sources
        };
    });
};

export const analyzeCompetitorService = (
    competitorUrl: string,
    appContext: AppContext
): Promise<GroundedResponse<CompetitorAnalysis>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Analise o perfil/site no link a seguir: ${competitorUrl}.
        Use o Google Search para coletar informações sobre este perfil e seu nicho.
        Se um contexto de marca for fornecido, use-o para comparar e encontrar oportunidades.
        ${contextPrompt}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "competitorName": (string) O nome do influenciador/marca analisada.
        - "strengths": (string[]) 3-4 pontos fortes.
        - "weaknesses": (string[]) 3-4 pontos fracos.
        - "opportunities": (string[]) 3-4 oportunidades para a *minha* marca com base na análise.
    `;
    return generateContentWithSchema<CompetitorAnalysis>(prompt, {
        type: Type.OBJECT,
        properties: {
            competitorName: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['competitorName', 'strengths', 'weaknesses', 'opportunities']
    }, true);
};

export const findPeersService = (brandDna: BrandDna): Promise<GroundedResponse<FoundCompetitor[]>> => {
    const prompt = `
        Com base no DNA de Marca abaixo, encontre 3-5 peers, influenciadores ou concorrentes diretos relevantes.
        Use o Google Search para a pesquisa.
        DNA da Marca: ${JSON.stringify(brandDna, null, 2)}

        O resultado deve ser um JSON com uma lista de objetos. Cada objeto deve conter o nome do influenciador/peer e a URL principal do seu perfil (LinkedIn, Instagram, Site, etc.). NÃO adicione markdown.
    `;
    return generateContentWithSchema<FoundCompetitor[]>(prompt, {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                url: { type: Type.STRING },
            },
            required: ['name', 'url']
        }
    }, true);
};

export const generateFunnelStageSuggestionsService = (
    stageTitle: string,
    stageDescription: string,
    appContext: AppContext
): Promise<GroundedResponse<FunnelStageSuggestions>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Para a etapa do funil de marketing "${stageTitle}" (${stageDescription}), gere sugestões.
        Use o Google Search para pesquisar táticas e ferramentas relevantes.
        ${contextPrompt}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "tactics": (string[]) 3-4 táticas de marketing.
        - "contentIdeas": (string[]) 3-4 ideias de conteúdo.
        - "tools": (string[]) 2-3 ferramentas úteis.
    `;
    return generateContentWithSchema<FunnelStageSuggestions>(prompt, {
        type: Type.OBJECT,
        properties: {
            tactics: { type: Type.ARRAY, items: { type: Type.STRING } },
            contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['tactics', 'contentIdeas', 'tools']
    }, true);
};

export const analyzeVideoService = async (
    videoBase64: string,
    videoMimeType: string,
    userPrompt: string,
    appContext: AppContext
): Promise<VideoAnalysisResult> => {
    const ai = getAiClient();
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Analise este vídeo com base na seguinte instrução: "${userPrompt}".
        ${contextPrompt}
        Extraia insights de marketing e crie um título, descrição e um gancho viral (hook) para o vídeo.
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
    `;

    const videoPart = {
        inlineData: {
            data: videoBase64,
            mimeType: videoMimeType,
        },
    };

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: { parts: [{ text: prompt }, videoPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    copyableContent: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            hook: { type: Type.STRING },
                        },
                        required: ['title', 'description', 'hook']
                    },
                },
                required: ['insights', 'copyableContent']
            }
        }
    });

    const text = cleanJsonString(response.text ?? '');
    return JSON.parse(text);
};

export const generateCopyService = (
    type: string,
    topic: string,
    toneOfVoice: string,
    appContext: AppContext
): Promise<GroundedResponse<CopywritingResult>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Crie uma copy para "${type}" sobre o tópico/produto "${topic}".
        O tom de voz deve ser ${toneOfVoice}.
        Use o Google Search para referências de copywriting eficaz.
        ${contextPrompt}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "headline": (string) Um título/headline impactante.
        - "body": (string) O corpo do texto, bem estruturado.
        - "cta": (string) Uma chamada para ação (call to action) clara.
    `;
    return generateContentWithSchema<CopywritingResult>(prompt, {
        type: Type.OBJECT,
        properties: {
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
        },
        required: ['headline', 'body', 'cta']
    }, true);
};

export const createScriptService = (
    videoType: string,
    topic: string,
    title: string,
    hook: string,
    appContext: AppContext
): Promise<GroundedResponse<ScriptResult>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Crie um roteiro para um vídeo do tipo "${videoType}".
        Tópico: ${topic}
        ${title ? `Título Sugerido: ${title}` : ''}
        ${hook ? `Gancho Sugerido: ${hook}` : ''}
        ${contextPrompt}
        
        O resultado deve ser um JSON. O roteiro deve ser dividido em cenas com descrição visual e diálogo.
        - "title": (string) Um título otimizado para a plataforma.
        - "hook": (string) O gancho inicial (primeiros 3 segundos).
        - "script": (array) Um array de objetos, onde cada objeto tem "scene", "visual" e "dialogue".
        - "cta": (string) A chamada para ação no final.
    `;
    return generateContentWithSchema<ScriptResult>(prompt, {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            script: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        scene: { type: Type.STRING },
                        visual: { type: Type.STRING },
                        dialogue: { type: Type.STRING },
                    },
                    required: ['scene', 'visual', 'dialogue']
                }
            },
            cta: { type: Type.STRING },
        },
        required: ['title', 'hook', 'script', 'cta']
    }, true);
};

export const generateCarouselService = (
    topic: string,
    platform: string,
    numSlides: number,
    appContext: AppContext
): Promise<GroundedResponse<CarouselResult>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Crie um post de carrossel para ${platform} com ${numSlides} slides sobre o tópico: "${topic}".
        O carrossel deve ter uma narrativa coesa, começando com um gancho forte no primeiro slide e terminando com uma chamada para ação clara.
        Para cada slide, forneça um título, o conteúdo do texto e um prompt detalhado para uma imagem de IA que ilustre o conteúdo.
        ${contextPrompt}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "mainTitle": (string) Um título geral para o post de carrossel.
        - "slides": (array) Um array de ${numSlides} objetos, onde cada objeto representa um slide.
            - "slideNumber": (number) O número do slide.
            - "title": (string) Um título curto e impactante para o slide.
            - "content": (string) O texto principal do slide.
            - "imagePrompt": (string) Um prompt para gerar uma imagem que acompanha o texto do slide.
        - "cta": (string) Uma chamada para ação para o último slide.
    `;

    return generateContentWithSchema<CarouselResult>(prompt, {
        type: Type.OBJECT,
        properties: {
            mainTitle: { type: Type.STRING },
            slides: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        slideNumber: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                    },
                    required: ['slideNumber', 'title', 'content', 'imagePrompt']
                }
            },
            cta: { type: Type.STRING },
        },
        required: ['mainTitle', 'slides', 'cta']
    }, true);
};


export const generateSeoAnalysisService = (
    topic: string,
    appContext: AppContext
): Promise<GroundedResponse<SeoAnalysisResult>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Faça uma análise de SEO completa para o tópico: "${topic}".
        Use o Google Search para encontrar palavras-chave, perguntas relacionadas e analisar a estrutura dos conteúdos que rankeiam bem.
        ${contextPrompt}
        
        O resultado deve ser um JSON com a seguinte estrutura.
        - "primaryKeywords": (string[]) 3-5 palavras-chave primárias.
        - "secondaryKeywords": (string[]) 5-8 palavras-chave secundárias ou de cauda longa.
        - "commonQuestions": (string[]) 4-6 perguntas comuns que as pessoas fazem (People Also Ask).
        - "suggestedStructure": (object) Um objeto com "title", "introduction", "sections" (array de strings) e "conclusion".
    `;
    return generateContentWithSchema<SeoAnalysisResult>(prompt, {
        type: Type.OBJECT,
        properties: {
            primaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            commonQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedStructure: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    introduction: { type: Type.STRING },
                    sections: { type: Type.ARRAY, items: { type: Type.STRING } },
                    conclusion: { type: Type.STRING },
                },
                required: ['title', 'introduction', 'sections', 'conclusion']
            },
        },
        required: ['primaryKeywords', 'secondaryKeywords', 'commonQuestions', 'suggestedStructure']
    }, true);
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

    const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("API did not return an image.");
    }

    return {
        base64: base64ImageBytes,
        prompt: prompt,
    };
};

export const editImageService = async (prompt: string, imageBase64: string, imageMimeType: string): Promise<ImageResult> => {
    const ai = getAiClient();
    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: imageMimeType,
        },
    };
    
    const parts = [imagePart];
    if (prompt) {
        parts.push({ text: prompt } as any);
    }

    const response = await ai.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: { parts: parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content.parts ?? []) {
        if (part.inlineData) {
            const base64ImageBytes: string | undefined = part.inlineData.data;
            if (base64ImageBytes) {
                return {
                    base64: base64ImageBytes,
                    prompt: prompt,
                };
            }
        }
    }

    throw new Error("API did not return an image.");
};