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


const generateContentWithSchema = async <T>(
    prompt: string,
    schema: any,
    useSearch: boolean = false,
    temperature?: number
): Promise<GroundedResponse<T>> => {
    const ai = getAiClient();
    const config: any = {
        responseMimeType: "application/json",
        responseSchema: schema,
    };

    if (temperature !== undefined) {
        config.temperature = temperature;
    }

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
        Você é um especialista em branding. Gere um DNA de Marca Pessoal estratégico e detalhado para o seguinte perfil. Use o Google Search para se inspirar e trazer informações de mercado atualizadas.

        **Perfil Base:**
        - **Nome:** ${name}
        - **Missão/Propósito:** ${purpose}
        - **Expertise:** ${expertise}
        - **Público:** ${audience}
        - **Transformação Oferecida:** ${transformation}
        - **Personalidade da Comunicação:** ${personality}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown. Seja específico e fuja de respostas genéricas.
        - "name": (string) O nome da marca/pessoa.
        - "brandStatement": (string) Uma declaração de marca curta, memorável e impactante (1-2 frases).
        - "mission": (string) A missão da marca, expandindo o propósito inicial com uma visão clara de futuro (2-3 frases).
        - "pillars": (string[]) 3 a 5 pilares de conteúdo principais que demonstrem a expertise.
        - "voiceAndPersonality": (string) Descreva a voz e personalidade da marca em detalhes (3-4 frases), incluindo o que fazer e o que não fazer.
        - "keywords": (string[]) 5 a 8 palavras-chave e termos de busca relevantes e específicos para o nicho.
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
    }, true, 0.7);
};

export const generateAudienceAvatarService = (brandDna: BrandDna): Promise<GroundedResponse<AudienceAvatar>> => {
    const prompt = `
        Você é um pesquisador de mercado e psicólogo. Com base no DNA de Marca abaixo, crie um "Avatar da Audiência" profundo, detalhado e realista. Este avatar representa o cliente/seguidor ideal em um nível psicográfico. Use o Google Search para pesquisas de público.

        **DNA da Marca:**
        ${JSON.stringify(brandDna, null, 2)}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown. Evite descrições superficiais.
        - "name": (string) Um nome fictício e realista para o avatar.
        - "description": (string) Uma descrição detalhada do avatar. CRÍTICO: Inclua uma IDADE ESPECÍFICA (ex: 28 anos) e uma PROFISSÃO ou ÁREA DE ESTUDO ESPECÍFICA e realista (ex: 'Desenvolvedor de Software júnior em uma startup de fintech' ou 'Estudante de último ano de Marketing Digital focado em SEO').
        - "dreamsAndAspirations": (string[]) 3-4 sonhos e aspirações profundas, ligadas à transformação que a marca oferece.
        - "fearsAndFrustrations": (string[]) 3-4 medos e frustrações específicas que o avatar enfrenta e que a marca pode resolver.
        - "dailyThoughts": (string[]) 3-4 pensamentos recorrentes que o avatar tem diariamente relacionados ao seu problema ou nicho.
        - "secretWishes": (string[]) 2-3 desejos secretos ou inconfessáveis que o avatar hesitaria em admitir publicamente.
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
    }, true, 0.8);
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
        Você é um especialista em otimização de perfis para redes sociais. Analise a imagem de perfil e a biografia para a plataforma ${platform} com base no contexto da marca.
        ${contextPrompt}
        **Biografia Atual:** "${currentBio}"

        **Sua Tarefa:**
        1.  **Reescrever a Biografia:** Crie uma nova biografia otimizada, focada em clareza, autoridade e com uma chamada para ação (CTA) eficaz.
        2.  **Analisar a Imagem:** Forneça sugestões de melhoria para a foto de perfil. A análise deve ser crítica e construtiva.
        3.  **Sugerir Otimizações:** Dê recomendações para outros elementos importantes do perfil, como banner/capa e título/headline.

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown. As sugestões devem ser acionáveis.
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
                    bio: { type: Type.STRING, description: "A nova biografia otimizada." },
                    suggestions: {
                        type: Type.OBJECT,
                        properties: {
                            profilePicture: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sugestões para a foto de perfil." },
                            banner: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sugestões para a imagem de capa/banner." },
                            headline: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sugestões para o título/headline." },
                            general: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Outras otimizações gerais." },
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
        Você é um especialista em desenvolvimento de produtos digitais. Desenvolva a seguinte ideia de produto/serviço em um conceito claro, inovador e memorável. Use o Google Search para validar a ideia e buscar referências de mercado.
        Ideia Central: "${productIdea}"
        ${contextPrompt}

        Seja criativo e evite respostas genéricas. Pense em um ângulo único para o produto.

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "name": (string) Um nome extremamente atraente e único para o produto/serviço.
        - "description": (string) Uma descrição detalhada e persuasiva que vende o valor do produto.
        - "targetAudience": (string) Descrição do público-alvo ideal, com detalhes demográficos e psicográficos.
        - "keyFeatures": (string[]) 3 a 5 principais características ou módulos, descritos de forma que destaquem os benefícios.
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
    }, true, 0.9);
};

export const brainstormMarketingIdeasService = (
    topic: string,
    appContext: AppContext
): Promise<GroundedResponse<BrainstormIdea[]>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Você é um estrategista de marketing digital. Gere 5 ideias de marketing disruptivas e altamente criativas sobre o tópico: "${topic}".
        As ideias devem ser acionáveis e originais, evitando clichês de marketing. Pense fora da caixa.
        Considere o contexto da marca para alinhar as ideias, mas não se limite a ele. Use o Google Search para se inspirar em campanhas de sucesso.
        ${contextPrompt}
        
        O resultado deve ser um JSON com uma lista de 5 objetos. CADA OBJETO DEVE CONTER:
        - "idea": (string) Um título curto, impactante e memorável para a ideia. NÃO DEIXE VAZIO.
        - "description": (string) Uma descrição detalhada de como implementar a ideia, explicando o elemento surpresa ou inovador. NÃO DEIXE VAZIO.
        
        NÃO adicione markdown. Garanta que a resposta seja um JSON válido e que as ideias sejam distintas umas das outras.
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
    }, true, 0.9);
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
        O resultado deve ser um JSON com um objeto contendo uma chave "posts", que é uma lista de objetos. Para a data, use um formato relativo como "Dia 1", "Dia 2".
        NÃO adicione markdown.

        A estrutura do JSON deve ser:
        {
          "posts": [
            {
              "date": "string",
              "platform": "string",
              "topic": "string",
              "contentIdea": "string"
            }
          ]
        }
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
        Você é um analista de mercado sênior. Faça uma análise competitiva profunda e estratégica do perfil/site: ${competitorUrl}.
        Use o Google Search para coletar informações detalhadas sobre este perfil, seu nicho e sua reputação online.
        Se um contexto de marca for fornecido, use-o para identificar vantagens competitivas e oportunidades inexploradas.
        ${contextPrompt}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "competitorName": (string) O nome exato do influenciador/marca analisada.
        - "strengths": (string[]) 3-4 pontos fortes específicos e bem fundamentados.
        - "weaknesses": (string[]) 3-4 pontos fracos ou lacunas de mercado específicas.
        - "opportunities": (string[]) 3-4 oportunidades estratégicas e acionáveis para a *minha* marca, baseadas nas fraquezas do concorrente.
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
    }, true, 0.8);
};

export const findPeersService = (brandDna: BrandDna): Promise<GroundedResponse<FoundCompetitor[]>> => {
    const prompt = `
        Você é um especialista em branding e networking. Com base no DNA de Marca abaixo, encontre 3-5 peers, influenciadores ou concorrentes diretos que sejam altamente relevantes e, talvez, não óbvios.
        Use o Google Search para uma pesquisa aprofundada. Procure por players emergentes ou de nicho.
        DNA da Marca: ${JSON.stringify(brandDna, null, 2)}

        O resultado deve ser um JSON com uma lista de objetos. Cada objeto deve conter o nome do influenciador/peer e a URL principal do seu perfil (LinkedIn, Instagram, Site, etc.). NÃO adicione markdown. Para cada resultado, garanta que seja único e relevante.
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
    }, true, 0.9);
};

export const generateFunnelStageSuggestionsService = (
    stageTitle: string,
    stageDescription: string,
    appContext: AppContext
): Promise<GroundedResponse<FunnelStageSuggestions>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Você é um especialista em funis de marketing. Para a etapa do funil "${stageTitle}" (${stageDescription}), gere sugestões criativas e eficazes.
        Use o Google Search para pesquisar táticas e ferramentas inovadoras e relevantes para esta etapa específica.
        ${contextPrompt}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown. Evite sugestões genéricas.
        - "tactics": (string[]) 3-4 táticas de marketing específicas e detalhadas.
        - "contentIdeas": (string[]) 3-4 ideias de conteúdo originais e alinhadas com a etapa do funil.
        - "tools": (string[]) 2-3 ferramentas úteis e talvez menos conhecidas para executar as táticas.
    `;
    return generateContentWithSchema<FunnelStageSuggestions>(prompt, {
        type: Type.OBJECT,
        properties: {
            tactics: { type: Type.ARRAY, items: { type: Type.STRING } },
            contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['tactics', 'contentIdeas', 'tools']
    }, true, 0.9);
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
        Você é um copywriter sênior. Crie uma copy persuasiva e de alta conversão para "${type}" sobre o tópico/produto "${topic}".
        O tom de voz deve ser estritamente ${toneOfVoice}.
        Use o Google Search para pesquisar frameworks de copywriting (como AIDA, PAS) e aplicá-los.
        ${contextPrompt}
        
        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "headline": (string) Um título/headline magnético e que gere curiosidade.
        - "body": (string) O corpo do texto, bem estruturado com parágrafos curtos e storytelling.
        - "cta": (string) Uma chamada para ação (call to action) clara, urgente e irresistível.
    `;
    return generateContentWithSchema<CopywritingResult>(prompt, {
        type: Type.OBJECT,
        properties: {
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
        },
        required: ['headline', 'body', 'cta']
    }, true, 0.8);
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
        Você é um roteirista profissional para conteúdo digital. Crie um roteiro de vídeo para um(a) "${videoType}".
        **Tópico Central:** ${topic}
        ${title ? `**Título Sugerido:** ${title}` : ''}
        ${hook ? `**Gancho (Hook) Sugerido:** ${hook}` : ''}
        ${contextPrompt}
        
        O resultado deve ser um JSON. O roteiro deve ser detalhado, dividido em cenas com descrições visuais e diálogos/narração.
        - "title": (string) Um título otimizado para a plataforma e para cliques (Click-Through Rate).
        - "hook": (string) O gancho inicial (primeiros 3 segundos), projetado para máxima retenção.
        - "script": (array) Um array de objetos, onde cada objeto tem "scene" (nº da cena), "visual" (descrição visual detalhada) e "dialogue" (diálogo ou narração).
        - "cta": (string) A chamada para ação no final, que seja natural e eficaz.
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
    }, true, 0.8);
};

export const generateCarouselService = (
    topic: string,
    platform: string,
    numSlides: number,
    appContext: AppContext
): Promise<GroundedResponse<CarouselResult>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Você é um designer de conteúdo para mídias sociais. Crie um post de carrossel de ${numSlides} slides para ${platform} sobre o tópico: "${topic}".
        O carrossel deve contar uma história coesa, com um gancho forte no primeiro slide, desenvolvimento nos slides intermediários e uma CTA clara no final.
        Para cada slide, forneça um título, o conteúdo do texto e um prompt de imagem detalhado para IA.
        ${contextPrompt}

        O resultado deve ser um JSON com a seguinte estrutura. NÃO adicione markdown.
        - "mainTitle": (string) Um título geral e impactante para o post.
        - "slides": (array) Um array de ${numSlides} objetos. Cada objeto deve ser um slide.
            - "slideNumber": (number) O número do slide.
            - "title": (string) Um título curto e que gere curiosidade para o slide.
            - "content": (string) O texto principal do slide, conciso e direto.
            - "imagePrompt": (string) Um prompt detalhado para gerar uma imagem visualmente atraente que ilustre o conteúdo do slide.
        - "cta": (string) Uma chamada para ação engajadora para o último slide.
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
    }, true, 0.7);
};


export const generateSeoAnalysisService = (
    topic: string,
    appContext: AppContext
): Promise<GroundedResponse<SeoAnalysisResult>> => {
    const contextPrompt = getContextPrompt(appContext);
    const prompt = `
        Você é um especialista em SEO. Faça uma análise de SEO aprofundada e estratégica para o tópico: "${topic}".
        Use o Google Search para encontrar palavras-chave (primárias e secundárias), perguntas frequentes (People Also Ask) e para analisar a estrutura dos conteúdos de melhor ranking.
        ${contextPrompt}
        
        O resultado deve ser um JSON com a seguinte estrutura. Seja detalhado e estratégico nas sugestões.
        - "primaryKeywords": (string[]) 3-5 palavras-chave primárias de alta intenção de busca.
        - "secondaryKeywords": (string[]) 5-8 palavras-chave secundárias ou de cauda longa para suportar o conteúdo principal.
        - "commonQuestions": (string[]) 4-6 perguntas comuns e específicas que as pessoas fazem sobre o tópico.
        - "suggestedStructure": (object) Um objeto com "title" (um título otimizado para SEO), "introduction" (uma introdução que prenda a atenção e use a palavra-chave principal), "sections" (um array de strings para os subtópicos H2/H3) e "conclusion" (uma conclusão com CTA).
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
    }, true, 0.7);
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