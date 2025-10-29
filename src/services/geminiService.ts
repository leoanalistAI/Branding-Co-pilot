import { GoogleGenerativeAI, Content, Part, GenerateContentResponse } from "@google/generative-ai";
import { BrandDna, AudienceAvatar, FunnelStageSuggestions } from '../types';
import { API_KEY_STORAGE_KEY } from '../App';
import { AppContextType } from "../context/AppContext";

const getApiKey = (): string | null => {
    try {
        return localStorage.getItem(API_KEY_STORAGE_KEY);
    } catch (error) {
        console.error("Could not access localStorage:", error);
        return null;
    }
};

const buildPromptWithContext = (mainPrompt: string, brandDna: BrandDna | null): string => {
    if (!brandDna) {
        return mainPrompt;
    }
    return `
        **Contexto da Marca Pessoal (Usar como base para a resposta):**
        - **Nome:** ${brandDna.name}
        - **Declaração de Marca:** ${brandDna.brandStatement}
        - **Missão:** ${brandDna.mission}
        - **Pilares de Conteúdo:** ${brandDna.pillars.join(', ')}
        - **Voz e Personalidade:** ${brandDna.voiceAndPersonality}
        - **Palavras-chave:** ${brandDna.keywords.join(', ')}
        ---
        **Tarefa Principal:**
        ${mainPrompt}
    `;
};

const callGenerativeApi = async (prompt: string, isJsonMode: boolean = true): Promise<GenerateContentResponse> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API key not found. Please set it in the application settings.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        generationConfig: isJsonMode ? { responseMimeType: "application/json" } : undefined,
    });
    return await model.generateContent(prompt);
};

const parseApiResponse = <T>(response: GenerateContentResponse): { data: T, sources: any[] } => {
    try {
        const text = response.response.text();
        // Basic cleanup for common markdown issues
        const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
        const json = JSON.parse(cleanedText);
        return {
            data: json.data as T,
            sources: json.sources || []
        };
    } catch (error) {
        console.error("Error parsing API response:", error);
        console.error("Raw response text:", response.response.text());
        throw new Error("Failed to parse the response from the AI. The format might be invalid.");
    }
};


// --- Service Functions ---

export const generateBrandDnaService = async (name: string, purpose: string, expertise: string, audience: string, transformation: string, personality: string) => {
    const prompt = `
        Analise as informações a seguir e gere o DNA de uma marca pessoal.
        - Nome/Projeto: ${name}
        - Propósito/Missão: ${purpose}
        - Expertise: ${expertise}
        - Público-alvo: ${audience}
        - Transformação oferecida: ${transformation}
        - Personalidade da comunicação: ${personality}

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "name": "string",
            "brandStatement": "string (uma frase de efeito que resume a marca)",
            "mission": "string (um parágrafo detalhando a missão)",
            "pillars": ["string", "string", "string"],
            "voiceAndPersonality": "string (descreva a voz e personalidade)",
            "keywords": ["string", "string", "string", "string", "string"]
          },
          "sources": []
        }
    `;
    const response = await callGenerativeApi(prompt);
    return parseApiResponse<BrandDna>(response);
};

export const generateAudienceAvatarService = async (brandDna: BrandDna) => {
    const prompt = `
        Com base no DNA da marca a seguir, crie um avatar detalhado da audiência (persona).
        - DNA da Marca: ${JSON.stringify(brandDna)}

        Descreva os sonhos, medos, pensamentos diários e desejos secretos dessa persona.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "name": "string (nome fictício para a persona)",
            "description": "string (um parágrafo descrevendo a persona)",
            "dreamsAndAspirations": ["string", "string"],
            "fearsAndFrustrations": ["string", "string"],
            "dailyThoughts": ["string", "string"],
            "secretWishes": ["string", "string"]
          },
          "sources": []
        }
    `;
    const response = await callGenerativeApi(prompt);
    return parseApiResponse<AudienceAvatar>(response);
};

export const generateProfileOptimizationSuggestionsService = async (platform: string, profileUrl: string, appContext: AppContextType) => {
    const mainPrompt = `
        Analise o perfil no ${platform} (URL: ${profileUrl}) e forneça sugestões de otimização.
        A análise deve focar em: Foto de Perfil, Nome de Usuário/Título, Biografia, e um plano de ação com 3 passos práticos.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "profilePicture": "string (sugestão para a foto)",
            "usernameAndTitle": "string (sugestão para o nome/título)",
            "bio": "string (sugestão para a biografia)",
            "actionPlan": ["string (passo 1)", "string (passo 2)", "string (passo 3)"]
          },
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};

export const generateContentIdeasService = async (topic: string, format: string, appContext: AppContextType) => {
    const mainPrompt = `
        Gere 5 ideias de conteúdo sobre o tópico "${topic}" para o formato "${format}".
        Para cada ideia, forneça um título, uma breve descrição e 3 hashtags relevantes.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": [
            {
              "title": "string",
              "description": "string",
              "hashtags": ["string", "string", "string"]
            }
          ],
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};

export const generateSeoKeywordsService = async (topic: string, appContext: AppContextType) => {
    const mainPrompt = `
        Gere uma lista de palavras-chave de SEO para o tópico "${topic}".
        A lista deve incluir 5 palavras-chave de cauda longa e 5 perguntas comuns que as pessoas fazem sobre o tema.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "longTailKeywords": ["string", "string", "string", "string", "string"],
            "commonQuestions": ["string", "string", "string", "string", "string"]
          },
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};

export const generateImagePromptService = async (idea: string, style: string, appContext: AppContextType) => {
    const mainPrompt = `
        Crie um prompt detalhado em inglês para um gerador de imagens (como Midjourney ou DALL-E) para criar uma imagem baseada na seguinte ideia: "${idea}".
        O estilo desejado é: "${style}".
        O prompt deve ser rico em detalhes, incluindo iluminação, composição, cores e atmosfera. Forneça 3 variações do prompt.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "prompts": ["string (variação 1)", "string (variação 2)", "string (variação 3)"]
          },
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};

export const generateProductConceptService = async (idea: string, appContext: AppContextType) => {
    const mainPrompt = `
        Desenvolva um conceito de produto ou serviço digital com base na seguinte ideia: "${idea}".
        O conceito deve incluir: Nome do Produto, Público-Alvo, Problema Resolvido e 3 Funcionalidades Principais.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "productName": "string",
            "targetAudience": "string",
            "problemSolved": "string",
            "coreFeatures": ["string", "string", "string"]
          },
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};

export const generateMarketingAnglesService = async (productInfo: string, appContext: AppContextType) => {
    const mainPrompt = `
        Gere 3 ângulos de marketing distintos para o seguinte produto/serviço: "${productInfo}".
        Para cada ângulo, forneça um Título Chamativo e um Público-Alvo Específico.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": [
            {
              "angleName": "string (ex: 'O Ângulo da Produtividade')",
              "headline": "string",
              "targetAudience": "string"
            }
          ],
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};

export const generateEditorialCalendarService = async (theme: string, appContext: AppContextType) => {
    const mainPrompt = `
        Crie um calendário editorial de 1 semana (Segunda a Sexta) com base no tema central: "${theme}".
        Para cada dia, sugira um formato de conteúdo e um tópico específico.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": [
            { "day": "Segunda-feira", "format": "string", "topic": "string" },
            { "day": "Terça-feira", "format": "string", "topic": "string" },
            { "day": "Quarta-feira", "format": "string", "topic": "string" },
            { "day": "Quinta-feira", "format": "string", "topic": "string" },
            { "day": "Sexta-feira", "format": "string", "topic": "string" }
          ],
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};

export const generateCompetitorAnalysisService = async (competitorUrl: string, appContext: AppContextType) => {
    const mainPrompt = `
        Faça uma análise de influência do perfil/canal no seguinte link: ${competitorUrl}.
        A análise deve focar em: Pontos Fortes, Pontos Fracos, e 3 Oportunidades de Diferenciação para uma marca concorrente.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "strengths": ["string", "string"],
            "weaknesses": ["string", "string"],
            "opportunities": ["string (oportunidade 1)", "string (oportunidade 2)", "string (oportunidade 3)"]
          },
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};

export const generateFunnelStageSuggestionsService = async (stageTitle: string, stageDescription: string, appContext: AppContextType) => {
    const mainPrompt = `
        Para a etapa do funil de marketing chamada "${stageTitle}" com a descrição "${stageDescription}", gere sugestões.
        Forneça 3 táticas de marketing, 3 ideias de conteúdo e 3 ferramentas úteis para esta etapa.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "tactics": ["string", "string", "string"],
            "contentIdeas": ["string", "string", "string"],
            "tools": ["string", "string", "string"]
          },
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<FunnelStageSuggestions>(response);
};

export const analyzeVideoService = async (videoUrl: string, appContext: AppContextType) => {
    const mainPrompt = `
        Analise o conteúdo do vídeo no seguinte link: ${videoUrl}.
        Extraia os seguintes insights de marketing: a Mensagem Principal, o Público-Alvo pretendido, e a Chamada para Ação (CTA) principal.

        Responda em formato JSON com a seguinte estrutura:
        {
          "data": {
            "mainMessage": "string",
            "targetAudience": "string",
            "mainCTA": "string"
          },
          "sources": []
        }
    `;
    const fullPrompt = buildPromptWithContext(mainPrompt, appContext.brandDna);
    const response = await callGenerativeApi(fullPrompt);
    return parseApiResponse<any>(response);
};